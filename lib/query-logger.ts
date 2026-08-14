import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

type QueryLog = {
  operation: "select" | "insert" | "update" | "delete";
  table: "people";
  status: "started" | "success" | "error";
  duration_ms?: number;
  record_id?: number;
  row_count?: number;
  error?: string;
};

export async function writeQueryLog(entry: QueryLog) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), ...entry });
  console.info(`[query-log] ${line}`);

  if (process.env.VERCEL) return;

  try {
    const logDirectory = path.join(process.cwd(), "logs");
    await mkdir(logDirectory, { recursive: true });
    await appendFile(path.join(logDirectory, "query.log"), `${line}\n`, "utf8");
  } catch (error) {
    console.error("[query-log] Failed to write local log file", error);
  }
}
