import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle,
  WidthType, ShadingType, VerticalAlign, TableLayoutType,
  convertInchesToTwip,
} from "docx";
import { writeFileSync } from "fs";

// ─── 폰트·색상 ────────────────────────────────────────────────
const KO_FONT   = "함초롱바탕";
const BLUE_DARK  = "1F3080";
const BLUE_MID   = "2B4DA0";
const GRAY_BG    = "F2F4FA";
const GRAY_TEXT  = "222222";
const WHITE      = "FFFFFF";
const LIGHT_BLUE = "EBF0FB";
const GREEN_BG   = "EAF7EE";

// ─── 공통 헬퍼 ───────────────────────────────────────────────
function r(text, opts = {}) {
  return new TextRun({ text, font: KO_FONT, color: GRAY_TEXT, size: 21, ...opts });
}

function blank(after = 80) {
  return new Paragraph({ children: [r("")], spacing: { before: 0, after } });
}

function h1(text) {
  return new Paragraph({
    children: [r(text, { size: 26, bold: true, color: WHITE })],
    shading: { type: ShadingType.SOLID, color: BLUE_DARK },
    spacing: { before: 0, after: 160 },
    indent: { left: 200 },
  });
}

function secTitle(text) {
  return new Paragraph({
    children: [r(text, { size: 24, bold: true, color: BLUE_DARK })],
    border: { bottom: { style: BorderStyle.THICK, color: BLUE_DARK, size: 6 } },
    spacing: { before: 320, after: 160 },
  });
}

function subTitle(text) {
  return new Paragraph({
    children: [r(text, { size: 22, bold: true, color: BLUE_DARK })],
    spacing: { before: 200, after: 100 },
  });
}

function subHead(text) {
  return new Paragraph({
    children: [r("▸ " + text, { size: 21, bold: true, color: BLUE_DARK })],
    spacing: { before: 140, after: 70 },
    indent: { left: 280 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [r(text, { size: 21, ...opts })],
    spacing: { before: 50, after: 50 },
    indent: { left: 460 },
  });
}

function bull1(text, bold = false) {
  return new Paragraph({
    children: [r("● " + text, { size: 21, bold, color: bold ? BLUE_DARK : GRAY_TEXT })],
    spacing: { before: 70, after: 50 },
    indent: { left: 360 },
  });
}

function bull2(text) {
  return new Paragraph({
    children: [r("▪ " + text, { size: 20 })],
    spacing: { before: 40, after: 40 },
    indent: { left: 640 },
  });
}

// 박스 섹션
function boxed(paragraphs) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 6, color: "AABBDD" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "AABBDD" },
      left:   { style: BorderStyle.SINGLE, size: 6, color: "AABBDD" },
      right:  { style: BorderStyle.SINGLE, size: 6, color: "AABBDD" },
    },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.SOLID, color: "F8F9FD" },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        children: paragraphs,
      })],
    })],
  });
}

// ─── 셀·테이블 헬퍼 ──────────────────────────────────────────
function c(text, { shade = false, bold = false, size = 20, color = GRAY_TEXT,
  w = null, align = AlignmentType.CENTER, vAlign = VerticalAlign.CENTER } = {}) {
  const opts = {
    shading: shade ? { type: ShadingType.SOLID, color: GRAY_BG } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    verticalAlign: vAlign,
    children: [new Paragraph({ alignment: align, children: [r(text, { size, bold, color })] })],
  };
  if (w) opts.width = w;
  return new TableCell(opts);
}

function hc(text, w = null) {
  return c(text, { shade: true, bold: true, size: 19, color: BLUE_DARK, w });
}

function tbl(rows, widths = null) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:     { style: BorderStyle.SINGLE, size: 4, color: "AABBDD" },
      bottom:  { style: BorderStyle.SINGLE, size: 4, color: "AABBDD" },
      left:    { style: BorderStyle.SINGLE, size: 4, color: "AABBDD" },
      right:   { style: BorderStyle.SINGLE, size: 4, color: "AABBDD" },
      insideH: { style: BorderStyle.SINGLE, size: 2, color: "CCDDEE" },
      insideV: { style: BorderStyle.SINGLE, size: 2, color: "CCDDEE" },
    },
    rows: rows.map((row) => new TableRow({ children: row })),
  });
}

