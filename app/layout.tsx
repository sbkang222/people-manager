import type { Metadata } from "next";
import "./globals.css";
import "./supabase.css";
export const metadata: Metadata = { title: "People Manager", description: "인명관리 관리자 애플리케이션" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
