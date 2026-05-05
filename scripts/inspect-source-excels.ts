/**
 * 원천 엑셀 파일 구조 확인 스크립트
 * 실행: npm run data:inspect
 */

import * as XLSX from "xlsx";
import * as path from "path";
import * as fs from "fs";

const PROMPT_DIR = path.join(process.cwd(), "prompt");

const FILES = {
  afcUp: "[AFC DB] 상행 열차 재차인원(2026-03-01~2026-04-01).xls",
  afcDown: "[AFC DB] 하행 열차 재차인원(2026-03-01~2026-04-01).xls",
  taas: "[TAAS] 사고분석-지역별.xlsx",
};

const AFC_STATION_COLS_START = 9; // 0-indexed (col 10 = index 9)
const AFC_STATION_COLS_END = 30;  // 0-indexed (col 31 = index 30, exclusive of Tot_Traffic)

function inspectAfcFile(filePath: string, label: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[${label}] ${path.basename(filePath)}`);
  console.log("=".repeat(60));

  if (!fs.existsSync(filePath)) {
    console.log("  ❌ 파일 없음");
    return;
  }
  console.log("  ✅ 파일 존재");

  const wb = XLSX.readFile(filePath, { type: "file", cellDates: false });
  console.log(`  시트: ${wb.SheetNames.join(", ")}`);

  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, raw: true, defval: "" }) as string[][];

  const totalRows = rows.length;
  console.log(`  전체 rows: ${totalRows}`);
  console.log(`  전체 columns: ${rows[0]?.length ?? 0}`);

  const header = rows[0] ?? [];
  console.log(`  Header (1행): ${header.join(" | ")}`);

  const avgRow = rows[1] ?? [];
  console.log(`  2행 (평균값 row, import 제외): ${String(avgRow[0]).slice(0, 40)}...`);

  const dataRows = totalRows - 2; // 1 header + 1 avg
  console.log(`  실제 데이터 rows: ${dataRows}`);

  // Station columns (0-indexed 9..30)
  const stationCols = header.slice(AFC_STATION_COLS_START, AFC_STATION_COLS_END + 1);
  console.log(`  Station columns (10~31열): ${stationCols.join(", ")}`);
  console.log(`  Station columns 수: ${stationCols.length}`);

  // 예상 long format rows
  console.log(`  예상 long format rows: ${dataRows} × ${stationCols.length} = ${dataRows * stationCols.length}`);

  // Sample data row
  if (rows[2]) {
    const sample = rows[2];
    console.log(`  Sample 3행: 영업일=${sample[0]}, 요일=${sample[1]}, 휴일=${sample[2]}, 상하행=${sample[3]}, 출발역=${sample[5]}, 출발시간=${sample[6]}`);
  }
}

function inspectTaasFile(filePath: string) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[TAAS] ${path.basename(filePath)}`);
  console.log("=".repeat(60));

  if (!fs.existsSync(filePath)) {
    console.log("  ❌ 파일 없음");
    return;
  }
  console.log("  ✅ 파일 존재");

  const wb = XLSX.readFile(filePath, { type: "file", cellDates: false });
  console.log(`  시트: ${wb.SheetNames.join(", ")}`);

  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { raw: true, defval: "" });

  console.log(`  전체 데이터 rows: ${rows.length}`);

  if (rows.length > 0) {
    console.log(`  Header: ${Object.keys(rows[0]).join(" | ")}`);
  }

  // 시군구 집계
  const sigunguMap = new Map<string, number>();
  let dayCount = 0, nightCount = 0;
  let fatalTotal = 0, severeTotal = 0, minorTotal = 0, injuryTotal = 0, elderlyTotal = 0;

  for (const row of rows) {
    const sg = String(row["시군구"] ?? "");
    sigunguMap.set(sg, (sigunguMap.get(sg) ?? 0) + 1);

    const dayNight = String(row["주야"] ?? "");
    if (dayNight === "주간") dayCount++;
    else if (dayNight === "야간") nightCount++;

    fatalTotal += Number(row["사망자수"] ?? 0);
    severeTotal += Number(row["중상자수"] ?? 0);
    minorTotal += Number(row["경상자수"] ?? 0);
    injuryTotal += Number(row["부상신고자수"] ?? 0);

    const ageGroup = String(row["가해운전자 연령대"] ?? "");
    if (ageGroup.includes("65세 이상") || ageGroup.includes("65이상")) elderlyTotal++;
  }

  console.log(`  시군구 종류: ${sigunguMap.size}개`);
  for (const [sg, cnt] of sigunguMap) {
    console.log(`    - ${sg}: ${cnt}건`);
  }
  console.log(`  주간: ${dayCount}건, 야간: ${nightCount}건`);
  console.log(`  사망자 합계: ${fatalTotal}, 중상자 합계: ${severeTotal}`);
  console.log(`  경상자 합계: ${minorTotal}, 부상신고자 합계: ${injuryTotal}`);
  console.log(`  가해운전자 65세 이상: ${elderlyTotal}건`);
}

function main() {
  console.log("SilverWay 원천 데이터 파일 구조 확인");
  console.log(`검색 경로: ${PROMPT_DIR}`);

  inspectAfcFile(path.join(PROMPT_DIR, FILES.afcUp), "AFC 상행");
  inspectAfcFile(path.join(PROMPT_DIR, FILES.afcDown), "AFC 하행");
  inspectTaasFile(path.join(PROMPT_DIR, FILES.taas));

  console.log(`\n${"=".repeat(60)}`);
  console.log("inspect 완료");
}

main();
