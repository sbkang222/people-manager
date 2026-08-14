import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name")?.trim() ?? "";
  const peopleId = Number(request.nextUrl.searchParams.get("peopleId"));
  if (!name || name.length > 200) {
    return NextResponse.json({ error: "조회할 이름이 필요합니다." }, { status: 400 });
  }
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Supabase 환경변수가 설정되지 않았습니다." }, { status: 500 });
  }

  try {
    const params = new URLSearchParams({
      select: "id,people_id,person_name,action,old_data,new_data,changed_at",
      person_name: `eq.${name}`,
      order: "changed_at.desc",
    });
    if (Number.isSafeInteger(peopleId) && peopleId > 0) params.set("people_id", `eq.${peopleId}`);
    const response = await fetch(`${supabaseUrl}/rest/v1/people_history?${params}`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const body = await response.json();
    if (!response.ok) {
      const message = body?.code === "PGRST205"
        ? "people_history 테이블이 없습니다. 먼저 supabase/people_history.sql을 실행해 주세요."
        : body?.message ?? `HTTP ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status });
    }
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "히스토리를 불러오지 못했습니다." }, { status: 500 });
  }
}
