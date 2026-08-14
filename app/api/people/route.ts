import { NextRequest, NextResponse } from "next/server";
import { writeQueryLog } from "@/lib/query-logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function configurationError() {
  return NextResponse.json({ error: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
}

async function callSupabase(pathname: string, init: RequestInit) {
  if (!supabaseUrl || !supabaseKey) return null;
  return fetch(`${supabaseUrl}/rest/v1/${pathname}`, {
    ...init,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}

async function finish(operation: "select" | "insert" | "update" | "delete", query: string, started: number, response: Response, recordId?: number) {
  const text = await response.text();
  let body: unknown = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  const rowCount = Array.isArray(body) ? body.length : undefined;
  const error = response.ok ? undefined : typeof body === "object" && body && "message" in body ? String(body.message) : `HTTP ${response.status}`;
  await writeQueryLog({ operation, table: "people", query, status: response.ok ? "success" : "error", duration_ms: Date.now() - started, record_id: recordId, row_count: rowCount, error });
  return NextResponse.json(response.ok ? body : { error }, { status: response.status });
}

export async function GET() {
  const started = Date.now();
  const query = "GET /rest/v1/people?select=*&order=created_at.desc";
  await writeQueryLog({ operation: "select", table: "people", query, status: "started" });
  const response = await callSupabase("people?select=*&order=created_at.desc", { method: "GET" });
  if (!response) return configurationError();
  return finish("select", query, started, response);
}

export async function POST(request: NextRequest) {
  const started = Date.now();
  const query = "POST /rest/v1/people";
  await writeQueryLog({ operation: "insert", table: "people", query, status: "started" });
  const response = await callSupabase("people", { method: "POST", headers: { Prefer: "return=representation" }, body: JSON.stringify(await request.json()) });
  if (!response) return configurationError();
  return finish("insert", query, started, response);
}

export async function PATCH(request: NextRequest) {
  const started = Date.now();
  const id = Number(request.nextUrl.searchParams.get("id"));
  const query = `PATCH /rest/v1/people?id=eq.${id}`;
  await writeQueryLog({ operation: "update", table: "people", query, status: "started", record_id: id });
  if (!Number.isFinite(id)) return NextResponse.json({ error: "올바른 id가 필요합니다." }, { status: 400 });
  const response = await callSupabase(`people?id=eq.${id}`, { method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify(await request.json()) });
  if (!response) return configurationError();
  return finish("update", query, started, response, id);
}

export async function DELETE(request: NextRequest) {
  const started = Date.now();
  const id = Number(request.nextUrl.searchParams.get("id"));
  const query = `DELETE /rest/v1/people?id=eq.${id}`;
  await writeQueryLog({ operation: "delete", table: "people", query, status: "started", record_id: id });
  if (!Number.isFinite(id)) return NextResponse.json({ error: "올바른 id가 필요합니다." }, { status: 400 });
  const response = await callSupabase(`people?id=eq.${id}`, { method: "DELETE", headers: { Prefer: "return=representation" } });
  if (!response) return configurationError();
  return finish("delete", query, started, response, id);
}
