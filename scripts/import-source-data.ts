/**
 * 전처리된 JSON → Supabase import 스크립트
 *
 * 옵션:
 *   --dry-run  실제 DB 작업 없이 건수만 출력
 *   --confirm  기존 source_period/source_file 범위 삭제 후 재삽입
 *
 * 실행:
 *   npm run data:import:dry-run
 *   npm run data:import
 */

import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

const PROCESSED_DIR = path.join(process.cwd(), "data", "processed");
const BATCH_SIZE = 500;
const SOURCE_PERIOD = "2026-03-01~2026-04-01";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const CONFIRM = args.includes("--confirm");

function getEnv(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`[import] 환경변수 누락: ${key}`);
    process.exit(1);
  }
  return v;
}

function loadJson<T>(filename: string): T[] {
  const filePath = path.join(PROCESSED_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[import] 파일 없음: ${filePath}`);
    return [];
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

async function deleteBySourcePeriod(
  client: ReturnType<typeof createClient>,
  table: string,
  sourcePeriod: string
) {
  console.log(`[import] ${table} 기존 source_period='${sourcePeriod}' 삭제 중...`);
  const { error } = await client.from(table).delete().eq("source_period", sourcePeriod);
  if (error) {
    console.error(`[import] ${table} 삭제 실패:`, error.code, error.hint ?? "");
  } else {
    console.log(`[import] ${table} 삭제 완료`);
  }
}

async function deleteBySourceFile(
  client: ReturnType<typeof createClient>,
  table: string,
  sourceFile: string
) {
  console.log(`[import] ${table} 기존 source_file='${sourceFile}' 삭제 중...`);
  const { error } = await client.from(table).delete().eq("source_file", sourceFile);
  if (error) {
    console.error(`[import] ${table} 삭제 실패:`, error.code, error.hint ?? "");
  } else {
    console.log(`[import] ${table} 삭제 완료`);
  }
}

async function batchInsert<T extends object>(
  client: ReturnType<typeof createClient>,
  table: string,
  rows: T[]
): Promise<number> {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await client.from(table).insert(batch);
    if (error) {
      console.error(`[import] ${table} batch ${i}~${i + batch.length} 삽입 실패:`, error.code, error.hint ?? "");
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  [${table}] ${inserted}/${rows.length}`);
    }
  }
  process.stdout.write("\n");
  return inserted;
}

async function importAccidentAreas(client: ReturnType<typeof createClient>) {
  const rows = loadJson<Record<string, unknown>>("accident-areas.json");
  console.log(`[import] accident_areas: ${rows.length}건`);

  if (DRY_RUN) {
    console.log("  [dry-run] 실제 DB 작업 생략");
    return;
  }

  if (CONFIRM && rows.length > 0) {
    const sourceFile = String(rows[0]["source_file"] ?? "");
    if (sourceFile) await deleteBySourceFile(client, "accident_areas", sourceFile);
  }

  const inserted = await batchInsert(client, "accident_areas", rows);
  console.log(`[import] accident_areas 완료: ${inserted}건`);
}

async function importAfcStationLoads(client: ReturnType<typeof createClient>) {
  const rows = loadJson<Record<string, unknown>>("afc-station-loads.json");
  console.log(`[import] afc_station_loads: ${rows.length}건`);

  if (DRY_RUN) {
    console.log("  [dry-run] 실제 DB 작업 생략");
    return;
  }

  if (CONFIRM) {
    await deleteBySourcePeriod(client, "afc_station_loads", SOURCE_PERIOD);
  }

  const inserted = await batchInsert(client, "afc_station_loads", rows);
  console.log(`[import] afc_station_loads 완료: ${inserted}건`);
}

async function importStationAliases(client: ReturnType<typeof createClient>) {
  const rows = loadJson<Record<string, unknown>>("station-aliases.generated.json");
  console.log(`[import] station_aliases: ${rows.length}건`);

  if (DRY_RUN) {
    console.log("  [dry-run] 실제 DB 작업 생략");
    return;
  }

  const { error } = await client
    .from("station_aliases")
    .upsert(rows, { onConflict: "odsay_station_name,afc_station_name" });

  if (error) {
    console.error("[import] station_aliases upsert 실패:", error.code, error.hint ?? "");
  } else {
    console.log(`[import] station_aliases 완료: ${rows.length}건`);
  }
}

async function main() {
  console.log(`[import] 모드: ${DRY_RUN ? "dry-run" : "실제 import"}${CONFIRM ? " + confirm(기존 삭제 후 재삽입)" : ""}`);

  if (DRY_RUN) {
    const afc = loadJson("afc-station-loads.json");
    const taas = loadJson("accident-areas.json");
    const aliases = loadJson("station-aliases.generated.json");
    console.log(`[dry-run] afc_station_loads 예정: ${afc.length}건`);
    console.log(`[dry-run] accident_areas 예정: ${taas.length}건`);
    console.log(`[dry-run] station_aliases 예정: ${aliases.length}건`);
    console.log("[dry-run] 완료 — 실제 DB 작업 없음");
    return;
  }

  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  await importAccidentAreas(client);
  await importAfcStationLoads(client);
  await importStationAliases(client);

  console.log("[import] 전체 완료");
}

main().catch((err) => {
  console.error("[import] 예기치 않은 오류:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
