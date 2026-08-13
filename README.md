# People Manager

Next.js, TypeScript, Supabase PostgreSQL로 만든 인명 관리 관리자 화면입니다.

## Supabase 설정

1. Supabase SQL Editor에서 `supabase/schema.sql`을 실행합니다.
2. `.env.example`을 복사해 `.env.local`을 만듭니다.
3. Supabase 프로젝트 URL과 publishable key를 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

`.env.local`은 Git에서 제외됩니다. 브라우저 앱에는 service role key를 사용하지 마세요.

## 실행

Windows에서는 `start-dev.cmd`를 더블클릭하거나 터미널에서 `.\start-dev.cmd`를 실행한 후 `http://localhost:3000`을 여세요.

## English

People Manager is built with Next.js, TypeScript, and Supabase PostgreSQL.

Run `supabase/schema.sql` in the Supabase SQL Editor, copy `.env.example` to `.env.local`, and enter the project URL and publishable key. Never use a service-role key in the browser. Start the app by double-clicking `start-dev.cmd` or running `.\start-dev.cmd`.
