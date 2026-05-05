/**
 * AFC 원천 엑셀 → long format JSON 전처리 스크립트
 * 실행: npm run data:preprocess (preprocess-taas.ts와 함께)
 *
 * 주의: AFC는 과거 패턴 기반 예측형 혼잡도 산정용이며 실시간 정보가 아닙니다.
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const PROMPT_DIR = path.join(process.cwd(), "prompt");
const OUT_DIR = path.join(process.cwd(), "data", "processed");

const AFC_UP_FILE = "[AFC DB] 상행 열차 재차인원(2026-03-01~2026-04-01).xls";
const AFC_DOWN_FILE = "[AFC DB] 하행 열차 재차인원(2026-03-01~2026-04-01).xls";
const SOURCE_PERIOD = "2026-03-01~2026-04-01";

// 역 컬럼: 0-indexed 9..30 (1열=index0, 10열=index9, 31열=index30)
const STATION_COL_START = 9;
const STATION_COL_END = 30; // inclusive

type AfcLongRow = {
  service_date: string;
  day_of_week: string;
  service_day_type: string;
  direction: string;
  direction_label: string;
  train_no: string;
  origin_station: string;
  departure_time: string;
  destination_station: string;
  arrival_time: string;
  hour: number;
  station_name: string;
  station_name_raw: string;
  onboard_count: number;
  source_period: string;
  source_file: string;
};

function toServiceDate(raw: unknown): string {
  const s = String(raw ?? "").trim();
  if (/^\d{8}$/.test(s)) {
    return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
  }
  return s;
}

function toServiceDayType(raw: unknown): string {
  const v = String(raw ?? "").trim();
  if (v === "평일") return "WEEKDAY";
  if (v === "휴일") return "HOLIDAY";
  return v;
}

function toDirection(raw: unknown): string {
  const v = String(raw ?? "").trim();
  if (v === "상행") return "UP";
  if (v === "하행") return "DOWN";
  return "UNKNOWN";
}

function toStation(raw: unknown): string {
  const v = String(raw ?? "").trim();
  return v.endsWith("역") ? v : `${v}역`;
}

function toTime(raw: unknown): string {
  return String(raw ?? "").trim();
}

function toHour(timeStr: string): number {
  const parts = timeStr.split(":");
  return parts.length > 0 ? parseInt(parts[0], 10) || 0 : 0;
}

function processAfcFile(filePath: string, sourceFile: string): AfcLongRow[] {
  const wb = XLSX.readFile(filePath, { type: "file", raw: true, cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const allRows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  }) as (string | number | null)[][];

  const header = (allRows[0] ?? []).map((h) => String(h ?? "").trim());
  // row index 0 = header, index 1 = 평균값(제외), index 2+ = 데이터
  const dataRows = allRows.slice(2);

  // 역 컬럼명 추출 (0-indexed 9..30)
  const stationCols: string[] = header.slice(STATION_COL_START, STATION_COL_END + 1);

  const directionLabel = String(dataRows[0]?.[3] ?? "").trim();
  const direction = toDirection(directionLabel);

  const result: AfcLongRow[] = [];
  let warnCount = 0;

  for (const row of dataRows) {
    if (!row || row.length === 0) continue;

    const serviceDate = toServiceDate(row[0]);
    const dayOfWeek = String(row[1] ?? "").trim();
    const serviceDayType = toServiceDayType(row[2]);
    const trainNo = String(row[4] ?? "").trim();
    const originStation = toStation(row[5]);
    const departureTime = toTime(row[6]);
    const destinationStation = toStation(row[7]);
    const arrivalTime = toTime(row[8]);
    const hour = toHour(departureTime);

    for (let i = 0; i < stationCols.length; i++) {
      const stationRaw = stationCols[i];
      const rawValue = row[STATION_COL_START + i];

      let onboardCount: number;
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        onboardCount = 0;
      } else {
        const n = Number(rawValue);
        if (!isFinite(n)) {
          warnCount++;
          onboardCount = 0;
        } else {
          onboardCount = Math.round(n);
        }
      }

      result.push({
        service_date: serviceDate,
        day_of_week: dayOfWeek,
        service_day_type: serviceDayType,
        direction,
        direction_label: directionLabel || (direction === "UP" ? "상행" : "하행"),
        train_no: trainNo,
        origin_station: originStation,
        departure_time: departureTime,
        destination_station: destinationStation,
        arrival_time: arrivalTime,
        hour,
        station_name: `${stationRaw}역`,
        station_name_raw: stationRaw,
        onboard_count: onboardCount,
        source_period: SOURCE_PERIOD,
        source_file: sourceFile,
      });
    }
  }

  if (warnCount > 0) {
    console.warn(`  [warn] 숫자 변환 불가 값 ${warnCount}건 → 0 처리`);
  }

  return result;
}

function generateStationAliases(stationRawNames: string[]): { odsay_station_name: string; afc_station_name: string; display_name: string }[] {
  const aliases: { odsay_station_name: string; afc_station_name: string; display_name: string }[] = [];
  const seen = new Set<string>();

  for (const raw of stationRawNames) {
    const withSuffix = `${raw}역`;

    // alias 1: raw 이름 → 역명 (예: 정부청사 → 정부청사역)
    const key1 = `${raw}|${withSuffix}`;
    if (!seen.has(key1)) {
      seen.add(key1);
      aliases.push({ odsay_station_name: raw, afc_station_name: withSuffix, display_name: withSuffix });
    }

    // alias 2: 역명 → 역명 (예: 정부청사역 → 정부청사역)
    const key2 = `${withSuffix}|${withSuffix}`;
    if (!seen.has(key2)) {
      seen.add(key2);
      aliases.push({ odsay_station_name: withSuffix, afc_station_name: withSuffix, display_name: withSuffix });
    }
  }

  return aliases;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("[preprocess-afc] 상행 파일 처리 중...");
  const upRows = processAfcFile(path.join(PROMPT_DIR, AFC_UP_FILE), AFC_UP_FILE);
  console.log(`  상행 long rows: ${upRows.length}`);

  console.log("[preprocess-afc] 하행 파일 처리 중...");
  const downRows = processAfcFile(path.join(PROMPT_DIR, AFC_DOWN_FILE), AFC_DOWN_FILE);
  console.log(`  하행 long rows: ${downRows.length}`);

  const allRows = [...upRows, ...downRows];
  console.log(`  전체 long rows: ${allRows.length}`);

  // station aliases 생성 (상행 기준 역 목록으로 대표 생성)
  const upHeader = XLSX.utils.sheet_to_json<(string | number | null)[]>(
    XLSX.readFile(path.join(PROMPT_DIR, AFC_UP_FILE)).Sheets["Sheet1"],
    { header: 1, raw: true, defval: null }
  )[0] as string[];
  const stationRawNames = (upHeader ?? [])
    .slice(STATION_COL_START, STATION_COL_END + 1)
    .map((h) => String(h ?? "").trim())
    .filter(Boolean);

  const aliases = generateStationAliases(stationRawNames);
  console.log(`  station aliases: ${aliases.length}건`);

  // 전체 JSON 저장
  fs.writeFileSync(
    path.join(OUT_DIR, "afc-station-loads.json"),
    JSON.stringify(allRows, null, 0),
    "utf-8"
  );

  // preview JSON (첫 20건)
  fs.writeFileSync(
    path.join(OUT_DIR, "afc-station-loads.preview.json"),
    JSON.stringify(allRows.slice(0, 20), null, 2),
    "utf-8"
  );

  // station aliases JSON
  fs.writeFileSync(
    path.join(OUT_DIR, "station-aliases.generated.json"),
    JSON.stringify(aliases, null, 2),
    "utf-8"
  );

  console.log("[preprocess-afc] 완료");
  console.log(`  → data/processed/afc-station-loads.json (${allRows.length}건)`);
  console.log(`  → data/processed/afc-station-loads.preview.json (20건 미리보기)`);
  console.log(`  → data/processed/station-aliases.generated.json (${aliases.length}건)`);
}

main();