// ─── 참가자 정보 테이블 ───────────────────────────────────────
const infoTable = tbl([
  [
    c("출품작명", { shade: true, bold: true, size: 19, w: { size: 15, type: WidthType.PERCENTAGE } }),
    c("SilverWay — AI 기반 고령 운전자 이동 안전 의사결정 지원 서비스", {
      bold: true, size: 19, align: AlignmentType.LEFT, w: { size: 85, type: WidthType.PERCENTAGE },
    }),
  ],
  [
    c("팀  명\n(대표자)", { shade: true, bold: true, size: 19, w: { size: 15, type: WidthType.PERCENTAGE } }),
    new TableCell({
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      width: { size: 35, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [r("", { size: 18 })] })],
    }),
    c("지원분야", { shade: true, bold: true, size: 19, w: { size: 15, type: WidthType.PERCENTAGE } }),
    new TableCell({
      shading: { type: ShadingType.SOLID, color: BLUE_MID },
      margins: { top: 80, bottom: 80, left: 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      width: { size: 35, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [r("제품·서비스 개발", { size: 19, bold: true, color: WHITE })] })],
    }),
  ],
  [
    c("소  속", { shade: true, bold: true, size: 19, w: { size: 15, type: WidthType.PERCENTAGE } }),
    c("", { w: { size: 85, type: WidthType.PERCENTAGE }, align: AlignmentType.LEFT }),
  ],
  [
    c("대표 연락처", { shade: true, bold: true, size: 19, w: { size: 15, type: WidthType.PERCENTAGE } }),
    c("휴대폰", { shade: true, size: 18, w: { size: 12, type: WidthType.PERCENTAGE } }),
    c("", { w: { size: 30, type: WidthType.PERCENTAGE }, align: AlignmentType.LEFT }),
    c("E-mail", { shade: true, size: 18, w: { size: 12, type: WidthType.PERCENTAGE } }),
    c("magicuear@gmail.com", { size: 18, w: { size: 31, type: WidthType.PERCENTAGE }, align: AlignmentType.LEFT }),
  ],
]);

// ─── 차별성 비교표 ────────────────────────────────────────────
const compareTable = tbl([
  [hc("구분", { size: 14, type: WidthType.PERCENTAGE }), hc("카카오맵 / 네이버맵", { size: 22, type: WidthType.PERCENTAGE }), hc("T맵 운전점수", { size: 22, type: WidthType.PERCENTAGE }), hc("SilverWay", { size: 22, type: WidthType.PERCENTAGE })],
  [c("분석 시점",   { shade: true, bold: true }), c("이동 중 (실시간)"),  c("이동 후 (사후)"),  c("이동 전 (사전)",         { bold: true, color: BLUE_DARK })],
  [c("고령자 특화", { shade: true, bold: true }), c("없음"),             c("없음"),           c("60/70/80대 연령 보정",    { bold: true, color: BLUE_DARK })],
  [c("공공데이터",  { shade: true, bold: true }), c("지도 기반만"),      c("없음"),           c("TAAS+AFC+기상청 3종 융합",{ bold: true, color: BLUE_DARK })],
  [c("대중교통 대안",{ shade: true, bold: true }), c("경로 제시만"),     c("해당 없음"),      c("혼잡도 예측 포함 대안 제시",{ bold: true, color: BLUE_DARK })],
  [c("가족 소통",   { shade: true, bold: true }), c("없음"),             c("없음"),           c("AI 감성 편지 자동 생성",   { bold: true, color: BLUE_DARK })],
  [c("면허 반납",   { shade: true, bold: true }), c("없음"),             c("없음"),           c("의사결정 보조 안내 제공",  { bold: true, color: BLUE_DARK })],
]);

