import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle,
  WidthType, ShadingType, VerticalAlign, TableLayoutType,
  convertInchesToTwip,
} from "docx";
import { writeFileSync } from "fs";

// ─── 공통 스타일 헬퍼 ────────────────────────────────────────
const KO_FONT = "맑은 고딕";
const BLUE_DARK  = "1F3080";
const BLUE_LIGHT = "3B4A8A";
const GRAY_BG    = "F4F5FA";
const GRAY_TEXT  = "333333";
const ACCENT     = "C53030";

function run(text, opts = {}) {
  return new TextRun({ text, font: KO_FONT, ...opts });
}

function h1(text) {
  return new Paragraph({
    children: [run(text, { size: 28, bold: true, color: "FFFFFF" })],
    shading: { type: ShadingType.SOLID, color: BLUE_LIGHT },
    spacing: { before: 0, after: 200 },
    indent: { left: 200 },
  });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [run(text, { size: 26, bold: true, color: BLUE_DARK })],
    border: { bottom: { style: BorderStyle.THICK, color: BLUE_DARK, size: 6 } },
    spacing: { before: 400, after: 200 },
  });
}

function subTitle(text) {
  return new Paragraph({
    children: [run(text, { size: 24, bold: true, color: BLUE_DARK })],
    spacing: { before: 280, after: 120 },
  });
}

function subHead(text) {
  return new Paragraph({
    children: [run("▸ " + text, { size: 22, bold: true, color: BLUE_DARK })],
    spacing: { before: 160, after: 80 },
    indent: { left: 300 },
  });
}

function bodyP(text, opts = {}) {
  return new Paragraph({
    children: [run(text, { size: 20, color: GRAY_TEXT, ...opts })],
    spacing: { before: 60, after: 60 },
    indent: { left: 500 },
  });
}

function bullet1(text, bold = false) {
  return new Paragraph({
    children: [run("● " + text, { size: 21, bold, color: bold ? BLUE_DARK : GRAY_TEXT })],
    spacing: { before: 80, after: 60 },
    indent: { left: 400 },
  });
}

function bullet2(text) {
  return new Paragraph({
    children: [run("▪ " + text, { size: 20, color: GRAY_TEXT })],
    spacing: { before: 40, after: 40 },
    indent: { left: 700 },
  });
}

function blank(space = 100) {
  return new Paragraph({ children: [run("")], spacing: { before: 0, after: space } });
}

function boxedSection(paragraphs) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 6, color: "BBBBCC" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "BBBBCC" },
      left:   { style: BorderStyle.SINGLE, size: 6, color: "BBBBCC" },
      right:  { style: BorderStyle.SINGLE, size: 6, color: "BBBBCC" },
    },
    rows: [new TableRow({
      children: [new TableCell({
        shading: { type: ShadingType.SOLID, color: "F8F8FC" },
        margins: { top: 140, bottom: 140, left: 220, right: 220 },
        children: paragraphs,
      })],
    })],
  });
}

// ─── 셀 헬퍼 ───────────────────────────────────────────────
function cell(text, { shade = false, bold = false, size = 20, color = GRAY_TEXT, width = null, align = AlignmentType.CENTER, colSpan = null } = {}) {
  const opts = {
    shading: shade ? { type: ShadingType.SOLID, color: GRAY_BG } : undefined,
    margins: { top: 80, bottom: 80, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [run(text, { size, bold, color })],
    })],
  };
  if (width) opts.width = width;
  if (colSpan) opts.columnSpan = colSpan;
  return new TableCell(opts);
}

function headerCell(text, width = null) {
  return cell(text, { shade: true, bold: true, size: 19, color: BLUE_DARK, width });
}

// ─── 테이블 헬퍼 ───────────────────────────────────────────
function makeTable(rows) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:             { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      bottom:          { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      left:            { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      right:           { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      insideH:         { style: BorderStyle.SINGLE, size: 2, color: "DDDDEE" },
      insideV:         { style: BorderStyle.SINGLE, size: 2, color: "DDDDEE" },
    },
    rows: rows.map((rowCells) => new TableRow({ children: rowCells })),
  });
}

