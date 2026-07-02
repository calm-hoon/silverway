const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const envFile = path.join(process.cwd(), ".env.local");
for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  const k = t.slice(0, i).trim();
  const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
  if (!process.env[k]) process.env[k] = v;
}
async function main() {
  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await client
    .from("analysis_logs")
    .select("id, created_at, report")
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("조회 실패:", error.code, error.message);
    return;
  }
  console.log("최근 analysis_logs", data.length, "건");
  for (const row of data) {
    const generatedBy = row.report?.generatedBy ?? "(없음)";
    const title = row.report?.title ?? "";
    console.log(`- ${row.created_at} generatedBy=${generatedBy} title="${title}"`);
  }
}
main();