// ─── 공공데이터 활용 목록표 ───────────────────────────────────
const dataTable = tbl([
  [hc("데이터명", { size: 18, type: WidthType.PERCENTAGE }), hc("출처·제공기관", { size: 18, type: WidthType.PERCENTAGE }), hc("기간", { size: 12, type: WidthType.PERCENTAGE }), hc("활용 방식", { size: 30, type: WidthType.PERCENTAGE }), hc("위험지수 반영", { size: 22, type: WidthType.PERCENTAGE })],
  [
    c("TAAS 교통사고분석\n지역별 집계",    { align: AlignmentType.LEFT }),
    c("도로교통공단\n(공공데이터포털)",    { align: AlignmentType.LEFT }),
    c("2022~2024"),
    c("시군구별 사고건수·치사수·중상수·야간건수 → riskScore 산출 후 DB 적재", { align: AlignmentType.LEFT }),
    c("최대 50점 (50%)", { bold: true, color: BLUE_DARK }),
  ],
  [
    c("AFC 열차 재차인원\n(대전 1호선)",  { align: AlignmentType.LEFT }),
    c("대전교통공사\n(afcdb.djtc.kr)",   { align: AlignmentType.LEFT }),
    c("2026.03~04"),
    c("역·시간대·방향별 승차인원 → ratio 공식으로 혼잡도 산출", { align: AlignmentType.LEFT }),
    c("혼잡도 독립 제공"),
  ],
  [
    c("기상청 단기예보\n(VilageFcstInfoService_2.0)", { align: AlignmentType.LEFT }),
    c("기상청\n(공공데이터포털)",         { align: AlignmentType.LEFT }),
    c("실시간 API"),
    c("위경도 → 격자(nx,ny) 변환 → PTY·SKY·WSD·POP·TMP 조회", { align: AlignmentType.LEFT }),
    c("최대 15점 (15%)", { bold: true, color: BLUE_DARK }),
  ],
  [
    c("ODsay 대중교통\n경로 API",         { align: AlignmentType.LEFT }),
    c("ODsay Lab\n(api.odsay.com)",      { align: AlignmentType.LEFT }),
    c("실시간 API"),
    c("출·도착 좌표 → 최적 경로·소요시간·환승횟수 조회", { align: AlignmentType.LEFT }),
    c("경로 독립 제공"),
  ],
]);

// ─── API 참고문헌 표 ─────────────────────────────────────────
const apiTable = tbl([
  [hc("구분",{ size: 10, type: WidthType.PERCENTAGE }), hc("명칭",{ size: 28, type: WidthType.PERCENTAGE }), hc("제공기관",{ size: 18, type: WidthType.PERCENTAGE }), hc("접속 경로",{ size: 22, type: WidthType.PERCENTAGE }), hc("활용 내용",{ size: 22, type: WidthType.PERCENTAGE })],
  [
    c("원시\n데이터", { shade: true, bold: true }),
    c("TAAS 교통사고분석 지역별 집계", { align: AlignmentType.LEFT }),
    c("도로교통공단", { align: AlignmentType.LEFT }),
    c("taas.koroad.or.kr", { align: AlignmentType.LEFT }),
    c("65세 이상 가해 운전자 사고 데이터 (2022~2024), 시군구별 집계 → Supabase 적재", { align: AlignmentType.LEFT }),
  ],
  [
    c("원시\n데이터", { shade: true, bold: true }),
    c("AFC 열차 재차인원 (대전 1호선)", { align: AlignmentType.LEFT }),
    c("대전교통공사", { align: AlignmentType.LEFT }),
    c("afcdb.djtc.kr", { align: AlignmentType.LEFT }),
    c("역별·시간대별 승차 데이터 (2026.03~04) → Supabase 적재", { align: AlignmentType.LEFT }),
  ],
  [
    c("실시간\nAPI", { shade: true, bold: true }),
    c("기상청 단기예보 조회서비스\n(getVilageFcst)", { align: AlignmentType.LEFT }),
    c("기상청\n공공데이터포털", { align: AlignmentType.LEFT }),
    c("data.go.kr", { align: AlignmentType.LEFT }),
    c("위경도→격자 변환 후 PTY·SKY·WSD·POP·TMP 실시간 조회", { align: AlignmentType.LEFT }),
  ],
  [
    c("실시간\nAPI", { shade: true, bold: true }),
    c("ODsay 대중교통 경로 API\n(searchPubTransPathT)", { align: AlignmentType.LEFT }),
    c("ODsay Lab", { align: AlignmentType.LEFT }),
    c("api.odsay.com", { align: AlignmentType.LEFT }),
    c("출·도착 좌표 → 최적 대중교통 경로·소요시간·환승횟수", { align: AlignmentType.LEFT }),
  ],
  [
    c("실시간\nAPI", { shade: true, bold: true }),
    c("Kakao Local API\n(keyword.json)", { align: AlignmentType.LEFT }),
    c("카카오", { align: AlignmentType.LEFT }),
    c("dapi.kakao.com", { align: AlignmentType.LEFT }),
    c("장소명 검색 → 위경도 좌표 반환", { align: AlignmentType.LEFT }),
  ],
  [
    c("클라이언트\nSDK", { shade: true, bold: true }),
    c("Kakao Map JavaScript SDK", { align: AlignmentType.LEFT }),
    c("카카오", { align: AlignmentType.LEFT }),
    c("dapi.kakao.com", { align: AlignmentType.LEFT }),
    c("출·도착지 마커 지도 시각화", { align: AlignmentType.LEFT }),
  ],
  [
    c("AI API", { shade: true, bold: true }),
    c("Claude Haiku\n(claude-haiku-4-5-20251001)", { align: AlignmentType.LEFT }),
    c("Anthropic", { align: AlignmentType.LEFT }),
    c("api.anthropic.com", { align: AlignmentType.LEFT }),
    c("분석 결과 기반 가족 공유 감성 편지 자동 생성", { align: AlignmentType.LEFT }),
  ],
  [
    c("인프라", { shade: true, bold: true }),
    c("Supabase (PostgreSQL)", { align: AlignmentType.LEFT }),
    c("Supabase", { align: AlignmentType.LEFT }),
    c("supabase.com", { align: AlignmentType.LEFT }),
    c("TAAS·AFC 데이터 적재 및 분석 시 실시간 조회", { align: AlignmentType.LEFT }),
  ],
]);