// ─── 참가자 정보 테이블 ───────────────────────────────────────
const infoTable = makeTable([
  [
    cell("출품작명", { shade: true, bold: true, size: 19, width: { size: 15, type: WidthType.PERCENTAGE } }),
    cell("SilverWay — AI 기반 고령 운전자 이동 안전 의사결정 지원 서비스", { bold: true, size: 19, align: AlignmentType.LEFT, width: { size: 85, type: WidthType.PERCENTAGE } }),
  ],
  [
    cell("팀  명\n(대표자)", { shade: true, bold: true, size: 19, width: { size: 15, type: WidthType.PERCENTAGE } }),
    new TableCell({
      margins: { top: 80, bottom: 80, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      width: { size: 35, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [run("(팀명과 대표자 1인 기재)", { size: 18, color: "888888", italics: true })] })],
    }),
    cell("지원분야", { shade: true, bold: true, size: 19, width: { size: 15, type: WidthType.PERCENTAGE } }),
    new TableCell({
      shading: { type: ShadingType.SOLID, color: BLUE_LIGHT },
      margins: { top: 80, bottom: 80, left: 80, right: 80 },
      verticalAlign: VerticalAlign.CENTER,
      width: { size: 35, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("제품·서비스 개발\n아이디어 기획", { size: 18, bold: true, color: "FFFFFF" })] })],
    }),
  ],
  [
    cell("소  속", { shade: true, bold: true, size: 19, width: { size: 15, type: WidthType.PERCENTAGE } }),
    cell("", { width: { size: 85, type: WidthType.PERCENTAGE }, align: AlignmentType.LEFT }),
  ],
  [
    cell("대표 연락처", { shade: true, bold: true, size: 19, width: { size: 15, type: WidthType.PERCENTAGE } }),
    cell("휴대폰", { shade: true, size: 18, width: { size: 12, type: WidthType.PERCENTAGE } }),
    cell("", { width: { size: 30, type: WidthType.PERCENTAGE }, align: AlignmentType.LEFT }),
    cell("E-mail", { shade: true, size: 18, width: { size: 12, type: WidthType.PERCENTAGE } }),
    cell("magicuear@gmail.com", { size: 18, width: { size: 31, type: WidthType.PERCENTAGE }, align: AlignmentType.LEFT }),
  ],
]);

