import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { writeQueryLog } from "@/lib/query-logger";

type Person = { id: number; name: string; company: string; department: string; position: string; created_at: string; updated_at: string };

export async function GET(request: NextRequest) {
  const started = Date.now();
  const search = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const restQuery = "GET /rest/v1/people?select=*&order=created_at.desc";
  const sql = search
    ? "SELECT id, name, company, department, position, created_at, updated_at FROM public.people WHERE name ILIKE [REDACTED] OR company ILIKE [REDACTED] OR department ILIKE [REDACTED] OR position ILIKE [REDACTED] ORDER BY created_at DESC;"
    : "SELECT id, name, company, department, position, created_at, updated_at FROM public.people ORDER BY created_at DESC;";
  await writeQueryLog({ operation: "select", table: "people", query: `${restQuery} [excel-export]`, sql, status: "started" });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });

  try {
    const response = await fetch(`${url}/rest/v1/people?select=*&order=created_at.desc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error((await response.json()).message ?? `HTTP ${response.status}`);

    const people = (await response.json()) as Person[];
    const rows = search ? people.filter((person) => [person.name, person.company, person.department, person.position].some((value) => value.toLowerCase().includes(search))) : people;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "People Manager";
    workbook.created = new Date();
    const sheet = workbook.addWorksheet("인명 목록", { views: [{ state: "frozen", ySplit: 1 }] });
    sheet.columns = [
      { header: "ID", key: "id", width: 10 }, { header: "이름", key: "name", width: 20 },
      { header: "회사", key: "company", width: 24 }, { header: "부서", key: "department", width: 20 },
      { header: "직책", key: "position", width: 18 }, { header: "등록일", key: "created_at", width: 22 },
      { header: "수정일", key: "updated_at", width: 22 },
    ];
    rows.forEach((person) => sheet.addRow({ ...person, created_at: new Date(person.created_at), updated_at: new Date(person.updated_at) }));
    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4361EE" } };
    sheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    sheet.autoFilter = { from: "A1", to: "G1" };
    sheet.getColumn("created_at").numFmt = "yyyy-mm-dd hh:mm";
    sheet.getColumn("updated_at").numFmt = "yyyy-mm-dd hh:mm";

    const buffer = await workbook.xlsx.writeBuffer();
    await writeQueryLog({ operation: "select", table: "people", query: `${restQuery} [excel-export]`, sql, status: "success", duration_ms: Date.now() - started, row_count: rows.length });
    const filename = `people-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(buffer as BodyInit, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "엑셀 생성에 실패했습니다.";
    await writeQueryLog({ operation: "select", table: "people", query: `${restQuery} [excel-export]`, sql, status: "error", duration_ms: Date.now() - started, error: message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