// ─── 기대효과 표 ─────────────────────────────────────────────
const effectTable = tbl([
  [hc("효과 영역", { size: 18, type: WidthType.PERCENTAGE }), hc("구체적 기대효과", { size: 55, type: WidthType.PERCENTAGE }), hc("관련 이해관계자", { size: 27, type: WidthType.PERCENTAGE })],
  [c("시민 안전", { shade: true, bold: true }), c("공공데이터 기반 고위험 경로·시간대 파악으로 고령 운전자 사고 예방 기여", { align: AlignmentType.LEFT }), c("고령 운전자")],
  [c("가족 소통", { shade: true, bold: true }), c("AI 생성 감성 편지로 면허 반납 대화를 자연스럽게 시작 → 가족 간 갈등 감소", { align: AlignmentType.LEFT }), c("40~50대 자녀")],
  [c("이동권 보장", { shade: true, bold: true }), c("대중교통 경로 + 혼잡도 예측 제공 → 고령 시민의 대중교통 이용 자신감 향상", { align: AlignmentType.LEFT }), c("교통 취약계층")],
  [c("정책 연계", { shade: true, bold: true }), c("면허 반납 인센티브 제도 활용률 제고, 대전시 고령 친화 도시 액션플랜 직접 부합", { align: AlignmentType.LEFT }), c("대전광역시\n행정안전부")],
  [c("데이터 실증", { shade: true, bold: true }), c("TAAS·AFC·기상청 공공데이터를 실제 서비스에 적용한 구체적 활용 사례 창출", { align: AlignmentType.LEFT }), c("도로교통공단\n대전교통공사")],
  [c("ESG 가치", { shade: true, bold: true }), c("고령자 안전·이동권 보장, 가족 소통 강화를 통한 사회적 가치 실현", { align: AlignmentType.LEFT }), c("지역 사회 전반")],
]);