// ─── 차별성 비교표 ─────────────────────────────────────────
const compareTable = makeTable([
  [
    headerCell("구분", { size: 14, type: WidthType.PERCENTAGE }),
    headerCell("카카오맵 / 네이버맵", { size: 22, type: WidthType.PERCENTAGE }),
    headerCell("T맵 운전점수", { size: 22, type: WidthType.PERCENTAGE }),
    headerCell("SilverWay", { size: 22, type: WidthType.PERCENTAGE }),
  ],
  [
    cell("분석 시점", { shade: true, bold: true }),
    cell("이동 중 (실시간)"),
    cell("이동 후 (사후)"),
    cell("이동 전 (사전)", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("고령자 특화", { shade: true, bold: true }),
    cell("없음"),
    cell("없음"),
    cell("60/70/80대 연령 보정", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("공공데이터 활용", { shade: true, bold: true }),
    cell("지도 기반만"),
    cell("없음"),
    cell("TAAS + AFC + 기상청 3종 융합", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("대중교통 대안", { shade: true, bold: true }),
    cell("경로 제시만"),
    cell("해당 없음"),
    cell("혼잡도 예측 포함 대안 제시", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("가족 소통 기능", { shade: true, bold: true }),
    cell("없음"),
    cell("없음"),
    cell("AI 감성 편지 자동 생성", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("면허 반납 지원", { shade: true, bold: true }),
    cell("없음"),
    cell("없음"),
    cell("의사결정 보조 안내 제공", { bold: true, color: BLUE_DARK }),
  ],
]);

// ─── 공공데이터 활용 목록표 ───────────────────────────────────
const dataTable = makeTable([
  [
    headerCell("데이터명", { size: 20, type: WidthType.PERCENTAGE }),
    headerCell("출처·제공기관", { size: 20, type: WidthType.PERCENTAGE }),
    headerCell("데이터 기간", { size: 15, type: WidthType.PERCENTAGE }),
    headerCell("활용 방식", { size: 25, type: WidthType.PERCENTAGE }),
    headerCell("위험지수 내 비중", { size: 20, type: WidthType.PERCENTAGE }),
  ],
  [
    cell("TAAS 교통사고분석\n지역별 집계", { align: AlignmentType.LEFT }),
    cell("도로교통공단\n(공공데이터포털)", { align: AlignmentType.LEFT }),
    cell("2022~2024년"),
    cell("시군구별 사고건수·치사수·중상수 → 지역 사고 패턴 점수 산출", { align: AlignmentType.LEFT }),
    cell("최대 50점 (50%)", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("AFC 열차 재차인원\n(대전 1호선)", { align: AlignmentType.LEFT }),
    cell("대전도시철도공사", { align: AlignmentType.LEFT }),
    cell("2026.03~04"),
    cell("역·시간대·방향별 승차인원 → 혼잡도 비율(ratio) 산출", { align: AlignmentType.LEFT }),
    cell("혼잡도 예측\n(독립 제공)"),
  ],
  [
    cell("기상청 단기예보\n(VilageFcstInfoService)", { align: AlignmentType.LEFT }),
    cell("기상청\n(공공데이터포털)", { align: AlignmentType.LEFT }),
    cell("실시간 API"),
    cell("위경도 → 격자(nx,ny) 변환 → PTY·RN1·WSD·TMP 조회", { align: AlignmentType.LEFT }),
    cell("최대 15점 (15%)", { bold: true, color: BLUE_DARK }),
  ],
  [
    cell("ODsay 대중교통\n경로 API", { align: AlignmentType.LEFT }),
    cell("ODsay Lab", { align: AlignmentType.LEFT }),
    cell("실시간 API"),
    cell("출·도착 좌표 → 최적 대중교통 경로·소요시간·환승 횟수 조회", { align: AlignmentType.LEFT }),
    cell("대중교통 대안\n(독립 제공)"),
  ],
]);

// ─── 기대효과 요약표 ───────────────────────────────────────
const effectTable = makeTable([
  [
    headerCell("효과 분류", { size: 20, type: WidthType.PERCENTAGE }),
    headerCell("구체적 기대효과", { size: 55, type: WidthType.PERCENTAGE }),
    headerCell("관련 이해관계자", { size: 25, type: WidthType.PERCENTAGE }),
  ],
  [
    cell("안전\n(Safety)", { shade: true, bold: true }),
    cell("공공데이터 기반 고위험 경로·시간대 운전 자제 유도\n→ 고령 운전자 사고 예방 기여", { align: AlignmentType.LEFT }),
    cell("고령 운전자"),
  ],
  [
    cell("가족 소통\n(Social)", { shade: true, bold: true }),
    cell("AI 생성 감성 편지로 면허 반납 대화 자연스럽게 시작\n→ 가족 간 갈등 감소, 공감 기반 의사결정 지원", { align: AlignmentType.LEFT }),
    cell("40~50대 자녀\n(가족)"),
  ],
  [
    cell("이동권\n(Mobility)", { shade: true, bold: true }),
    cell("대중교통 경로 + 혼잡도 예측 제공\n→ 고령 시민의 대중교통 이용 자신감 향상", { align: AlignmentType.LEFT }),
    cell("교통 취약계층\n대전 1호선"),
  ],
  [
    cell("정책 연계\n(Policy)", { shade: true, bold: true }),
    cell("면허 반납 인센티브 제도 활용률 제고\n대전시 고령 친화 도시 액션플랜 직접 부합", { align: AlignmentType.LEFT }),
    cell("대전광역시\n행정안전부"),
  ],
  [
    cell("데이터 활용\n(Data)", { shade: true, bold: true }),
    cell("TAAS·AFC·기상청 공공데이터 실제 서비스 적용 사례 창출\n→ 공공데이터 활용 가치 실증", { align: AlignmentType.LEFT }),
    cell("도로교통공단\n대전도시철도공사"),
  ],
]);

// ─── 문서 본문 ───────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: KO_FONT, size: 22 } },
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
    children: [
      // ── 제목 ──
      h1("서식 3   제안서 양식"),
      blank(180),

      // ── I. 참가자 정보 ──
      sectionTitle("Ⅰ. 참가자 정보"),
      infoTable,
      blank(280),

      // ── II. 세부 내용 ──
      sectionTitle("Ⅱ. 세부 내용"),
      blank(80),

      // ════════════════════════════════════════════════
      // 가. 기획 상세 내용
      // ════════════════════════════════════════════════
      subTitle("가. 기획 상세 내용"),
      boxedSection([

        // ── 기획 배경 및 필요성 ──
        bullet1("기획 배경 및 필요성", true),
        blank(40),
        subHead("고령 운전자 사고의 구조적 증가"),
        bodyP("통계청 자료에 따르면 65세 이상 고령 인구는 2024년 전체 인구의 19%를 넘어섰으며, 운전면허 소지 고령자 수도 매년 증가하고 있습니다. 도로교통공단 TAAS 데이터에 따르면 고령 운전자 사고 치사율은 전체 평균 대비 높은 수준을 유지하고 있으며, 본 프로젝트가 처리한 대전 대덕구 데이터에서도 3년(2022~2024)간 510건의 고령 운전자 관련 사고가 집계되었습니다."),

        subHead("면허 반납 의사결정의 어려움"),
        bodyP("면허 반납은 이동 자유와 직결되어 당사자에게 심리적 저항이 큽니다. 가족 입장에서도 감정 충돌 없이 이 주제를 꺼내기 어려우며, 객관적 데이터 없이는 설득력 있는 대화가 불가능한 상황입니다. '위험하다'는 막연한 말 대신 지역 사고 패턴·기상·시간대를 조합한 구체적 수치로 대화를 시작할 도구가 필요합니다."),

        subHead("공공데이터 활용 공백"),
        bodyP("TAAS 사고 집계 데이터, 대전 도시철도 AFC 재차인원 데이터, 기상청 단기예보 등 고품질 공공데이터가 이미 존재합니다. 그러나 이 세 데이터를 결합해 개인의 특정 이동 상황에 맞춘 의사결정 지원을 제공하는 서비스는 현재 없습니다. SilverWay는 이 공백을 채우기 위해 기획되었습니다."),
        blank(80),

        // ── 기획 목적 ──
        bullet1("기획 목적", true),
        blank(40),
        bodyP("AI와 공공데이터를 결합하여, 고령 운전자가 특정 이동에 대한 안전 수준을 객관적으로 이해하고 가족과 함께 이동 방법을 자연스럽게 논의할 수 있는 의사결정 지원 환경을 제공합니다."),
        bullet2("운전 위험 지수 정량화 → 감정이 아닌 데이터로 대화"),
        bullet2("대중교통 대안 제시 → 운전 포기가 아닌 이동 선택지 확장"),
        bullet2("AI 가족 공유 리포트 자동 생성 → 면허 반납 대화의 자연스러운 시작점"),
        blank(80),

        // ── 구체적 기획 상세 내용 ──
        bullet1("구체적 기획 상세 내용", true),
        blank(40),
        subHead("서비스 이용 흐름 (5단계)"),
        bullet2("① 출발지·도착지 입력 — Kakao Local API로 주소 검색 및 위경도 좌표 반환"),
        bullet2("② 출발 시각·연령대 선택 — 60/70/80대 연령 보정 적용"),
        bullet2("③ 분석 시작 — 서버에서 TAAS·AFC·기상청·ODsay 4개 데이터소스 병렬 조회"),
        bullet2("④ 결과 화면 — 운전 위험 지수, 대중교통 경로, 혼잡도, 날씨, 지도 통합 표시"),
        bullet2("⑤ AI 리포트 — Claude Haiku가 가족 공유용 감성 편지 자동 생성 → 클립보드 복사"),
        blank(60),
        subHead("기술 구현 현황"),
        bullet2("프론트엔드/백엔드: Next.js 16 (App Router, TypeScript) — Vercel 배포"),
        bullet2("데이터베이스: Supabase (PostgreSQL) — TAAS·AFC 데이터 사전 적재 및 실시간 조회"),
        bullet2("AI 리포트: Anthropic Claude Haiku (claude-haiku-4-5-20251001)"),
        bullet2("지도: Kakao Map JavaScript SDK — 출·도착지 마커 시각화"),
        bullet2("테스트: 229개 단위/통합 테스트 통과 (Vitest), 표현 원칙 위반 감지 포함"),
        blank(80),

        // ── 차별성 ──
        bullet1("기존 유사 서비스와의 차별성", true),
        blank(40),
        bodyP("[표 1] 기존 서비스 비교", { bold: true, color: BLUE_DARK }),
        blank(60),
      ]),
      blank(80),
      compareTable,
      blank(80),
      boxedSection([
        bodyP("SilverWay의 핵심 차별점은 '이동 전 사전 분석'과 '공공데이터 3종 융합'입니다. 기존 내비게이션 앱은 목적지까지 안내하는 데 특화되어 있고, 운전 점수 앱은 이미 운전한 후 평가하는 방식입니다. SilverWay는 출발 전에 해당 경로·시간대·기상 조건·연령대를 종합한 운전 위험 지수를 제공하여 이동 방법 자체를 선택할 수 있도록 지원합니다."),
      ]),
      blank(200),

      // ════════════════════════════════════════════════
      // 나. 분석 방법 및 시사점
      // ════════════════════════════════════════════════
      subTitle("나. 분석 방법 및 시사점"),
      boxedSection([

        bullet1("분석 데이터 선정 이유", true),
        blank(40),
        bodyP("[표 2] 활용 공공데이터 목록", { bold: true, color: BLUE_DARK }),
        blank(60),
      ]),
      blank(80),
      dataTable,
      blank(80),
      boxedSection([
        bodyP("세 공공데이터를 선정한 근거는 다음과 같습니다. ① TAAS는 고령 운전자 특화 사고 통계를 행정구역 단위로 제공하는 국내 유일의 공식 데이터로, 지역 사고 패턴 반영의 필연성이 있습니다. ② AFC 재차인원 데이터는 대전 1호선 역별·시간대별 과거 승차 패턴을 담아 혼잡도 예측의 유일한 공공 근거 데이터입니다. ③ 기상청 단기예보는 출발지 좌표 기반 실시간 기상 조건을 제공하므로, 비·눈·강풍 등 운전 위험도를 높이는 기상 요인을 정량적으로 반영할 수 있습니다."),
        blank(80),

        bullet1("사용 분석 기법", true),
        blank(40),
        subHead("운전 위험 지수 — 다중 요인 가중 합산 (Multi-Factor Weighted Scoring)"),
        bodyP("총 5개 요인을 합산하여 0~100점 척도의 운전 위험 지수를 산출합니다. 이 점수는 실제 사고 확률이 아닌 의사결정 보조용 지수입니다."),
        blank(40),
        new Paragraph({ children: [run("  운전 위험 지수 (0~100점)", { size: 20, bold: true, color: BLUE_DARK })], spacing: { before: 40, after: 20 }, indent: { left: 500 } }),
        new Paragraph({ children: [run("  = 지역 사고 패턴 (max 50) + 시간대 위험 (max 15) + 기상 위험 (max 15)", { size: 19, color: "444455" })], spacing: { before: 0, after: 0 }, indent: { left: 700 } }),
        new Paragraph({ children: [run("  + 연령대 보정 (max 10) + 경로 지역 보정 (max 10)", { size: 19, color: "444455" })], spacing: { before: 0, after: 40 }, indent: { left: 700 } }),
        blank(40),
        bullet2("지역 사고 패턴: TAAS riskScore (지역 사고건수·치사수·중상수 기반)를 0~50점으로 정규화"),
        bullet2("시간대 위험: 심야·새벽 15점 / 저녁 12점 / 퇴근 10점 / 출근 8점 / 오전·낮 5점"),
        bullet2("기상 위험: KMA PTY(강수형태)·RN1(강수량)·WSD(풍속) 기반 0~100점 환산 후 15점 정규화"),
        bullet2("연령대 보정: 60대 4점 / 70대 7점 / 80대 이상 10점 (반응속도·야간시력 저하 감안)"),
        bullet2("위험 등급: 70점 이상 HIGH(높음) / 40~69점 MEDIUM(보통) / 39점 이하 LOW(낮음)"),
        blank(60),

        subHead("혼잡도 예측 — AFC 재차인원 비율 분석"),
        bodyP("대전 1호선 반석역~대동역(20개 역)의 AFC 재차인원 데이터를 시간대·방향 단위로 long format으로 전처리하여 Supabase에 적재합니다. 대중교통 경로의 첫 번째 지하철 역과 출발 시간대를 기준으로 혼잡도를 산출합니다."),
        blank(40),
        new Paragraph({ children: [run("  혼잡도 ratio = 해당 역·시간대 평균 재차인원 ÷ 전체 평균 재차인원", { size: 19, color: "444455" })], spacing: { before: 20, after: 20 }, indent: { left: 700 } }),
        new Paragraph({ children: [run("  ratio ≥ 1.2 → HIGH / 0.8 ≤ ratio < 1.2 → MEDIUM / ratio < 0.8 → LOW", { size: 19, color: "444455" })], spacing: { before: 0, after: 40 }, indent: { left: 700 } }),
        blank(80),

        bullet1("공공데이터 활용 상세 내용", true),
        blank(40),
        subHead("TAAS 데이터 처리 과정"),
        bodyP("원본 엑셀('[TAAS] 사고분석-지역별.xlsx')을 직접 파싱하여 시군구 단위로 집계합니다. 사고건수·치사수·중상수·야간건수를 가중 합산하는 riskScore 공식을 자체 개발하여 적용하고, 결과를 Supabase accident_areas 테이블에 적재합니다. 출발지 주소에서 정규식으로 시군구명을 추출해 실시간 매칭합니다."),
        bodyP("처리 결과 (대덕구 기준): 사고 510건, 고령운전자 관련 510건, 사망 9건, 중상 97건, riskScore = 100점"),

        subHead("AFC 데이터 처리 과정"),
        bodyP("상행/하행 AFC 원본 엑셀을 열차 단위 wide format에서 역별 long format으로 전처리합니다. 20개 역 × 시간대 × 방향 조합으로 afc_station_loads 테이블에 적재하며, ODsay 역명과 AFC 역명의 불일치를 해소하는 station_aliases 테이블을 별도로 관리합니다."),

        subHead("기상청 API 좌표 변환"),
        bodyP("출발지 위경도를 기상청 격자 좌표(nx, ny)로 변환하는 Lambert Conformal Conic 투영법을 직접 구현했습니다(convertGrid.ts). 변환 실패 시 대전 기본 격자(nx=67, ny=100)로 안전하게 fallback됩니다."),
        blank(80),

        bullet1("상세 분석 내용 및 시사점", true),
        blank(40),
        bodyP("병렬 처리 구조: 분석 요청 시 TAAS 조회·ODsay 경로·기상청 예보·AFC 혼잡도를 Promise.all로 동시 실행하여 응답 지연을 최소화합니다."),
        bodyP("안정성 설계: 외부 API 또는 DB 조회 실패 시 사전 정의된 fallback 데이터로 자동 대체되어 화면이 깨지지 않습니다. 4개 외부 의존성(Kakao / ODsay / 기상청 / Claude) 각각에 독립 fallback이 구현되어 있습니다."),
        bodyP("AI 생성 리포트 안전성: Claude 응답에 '운전 금지', '면허 반납 강요', '사고 확률' 등 금지 표현이 포함되면 자동 차단하고 템플릿 메시지로 대체하는 reportSafety 모듈이 별도로 운영됩니다."),
        bodyP("시사점: 공공데이터 3종을 단순 나열이 아닌 하나의 점수 체계로 결합하면, 개인의 구체적 이동 상황에 맞는 실용적 의사결정 지원이 가능합니다. TAAS의 지역 위험도와 기상청의 실시간 날씨, AFC의 과거 패턴을 융합함으로써 어느 단일 데이터만으로는 불가능했던 종합적 위험 평가를 실현했습니다."),
      ]),
      blank(200),

      // ════════════════════════════════════════════════
      // 다. 활용방안 및 기대효과
      // ════════════════════════════════════════════════
      subTitle("다. 활용방안 및 기대효과"),
      boxedSection([

        bullet1("대전광역시 정책과의 부합성 및 활용 가능성", true),
        blank(40),
        subHead("고령 친화 도시 정책 연계"),
        bodyP("대전광역시는 세계보건기구(WHO) 고령 친화 도시 네트워크 가입 도시로서 고령 시민의 이동권 보장을 핵심 과제로 추진하고 있습니다. SilverWay는 고령 시민이 이동을 포기하도록 강요하지 않고, 더 안전한 이동 방법을 스스로 선택할 수 있도록 돕습니다. 이는 대전시 고령 친화 도시 정책의 '이동 접근성 강화' 전략과 직접 부합합니다."),

        subHead("면허 반납 인센티브 제도 보완 도구"),
        bodyP("대전시는 65세 이상 운전면허 자진 반납자에게 교통카드 및 인센티브를 지원하는 제도를 운영하고 있습니다. SilverWay는 반납 결정 이전 단계에서 운전 위험 지수와 대중교통 대안을 함께 제공함으로써 자발적 반납을 유도하는 의사결정 지원 도구 역할을 할 수 있습니다. 이를 통해 면허 반납 인센티브 제도의 실질적 활용률을 높이는 데 기여합니다."),

        subHead("대전 공공데이터의 직접 활용 및 확장 가능성"),
        bodyP("대전 도시철도 AFC 데이터와 대전 지역 TAAS 데이터를 직접 활용하는 대전 특화 서비스로, 노인복지관·구청 복지과·치매안심센터 등 공공시설을 통한 홍보·배포가 용이합니다. AFC 데이터를 보유한 타 광역시 도시철도(세종, 청주 등)로 확장 적용도 가능합니다."),

        subHead("단계별 활용 시나리오"),
        bullet2("단기 (현재): 공모전 시연용 웹 서비스 — silverway.codegenie.co.kr 실배포 완료"),
        bullet2("중기: 대전시 5개 구청 노인복지 담당 부서와 연계, 현장 시범 운영"),
        bullet2("장기: 타 광역시 AFC 데이터 추가 적재로 서비스 권역 확장"),
        blank(80),

        bullet1("아이디어·제품 사용을 통한 사회적 파급효과", true),
        blank(40),
        bodyP("[표 3] 기대효과 요약", { bold: true, color: BLUE_DARK }),
        blank(60),
      ]),
      blank(80),
      effectTable,
      blank(80),
      boxedSection([
        subHead("핵심 사회적 가치"),
        bodyP("SilverWay가 만드는 가장 중요한 사회적 변화는 '강요 없는 의사결정 문화'입니다. 면허 반납은 지금까지 가족 간 갈등의 원인이 되어 왔습니다. SilverWay는 객관적 데이터와 따뜻한 AI 메시지를 통해 이 대화를 감정 싸움이 아닌 정보 기반 논의로 전환합니다. 이는 고령 시민의 자립심을 존중하면서 안전을 도모하는 새로운 접근법입니다."),
        bodyP("고령 인구 비중이 높아질수록 이 서비스의 필요성과 파급력은 증가합니다. 대전에서 시작해 전국으로 확산 가능한 모델로서, 공공데이터 활용이 사회 문제 해결에 직접 기여하는 구체적 사례를 제시합니다."),
      ]),
      blank(200),

      // ════════════════════════════════════════════════
      // 라. 참고 문헌 출처
      // ════════════════════════════════════════════════
      subTitle("라. 참고 문헌 출처 등"),
      boxedSection([
        bullet1("활용 공공데이터 및 API", true),
        blank(40),
        bodyP("[1] 도로교통공단 TAAS 교통사고분석시스템 — 지역별 사고 집계"),
        bodyP("    https://taas.koroad.or.kr | 활용 파일: [TAAS] 사고분석-지역별.xlsx | 기간: 2022~2024"),
        bodyP("[2] 공공데이터포털 — 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0)"),
        bodyP("    https://www.data.go.kr | API명: getVilageFcst | 실시간 서버 연동"),
        bodyP("[3] ODsay Lab — 대중교통 경로 탐색 API (searchPubTransPathT)"),
        bodyP("    https://api.odsay.com | 실시간 서버 연동"),
        bodyP("[4] 대전도시철도공사 — AFC 열차 재차인원 데이터"),
        bodyP("    활용 파일: [AFC DB] 상행/하행 열차 재차인원(2026-03-01~2026-04-01).xls"),
        bodyP("[5] 카카오 개발자센터 — Kakao Local API, Kakao Map JavaScript SDK"),
        bodyP("    https://developers.kakao.com | 장소 검색, 좌표 반환, 지도 시각화"),
        bodyP("[6] Anthropic — Claude Haiku API (claude-haiku-4-5-20251001)"),
        bodyP("    https://docs.anthropic.com | 가족 공유 리포트 자동 생성"),
        blank(60),
        bullet1("정책 및 통계 참고자료", true),
        blank(40),
        bodyP("[7] 통계청, 「2024년 고령자 통계」, 2024.09"),
        bodyP("[8] 도로교통공단, 「고령 운전자 교통사고 특성 분석」, 2023"),
        bodyP("[9] 대전광역시, 「고령 친화 도시 액션플랜」 — WHO 고령 친화 도시 네트워크 관련 시정 계획"),
        bodyP("[10] 행정안전부, 「고령 운전자 면허 자진 반납 지원 제도 현황」, 2023"),
        blank(60),
        bullet1("오픈소스 및 기술 라이브러리", true),
        blank(40),
        bodyP("[11] Next.js 16.2.4 — https://nextjs.org (Vercel, MIT 라이선스)"),
        bodyP("[12] Supabase — https://supabase.com (PostgreSQL 기반 BaaS)"),
        bodyP("[13] XLSX (SheetJS) — https://sheetjs.com (엑셀 파싱, Apache 2.0)"),
        bodyP("[14] 서비스 URL: https://silverway.codegenie.co.kr"),
        bodyP("[15] 소스코드 및 기술 문서: 프로젝트 내 README.md, docs/ 디렉터리 참조"),
      ]),
      blank(400),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run("※ 결과내용을 HWP 또는 PDF형식으로 10매 이내 작성", { size: 22, bold: true, italics: true, color: BLUE_DARK })],
      }),
    ],
  }],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("SilverWay_제안서.docx", buffer);
console.log("✓ SilverWay_제안서.docx 생성 완료");
