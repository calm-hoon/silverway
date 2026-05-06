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

// .env.local 자동 로드 (tsx는 Next.js와 달리 .env.local을 자동으로 읽지 않음)
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

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

// migration 001 스키마로 다운그레이드 (source_file 등 migration002 컬럼 미존재 시)
function toAccidentAreaV1(row: Record<string, unknown>): Record<string, unknown> {
  return {
    sido: row.sido,
    sigungu: row.sigungu,
    dong: row.dong ?? null,
    accident_count: row.accident_count ?? 0,
    elderly_driver_count: row.elderly_driver_count ?? 0,
    fatal_count: row.fatal_count ?? 0,
    severe_count: row.severe_count ?? 0,
    risk_score: row.risk_score ?? 0,
    source_year: row.source_year_end ?? row.source_year_start ?? null,
  };
}

function toAfcStationLoadV1(row: Record<string, unknown>): Record<string, unknown> {
  return {
    service_day_type: row.service_day_type ?? "WEEKDAY",
    day_of_week: row.day_of_week ?? null,
    direction: row.direction ?? "UP",
    train_no: row.train_no ?? null,
    station_name: row.station_name ?? "",
    departure_time: row.departure_time ?? null,
    arrival_time: row.arrival_time ?? null,
    hour: row.hour ?? 0,
    onboard_count: row.onboard_count ?? 0,
    source_date: row.service_date ?? null,
  };
}

// 단일 row probe로 스키마 버전 감지
async function detectSchemaVersion(
  client: ReturnType<typeof createClient>,
  table: string,
  v2Row: Record<string, unknown>
): Promise<"v2" | "v1"> {
  const { error } = await client.from(table).insert([v2Row]);
  if (error && error.code === "PGRST204") {
    console.log(`  [import] ${table}: migration 002 미적용 → v1 스키마로 전환`);
    return "v1";
  }
  if (error) {
    console.error(`  [import] ${table} probe 오류:`, error.code, error.hint ?? "");
  } else {
    // probe row 제거 (id 없이 insert됐으니 delete 불가 → 그냥 놔둠, 1건)
  }
  return "v2";
}

async function importAccidentAreas(client: ReturnType<typeof createClient>) {
  const rows = loadJson<Record<string, unknown>>("accident-areas.json");
  console.log(`[import] accident_areas: ${rows.length}건`);

  if (DRY_RUN) {
    console.log("  [dry-run] 실제 DB 작업 생략");
    return;
  }

  if (rows.length === 0) return;

  // 스키마 감지: v2 row로 probe
  const schemaVersion = await detectSchemaVersion(client, "accident_areas", rows[0]);
  const payload = schemaVersion === "v1" ? rows.map(toAccidentAreaV1) : rows;

  if (CONFIRM && schemaVersion === "v2") {
    const sourceFile = String(rows[0]["source_file"] ?? "");
    if (sourceFile) await deleteBySourceFile(client, "accident_areas", sourceFile);
  }

  // probe 성공 시 rows[0]는 이미 삽입됨 — 나머지만 삽입
  const remaining = schemaVersion === "v2" ? payload.slice(1) : payload;
  let inserted = schemaVersion === "v2" ? 1 : 0;
  inserted += await batchInsert(client, "accident_areas", remaining);
  console.log(`[import] accident_areas 완료: ${inserted}건 (스키마: ${schemaVersion})`);
}

async function importAfcStationLoads(client: ReturnType<typeof createClient>) {
  const rows = loadJson<Record<string, unknown>>("afc-station-loads.json");
  console.log(`[import] afc_station_loads: ${rows.length}건`);

  if (DRY_RUN) {
    console.log("  [dry-run] 실제 DB 작업 생략");
    return;
  }

  if (rows.length === 0) return;

  // 스키마 감지
  const schemaVersion = await detectSchemaVersion(client, "afc_station_loads", rows[0]);
  const payload = schemaVersion === "v1" ? rows.map(toAfcStationLoadV1) : rows;

  if (CONFIRM && schemaVersion === "v2") {
    await deleteBySourcePeriod(client, "afc_station_loads", SOURCE_PERIOD);
  }

  const remaining = schemaVersion === "v2" ? payload.slice(1) : payload;
  let inserted = schemaVersion === "v2" ? 1 : 0;
  inserted += await batchInsert(client, "afc_station_loads", remaining);
  console.log(`[import] afc_station_loads 완료: ${inserted}건 (스키마: ${schemaVersion})`);
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