// ─── 운전위험지수 산출 공식 행 ─────────────────────────────────
const riskTable = tbl([
  [hc("요인", { size: 22, type: WidthType.PERCENTAGE }), hc("산출 기준", { size: 48, type: WidthType.PERCENTAGE }), hc("최대 배점", { size: 15, type: WidthType.PERCENTAGE }), hc("데이터 출처", { size: 15, type: WidthType.PERCENTAGE })],
  [c("지역 사고 패턴", { shade: true, bold: true }), c("TAAS riskScore (사고건수·치사수·중상수·야간건수 가중 합산) → 0~50점 정규화", { align: AlignmentType.LEFT }), c("50점"), c("TAAS")],
  [c("시간대 위험",   { shade: true, bold: true }), c("심야·새벽(22~6시) 15점 / 저녁 12점 / 퇴근 10점 / 출근 8점 / 오전·낮 5점", { align: AlignmentType.LEFT }), c("15점"), c("직접 산출")],
  [c("기상 조건",     { shade: true, bold: true }), c("PTY(강수형태)·POP(강수확률)·WSD(풍속) 기반 0~100점 환산 후 15점 정규화", { align: AlignmentType.LEFT }), c("15점"), c("기상청 API")],
  [c("연령대 보정",   { shade: true, bold: true }), c("60대 4점 / 70대 7점 / 80대 이상 10점 (반응속도·야간시력 저하 감안)", { align: AlignmentType.LEFT }), c("10점"), c("사용자 입력")],
  [c("경로 지역 보정",{ shade: true, bold: true }), c("경로 지역 특성 가중치 반영", { align: AlignmentType.LEFT }), c("10점"), c("직접 산출")],
  [
    new TableCell({
      shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      columnSpan: 2,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [r("위험 등급: 70점 이상 HIGH(높음) / 40~69점 MEDIUM(보통) / 39점 이하 LOW(낮음)", { bold: true, size: 19, color: BLUE_DARK })] })],
    }),
    new TableCell({
      shading: { type: ShadingType.SOLID, color: LIGHT_BLUE },
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      columnSpan: 2,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [r("총합 최대 100점", { bold: true, size: 19, color: BLUE_DARK })] })],
    }),
  ],
]);

