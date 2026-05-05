/**
 * TAAS 원천 엑셀 → accident_areas 집계 JSON 전처리 스크립트
 * 실행: npm run data:preprocess (preprocess-afc.ts와 함께)
 *
 * risk_score는 실제 사고 가능성이 아닌 운전 위험 지수 산정용 지역 사고 패턴 상대 점수다.
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const PROMPT_DIR = path.join(process.cwd(), "prompt");
const OUT_DIR = path.join(process.cwd(), "data", "processed");

const TAAS_FILE = "[TAAS] 사고분석-지역별.xlsx";
const SOURCE_YEAR_START = 2022;
const SOURCE_YEAR_END = 2024;

type AccidentAreaRow = {
  sido: string;
  sigungu: string;
  dong: null;
  region_full_name: string;
  accident_count: number;
  elderly_driver_count: number;
  fatal_count: number;
  severe_count: number;
  minor_count: number;
  injury_report_count: number;
  day_count: number;
  night_count: number;
  risk_score: number;
  source_year_start: number;
  source_year_end: number;
  source_file: string;
  raw_payload: Record<string, unknown>;
};

function parseRegion(regionFull: string): { sido: string; sigungu: string } {
  const parts = regionFull.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { sido: parts[0], sigungu: parts[1] };
  }
  return { sido: regionFull, sigungu: "" };
}

function calcRiskScore(
  accidentCount: number,
  fatalCount: number,
  severeCount: number,
  injuryReportCount: number,
  nightCount: number
): number {
  const raw =
    accidentCount +
    fatalCount * 5 +
    severeCount * 2 +
    injuryReportCount * 0.5 +
    nightCount * 0.5;
  return Math.min(100, Math.max(0, Math.round(raw / 8)));
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  console.log("[preprocess-taas] TAAS 파일 처리 중...");
  const filePath = path.join(PROMPT_DIR, TAAS_FILE);
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ 파일 없음: ${filePath}`);
    process.exit(1);
  }

  const wb = XLSX.readFile(filePath, { type: "file", raw: true, cellDates: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: true, defval: "" });

  console.log(`  원본 rows: ${rows.length}`);

  // 시군구 기준 group by
  type GroupAcc = {
    accident_count: number;
    elderly_driver_count: number;
    fatal_count: number;
    severe_count: number;
    minor_count: number;
    injury_report_count: number;
    day_count: number;
    night_count: number;
    accident_types: Record<string, number>;
    violations: Record<string, number>;
  };

  const groups = new Map<string, GroupAcc>();

  for (const row of rows) {
    const regionFull = String(row["시군구"] ?? "").trim();
    if (!regionFull) continue;

    if (!groups.has(regionFull)) {
      groups.set(regionFull, {
        accident_count: 0,
        elderly_driver_count: 0,
        fatal_count: 0,
        severe_count: 0,
        minor_count: 0,
        injury_report_count: 0,
        day_count: 0,
        night_count: 0,
        accident_types: {},
        violations: {},
      });
    }

    const g = groups.get(regionFull)!;
    g.accident_count++;

    g.fatal_count += Math.round(Number(row["사망자수"] ?? 0) || 0);
    g.severe_count += Math.round(Number(row["중상자수"] ?? 0) || 0);
    g.minor_count += Math.round(Number(row["경상자수"] ?? 0) || 0);
    g.injury_report_count += Math.round(Number(row["부상신고자수"] ?? 0) || 0);

    const dayNight = String(row["주야"] ?? "").trim();
    if (dayNight === "주간") g.day_count++;
    else if (dayNight === "야간") g.night_count++;

    const ageGroup = String(row["가해운전자 연령대"] ?? "").trim();
    if (ageGroup.includes("65세 이상") || ageGroup.includes("65이상")) {
      g.elderly_driver_count++;
    }

    const accidentType = String(row["사고유형"] ?? "").trim();
    if (accidentType) g.accident_types[accidentType] = (g.accident_types[accidentType] ?? 0) + 1;

    const violation = String(row["법규위반"] ?? "").trim();
    if (violation) g.violations[violation] = (g.violations[violation] ?? 0) + 1;
  }

  const result: AccidentAreaRow[] = [];

  for (const [regionFull, g] of groups) {
    const { sido, sigungu } = parseRegion(regionFull);
    const riskScore = calcRiskScore(
      g.accident_count,
      g.fatal_count,
      g.severe_count,
      g.injury_report_count,
      g.night_count
    );

    // raw_payload에는 요약 통계만 저장 (원본 row 전체 아님)
    const rawPayload: Record<string, unknown> = {
      accident_types: g.accident_types,
      top_violations: Object.entries(g.violations)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .reduce<Record<string, number>>((acc, [k, v]) => { acc[k] = v; return acc; }, {}),
    };

    result.push({
      sido,
      sigungu,
      dong: null,
      region_full_name: regionFull,
      accident_count: g.accident_count,
      elderly_driver_count: g.elderly_driver_count,
      fatal_count: g.fatal_count,
      severe_count: g.severe_count,
      minor_count: g.minor_count,
      injury_report_count: g.injury_report_count,
      day_count: g.day_count,
      night_count: g.night_count,
      risk_score: riskScore,
      source_year_start: SOURCE_YEAR_START,
      source_year_end: SOURCE_YEAR_END,
      source_file: TAAS_FILE,
      raw_payload: rawPayload,
    });
  }

  console.log(`  집계 지역 수: ${result.length}`);
  for (const r of result) {
    console.log(`  - ${r.region_full_name}: accident=${r.accident_count}, fatal=${r.fatal_count}, severe=${r.severe_count}, elderly=${r.elderly_driver_count}, risk_score=${r.risk_score}`);
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "accident-areas.json"),
    JSON.stringify(result, null, 0),
    "utf-8"
  );

  fs.writeFileSync(
    path.join(OUT_DIR, "accident-areas.preview.json"),
    JSON.stringify(result, null, 2),
    "utf-8"
  );

  console.log("[preprocess-taas] 완료");
  console.log(`  → data/processed/accident-areas.json (${result.length}건)`);
  console.log(`  → data/processed/accident-areas.preview.json`);
}

main();