// ─── 문서 본문 구성 ───────────────────────────────────────────
const children = [

  // ── 제목 ──
  h1("서식 3   제안서 양식"),
  blank(160),

  // ── I. 참가자 정보 ──
  secTitle("Ⅰ. 참가자 정보"),
  infoTable,
  blank(240),

  // ════════════════════════════════
  // Ⅱ. 세부 내용
  // ════════════════════════════════
  secTitle("Ⅱ. 세부 내용"),
  blank(60),

  // ── 가. 기획 상세 내용 ──
  subTitle("가. 기획 상세 내용"),
  boxed([

    bull1("기획 배경 및 필요성", true),
    blank(40),

    subHead("고령 운전자 사고의 구조적 증가"),
    body("통계청 자료에 따르면 65세 이상 고령 인구는 2024년 전체 인구의 19%를 넘어섰으며, 운전면허 소지 고령자 수도 매년 증가하고 있습니다."),
    body("도로교통공단 TAAS 데이터 기반으로 대전 대덕구의 3년(2022~2024)간 65세 이상 가해 운전자 사고는 510건이며, 이 중 사망 9건·중상 97건이 집계되었습니다."),

    subHead("면허 반납 의사결정의 어려움"),
    body("면허 반납은 이동 자유와 직결되어 당사자에게 심리적 저항이 큽니다. 가족 입장에서도 객관적 데이터 없이는 설득력 있는 대화가 불가능하며, '위험하다'는 막연한 말 대신 지역 사고 패턴·기상·시간대를 조합한 구체적 수치로 대화를 시작할 도구가 필요합니다."),

    subHead("공공데이터 활용 공백"),
    body("TAAS 사고 집계 데이터, 대전 도시철도 AFC 재차인원 데이터, 기상청 단기예보 등 고품질 공공데이터가 이미 존재합니다. 그러나 이 세 데이터를 결합해 개인의 이동 상황에 맞춘 의사결정 지원을 제공하는 서비스는 현재 없습니다. SilverWay는 이 공백을 채우기 위해 기획되었습니다."),
    blank(80),

    bull1("기획 목적", true),
    blank(40),
    body("AI와 공공데이터를 결합하여, 고령 운전자가 특정 이동에 대한 안전 수준을 객관적으로 이해하고 가족과 함께 이동 방법을 자연스럽게 논의할 수 있는 의사결정 지원 환경을 제공합니다."),
    bull2("운전 위험 지수 정량화 → 감정이 아닌 데이터로 대화"),
    bull2("대중교통 대안 제시 → 운전 포기가 아닌 이동 선택지 확장"),
    bull2("AI 가족 공유 리포트 자동 생성 → 면허 반납 대화의 자연스러운 시작점"),
    blank(80),

    bull1("구체적 기획 상세 내용", true),
    blank(40),
    subHead("서비스 이용 흐름 (5단계)"),
    bull2("① 출발지·도착지 입력 — Kakao Local API로 장소 검색 및 위경도 좌표 반환"),
    bull2("② 출발 시각·연령대 선택 — 60/70/80대 연령 보정 적용"),
    bull2("③ 분석 시작 — 서버에서 TAAS·AFC·기상청·ODsay 4개 데이터소스 병렬 조회"),
    bull2("④ 결과 화면 — 운전 위험 지수, 대중교통 경로, 혼잡도, 날씨, 지도 통합 표시"),
    bull2("⑤ AI 리포트 — Claude Haiku가 가족 공유용 감성 편지 자동 생성 → 클립보드 복사"),
    blank(60),

    subHead("기술 구현 현황"),
    bull2("프론트엔드/백엔드: Next.js 16.2.4 (App Router, TypeScript) — Vercel 배포"),
    bull2("데이터베이스: Supabase (PostgreSQL) — TAAS·AFC 데이터 사전 적재 및 실시간 조회"),
    bull2("AI 리포트: Anthropic Claude Haiku (claude-haiku-4-5-20251001) — 안전 검증 모듈 포함"),
    bull2("지도: Kakao Map JavaScript SDK — 출·도착지 마커 시각화"),
    bull2("서비스 URL: https://silverway.codegenie.co.kr (실배포 운영 중)"),
    blank(80),

    bull1("기존 유사 서비스와의 차별성", true),
    blank(40),
    body("[표 1] 기존 서비스 비교", { bold: true, color: BLUE_DARK }),
    blank(60),
  ]),
  blank(80),
  compareTable,
  blank(80),
  boxed([
    body("SilverWay의 핵심 차별점은 '이동 전 사전 분석'과 '공공데이터 3종 융합'입니다. 기존 내비게이션은 목적지 안내에, 운전 점수 앱은 사후 평가에 특화된 반면, SilverWay는 출발 전에 경로·시간대·기상 조건·연령대를 종합한 운전 위험 지수를 제공하여 이동 방법 자체를 선택할 수 있도록 지원합니다."),
  ]),
  blank(200),

  // ── 나. 분석 방법 및 시사점 ──
  subTitle("나. 분석 방법 및 시사점"),
  boxed([

    bull1("분석 데이터 선정 이유", true),
    blank(40),
    body("[표 2] 활용 공공데이터 목록", { bold: true, color: BLUE_DARK }),
    blank(60),
  ]),
  blank(80),
  dataTable,
  blank(80),
  boxed([
    body("① TAAS는 고령 운전자 특화 사고 통계를 행정구역 단위로 제공하는 국내 유일의 공식 데이터로, 지역 사고 패턴 반영의 필연성이 있습니다."),
    body("② AFC 재차인원 데이터는 대전 1호선 역별·시간대별 과거 승차 패턴을 담아 혼잡도 예측의 유일한 공공 근거 데이터입니다."),
    body("③ 기상청 단기예보는 출발지 좌표 기반 실시간 기상 조건을 제공하므로, 강수·강풍 등 운전 위험 요인을 정량적으로 반영할 수 있습니다."),
    blank(80),

    bull1("사용 분석 기법", true),
    blank(40),

    subHead("운전 위험 지수 — 다중 요인 가중 합산 (Multi-Factor Weighted Scoring)"),
    body("총 5개 요인을 합산하여 0~100점 척도의 운전 위험 지수를 산출합니다. 이 점수는 실제 사고 확률이 아닌 의사결정 보조용 지수입니다."),
    blank(40),
    body("[표 3] 운전 위험 지수 산출 기준", { bold: true, color: BLUE_DARK }),
    blank(60),
  ]),
  blank(80),
  riskTable,
  blank(80),
  boxed([
    subHead("혼잡도 산출 — AFC 재차인원 비율(ratio) 분석"),
    body("대전 1호선(반석역~판암역, 20개 역)의 AFC 재차인원 데이터를 역·시간대·방향 단위로 long format으로 전처리하여 Supabase에 적재합니다. 대중교통 경로의 첫 번째 지하철 역과 출발 시간대를 기준으로 혼잡도를 산출합니다."),
    blank(40),
    new Paragraph({ children: [r("혼잡도 ratio = 해당 역·시간대 평균 재차인원 ÷ 전체 시간대 평균 재차인원", { size: 19, color: "444466" })], spacing: { before: 20, after: 20 }, indent: { left: 640 } }),
    new Paragraph({ children: [r("ratio ≥ 1.2 → HIGH(혼잡) / 0.8 ≤ ratio < 1.2 → MEDIUM(보통) / ratio < 0.8 → LOW(여유)", { size: 19, color: "444466" })], spacing: { before: 0, after: 40 }, indent: { left: 640 } }),
    blank(80),

    bull1("공공데이터 활용 상세 내용", true),
    blank(40),

    subHead("TAAS 데이터 처리 과정"),
    body("원본 엑셀([TAAS] 사고분석-지역별.xlsx)을 직접 파싱하여 시군구 단위로 집계합니다. 사고건수·치사수·중상수·야간건수를 가중 합산하는 riskScore 공식을 자체 개발하여 적용하고, 결과를 Supabase accident_areas 테이블에 적재합니다. 출발지 주소에서 정규식으로 시군구명을 추출해 실시간 매칭합니다."),
    body("처리 결과 (대덕구 기준): 사고 510건, 고령운전자 관련 510건, 사망 9건, 중상 97건, riskScore = 100점"),

    subHead("AFC 데이터 처리 과정"),
    body("상행·하행 AFC 원본 엑셀을 열차 단위 wide format에서 역별 long format으로 전처리합니다. 20개 역 × 시간대 × 방향 조합으로 afc_station_loads 테이블에 적재하며, ODsay 역명과 AFC 역명의 불일치를 해소하는 station_aliases 테이블을 별도로 관리합니다."),

    subHead("기상청 API 좌표 변환"),
    body("출발지 위경도를 기상청 격자 좌표(nx, ny)로 변환하는 Lambert Conformal Conic 투영법을 직접 구현했습니다(convertGrid.ts). PTY(강수형태)·SKY(하늘상태)·WSD(풍속)·POP(강수확률)·TMP(기온) 항목을 조회하여 기상 위험 지수를 산출합니다. 변환 실패 시 대전 기본 격자(nx=67, ny=100)로 안전하게 대체됩니다."),
    blank(80),

    bull1("상세 분석 내용 및 시사점", true),
    blank(40),

    subHead("사고 데이터 지역별 집계 및 위험지수 산출"),
    body("65세 이상 가해 운전자 사고 데이터(2022~2024)를 대전시 5개 구별로 집계하고 사고건수·치사수·중상수·야간건수를 가중 합산한 riskScore로 정규화하여 Supabase에 사전 적재합니다. 사용자가 출발지를 입력하면 주소에서 시군구명을 실시간 추출하여 해당 지역의 사고 패턴을 즉시 반영합니다."),

    subHead("병렬 처리 및 안정성 설계"),
    body("분석 요청 시 TAAS 조회·ODsay 경로·기상청 예보·AFC 혼잡도를 Promise.all로 동시 실행하여 응답 지연을 최소화합니다. 외부 API 또는 DB 조회 실패 시 사전 정의된 대체 데이터로 자동 전환되어 화면이 중단되지 않습니다."),

    subHead("AI 리포트 품질 및 안전성 검증"),
    body("Claude Haiku가 생성한 리포트에 '운전 금지', '사고 확률', '면허 반납 강요' 등 부적절한 표현이 포함되면 reportSafety 모듈이 자동으로 감지하고 템플릿 메시지로 대체합니다. 15초 타임아웃과 독립적인 fallback 체계를 통해 서비스 안정성을 보장합니다."),

    subHead("시사점"),
    body("공공데이터 3종을 단순 나열이 아닌 하나의 점수 체계로 결합하면, 개인의 구체적 이동 상황에 맞는 실용적 의사결정 지원이 가능합니다. TAAS의 지역 위험도·기상청의 실시간 날씨·AFC의 과거 패턴을 융합함으로써 어느 단일 데이터만으로는 불가능했던 종합적 위험 평가를 실현했습니다."),
  ]),
  blank(200),

  // ── 다. 활용방안 및 기대효과 ──
  subTitle("다. 활용방안 및 기대효과"),
  boxed([

    bull1("대전광역시 정책과의 부합성 및 활용 가능성", true),
    blank(40),

    subHead("면허 반납 인센티브 제도 보완 도구"),
    body("대전시는 65세 이상 운전면허 자진 반납자에게 교통카드 및 인센티브를 지원하는 제도를 운영하고 있습니다. SilverWay는 반납 결정 이전 단계에서 운전 위험 지수와 대중교통 대안을 함께 제공함으로써 자발적 반납을 유도하는 의사결정 지원 도구 역할을 합니다."),

    subHead("고령 친화 도시 정책 연계"),
    body("대전광역시는 WHO 고령 친화 도시 네트워크 가입 도시로서 고령 시민의 이동권 보장을 핵심 과제로 추진하고 있습니다. SilverWay는 이동을 포기하도록 강요하지 않고 더 안전한 이동 방법을 스스로 선택할 수 있도록 돕는 방향으로 이 정책과 직접 부합합니다."),

    subHead("대전 공공데이터의 직접 활용 및 확장"),
    body("대전 도시철도 AFC 데이터와 대전 지역 TAAS 데이터를 직접 활용하는 대전 특화 서비스로, AFC 데이터를 보유한 타 광역시 도시철도(세종, 청주 등)로 확장 적용도 가능합니다."),

    subHead("단계별 활용 시나리오"),
    bull2("단기: 공모전 시연용 웹 서비스 — silverway.codegenie.co.kr 실배포 운영 중"),
    bull2("중기: 대전시 5개 구청 노인복지 담당 부서와 연계, 현장 시범 운영"),
    bull2("장기: 타 광역시 AFC 데이터 추가 적재로 서비스 권역 확장, 보험사 실버 상품 연계"),
    blank(80),

    bull1("아이디어·제품 사용을 통한 사회적 파급효과", true),
    blank(40),
    body("[표 4] 기대효과 요약", { bold: true, color: BLUE_DARK }),
    blank(60),
  ]),
  blank(80),
  effectTable,
  blank(80),
  boxed([
    body("SilverWay가 만드는 가장 중요한 사회적 변화는 '강요 없는 의사결정 문화'입니다. 면허 반납은 지금까지 가족 간 갈등의 원인이 되어 왔습니다. SilverWay는 객관적 데이터와 따뜻한 AI 메시지를 통해 이 대화를 감정 싸움이 아닌 정보 기반 논의로 전환합니다. 고령 인구 비중이 높아질수록 이 서비스의 필요성과 파급력은 증가하며, 대전에서 시작해 전국으로 확산 가능한 모델로서 공공데이터 활용이 사회 문제 해결에 직접 기여하는 구체적 사례를 제시합니다."),
  ]),
  blank(200),

  // ── 라. 참고문헌 출처 ──
  subTitle("라. 참고 문헌 출처 등"),
  boxed([
    bull1("활용 공공데이터 및 API", true),
    blank(40),
    body("[표 5] 활용 API 및 데이터 출처 목록", { bold: true, color: BLUE_DARK }),
    blank(60),
  ]),
  blank(80),
  apiTable,
  blank(80),
  boxed([
    bull1("정책 및 통계 참고자료", true),
    blank(40),
    body("[1] 통계청, 「2024년 고령자 통계」, 2024.09"),
    body("[2] 도로교통공단, 「고령 운전자 교통사고 특성 분석」, 2023"),
    body("[3] 대전광역시, 「고령 친화 도시 액션플랜」 — WHO 고령 친화 도시 네트워크 관련 시정 계획"),
    body("[4] 행정안전부, 「고령 운전자 면허 자진 반납 지원 제도 현황」, 2023"),
    body("[5] 행정안전부 주민등록 인구통계 (2025 초고령 사회 진입 근거) — https://www.mois.go.kr"),
    blank(60),
    bull1("오픈소스 및 기술 라이브러리", true),
    blank(40),
    body("[6] Next.js 16.2.4 — https://nextjs.org (Vercel, MIT 라이선스)"),
    body("[7] Supabase — https://supabase.com (PostgreSQL 기반 BaaS)"),
    body("[8] XLSX (SheetJS) — https://sheetjs.com (엑셀 원본 파싱, Apache 2.0)"),
    body("[9] 서비스 URL: https://silverway.codegenie.co.kr"),
  ]),
  blank(400),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [r("※ 결과내용을 HWP 또는 PDF형식으로 10매 이내 작성", { size: 21, bold: true, color: BLUE_DARK })],
  }),
];

// ─── 문서 빌드 ────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: KO_FONT, size: 21 } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: {
          top:    convertInchesToTwip(0.9),
          bottom: convertInchesToTwip(0.9),
          left:   convertInchesToTwip(1.0),
          right:  convertInchesToTwip(1.0),
        },
      },
    },
    children,
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("SilverWay_제안서_v2.docx", buffer);
console.log("✓ SilverWay_제안서_v2.docx 생성 완료");
