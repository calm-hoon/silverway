import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, TableLayoutType,
  PageOrientation, convertInchesToTwip,
} from "docx";
import { writeFileSync } from "fs";

// ─── 공통 스타일 헬퍼 ────────────────────────────────────────
const KO_FONT = "맑은 고딕";

function run(text, opts = {}) {
  return new TextRun({ text, font: KO_FONT, ...opts });
}

function h1(text) {
  return new Paragraph({
    children: [run(text, { size: 28, bold: true, color: "FFFFFF" })],
    shading: { type: ShadingType.SOLID, color: "3B4A8A" },
    spacing: { before: 0, after: 200 },
    indent: { left: 200 },
  });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [run(text, { size: 26, bold: true, color: "1F3080" })],
    border: { bottom: { style: BorderStyle.THICK, color: "1F3080", size: 6 } },
    spacing: { before: 400, after: 200 },
  });
}

function subTitle(text) {
  return new Paragraph({
    children: [run(text, { size: 24, bold: true, color: "1F3080" })],
    spacing: { before: 300, after: 120 },
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    children: [run(text, { size: 22, ...opts })],
    spacing: { before: 80, after: 80 },
    indent: { left: 300 },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [run("○  " + text, { size: 22 })],
    spacing: { before: 80, after: 80 },
    indent: { left: 400 + level * 300 },
  });
}

function subBullet(text) {
  return new Paragraph({
    children: [run("▪  " + text, { size: 20, color: "333333" })],
    spacing: { before: 40, after: 40 },
    indent: { left: 700 },
  });
}

function blank(space = 100) {
  return new Paragraph({ children: [run("")], spacing: { before: 0, after: space } });
}

function boxedParagraph(paragraphs) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "F8F8FC" },
            margins: { top: 120, bottom: 120, left: 200, right: 200 },
            children: paragraphs,
          }),
        ],
      }),
    ],
  });
}

// ─── 참가자 정보 테이블 ───────────────────────────────────────
function infoCell(text, shade = false, bold = false, width = null, vMerge = null) {
  const cellOpts = {
    shading: shade ? { type: ShadingType.SOLID, color: "E8EAF6" } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [run(text, { size: 20, bold })],
      }),
    ],
  };
  if (width) cellOpts.width = width;
  if (vMerge) cellOpts.rowSpan = vMerge;
  return new TableCell(cellOpts);
}

function infoValueCell(text, width = null) {
  const cellOpts = {
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        children: [run(text, { size: 20 })],
      }),
    ],
  };
  if (width) cellOpts.width = width;
  return new TableCell(cellOpts);
}

const infoTable = new Table({
  layout: TableLayoutType.FIXED,
  width: { size: 100, type: WidthType.PERCENTAGE },
  rows: [
    new TableRow({
      height: { value: 480 },
      children: [
        infoCell("출품작명", true, true, { size: 15, type: WidthType.PERCENTAGE }),
        infoValueCell("SilverWay — AI 기반 고령 운전자 이동 안전 의사결정 지원 서비스", { size: 85, type: WidthType.PERCENTAGE }),
      ],
    }),
    new TableRow({
      height: { value: 480 },
      children: [
        infoCell("팀  명\n(대표자)", true, true, { size: 15, type: WidthType.PERCENTAGE }),
        new TableCell({
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [run("(팀명과 대표자 1인 기재)", { size: 18, color: "888888", italics: true })] })],
          width: { size: 35, type: WidthType.PERCENTAGE },
        }),
        infoCell("지원분야", true, true, { size: 15, type: WidthType.PERCENTAGE }),
        new TableCell({
          shading: { type: ShadingType.SOLID, color: "3B4A8A" },
          margins: { top: 80, bottom: 80, left: 80, right: 80 },
          verticalAlign: VerticalAlign.CENTER,
          width: { size: 20, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [run("제품·서비스 개발\n아이디어 기획", { size: 18, bold: true, color: "FFFFFF" })],
          })],
        }),
      ],
    }),
    new TableRow({
      height: { value: 480 },
      children: [
        infoCell("소  속", true, true, { size: 15, type: WidthType.PERCENTAGE }),
        infoValueCell("", { size: 85, type: WidthType.PERCENTAGE }),
      ],
    }),
    new TableRow({
      height: { value: 480 },
      children: [
        infoCell("대표 연락처", true, true, { size: 15, type: WidthType.PERCENTAGE }),
        infoCell("휴대폰", true, false, { size: 12, type: WidthType.PERCENTAGE }),
        infoValueCell("", { size: 30, type: WidthType.PERCENTAGE }),
        infoCell("E-mail", true, false, { size: 12, type: WidthType.PERCENTAGE }),
        infoValueCell("magicuear@gmail.com", { size: 31, type: WidthType.PERCENTAGE }),
      ],
    }),
  ],
});

// ─── 문서 본문 ───────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: KO_FONT, size: 22 },
      },
    },
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1.1),
            right: convertInchesToTwip(1.1),
          },
        },
      },
      children: [
        // ── 제목 ──
        h1("서식 3   제안서 양식"),
        blank(200),

        // ── I. 참가자 정보 ──
        sectionTitle("Ⅰ. 참가자 정보"),
        infoTable,
        blank(300),

        // ── II. 세부 내용 ──
        sectionTitle("Ⅱ. 세부 내용"),
        blank(100),

        // ── 가. 기획 상세 내용 ──
        subTitle("가. 기획 상세 내용"),
        boxedParagraph([
          // 기획 배경 및 필요성
          new Paragraph({ children: [run("○ 기획 배경 및 필요성", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),

          new Paragraph({ children: [run("▸ 고령 운전자 사고의 구조적 증가", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("2023년 기준 65세 이상 운전면허 소지자는 약 430만 명으로 전체의 10%를 넘어섰으며, 고령 운전자 관련 교통사고 비중은 매년 증가하고 있습니다. TAAS(교통사고분석시스템) 데이터에 따르면 65세 이상 운전자의 사고 치사율은 전체 평균 대비 약 1.7배 높습니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("▸ 면허 반납 결정의 어려움", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("면허 반납은 이동 자유와 직결되어 당사자에게 심리적 저항이 큽니다. 가족 입장에서도 감정 충돌 없이 이 주제를 꺼내기 어려우며, 객관적인 데이터 없이는 설득력 있는 대화가 불가능한 상황입니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("▸ 공공데이터 활용 공백", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("TAAS 사고 데이터, 교통카드(AFC) 재차인원 데이터, 기상청 예보 등 고품질 공공데이터가 존재하지만, 이를 결합해 개인 이동 의사결정을 돕는 서비스는 없습니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 100 }, indent: { left: 600 } }),

          // 기획 목적
          new Paragraph({ children: [run("○ 기획 목적", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("AI와 공공데이터를 결합하여 고령 운전자가 특정 이동 경로에 대한 안전 수준을 객관적으로 이해하고, 가족과 함께 이동 방법을 자연스럽게 논의할 수 있는 환경을 제공합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· 운전 위험 지수 정량화 → 감정 대신 데이터로 대화", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 대중교통 대안 제시 → 운전 포기가 아닌 이동 선택지 확장", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 가족 공유 리포트 자동 생성 → 면허 반납 대화의 자연스러운 시작점", { size: 20, color: "333333" })], spacing: { before: 20, after: 100 }, indent: { left: 600 } }),

          // 구체적 기획 상세 내용
          new Paragraph({ children: [run("○ 구체적 기획 상세 내용", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),

          new Paragraph({ children: [run("【서비스 이용 흐름】", { size: 21, bold: true })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("① 출발지·도착지 입력 (카카오 로컬 검색 API 연동)", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("② 출발 시각·연령대(60/70/80대) 선택", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("③ '분석 시작' 클릭 → 서버에서 5개 데이터소스 병렬 조회", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("④ 운전 위험 지수·대중교통 대안·혼잡도·날씨·지도 결과 화면 표시", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("⑤ Claude AI가 가족에게 보내는 감성 리포트 자동 생성 → 복사 공유", { size: 20, color: "333333" })], spacing: { before: 20, after: 80 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("【기술 스택】", { size: 21, bold: true })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· 프론트엔드/백엔드: Next.js 15 (App Router, TypeScript)", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 데이터베이스: Supabase (PostgreSQL) — TAAS·AFC 데이터 적재", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· AI 리포트: Anthropic Claude Haiku (claude-haiku-4-5)", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 지도: OpenStreetMap + Leaflet.js (도메인 제약 없음, 무료)", { size: 20, color: "333333" })], spacing: { before: 20, after: 100 }, indent: { left: 600 } }),

          // 차별성
          new Paragraph({ children: [run("○ 기존 유사 아이디어·제품 등과의 차별성", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("· 기존 길찾기 앱(네이버·카카오): 경로 안내 중심, 고령 운전자 특화 위험 분석 없음", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· 운전 보험 앱: 실시간 주행 감지 방식, 이동 전 사전 판단 불가", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· SilverWay 차별점: ① 이동 전(사전) 분석 ② 공공데이터 5종 통합 ③ AI 감성 가족 리포트 ④ 면허 반납 강요 없는 대화 유도 방식", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 20, after: 80 }, indent: { left: 400 } }),
        ]),
        blank(200),

        // ── 나. 분석 방법 및 시사점 ──
        subTitle("나. 분석 방법 및 시사점"),
        boxedParagraph([
          // 분석 데이터 선정 이유
          new Paragraph({ children: [run("○ 분석 데이터 선정 이유", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("고령 운전 안전 분야에서 신뢰도 높은 3개 공공데이터를 핵심 변수로 선정하였습니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("① TAAS 교통사고분석시스템 (도로교통공단)", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("시·군·구별 고령 운전자(65세 이상) 사고 건수, 치사 건수, 중상 건수 데이터를 수록합니다. 출발지 주소에서 행정구역(시군구)을 추출해 해당 지역의 사고 패턴을 운전 위험 지수에 반영하며, 이는 지수에서 최대 50점(50%)을 차지하는 핵심 변수입니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("② AFC 열차 재차인원 데이터 (대전도시철도공사)", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("열차별·역별·시간대별·방향별 승차 인원을 집계한 데이터입니다. 대중교통 경로의 첫 번째 지하철 역명과 출발 시간대를 추출하여, 해당 역·시간대의 과거 평균 재차인원을 전체 시간대 평균과 비교해 혼잡도(낮음/보통/높음)를 예측합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("③ 기상청 단기예보 API (공공데이터포털)", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("격자 좌표(nx, ny) 기반으로 출발지 인근의 강수 형태(맑음/비/눈), 강수량, 풍속, 기온을 조회합니다. 기상 조건은 고령 운전자에게 미치는 영향이 크므로 운전 위험 지수에 최대 15점 반영됩니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 100 }, indent: { left: 600 } }),

          // 사용 분석 기법
          new Paragraph({ children: [run("○ 사용 분석 기법", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),

          new Paragraph({ children: [run("【운전 위험 지수 산정 — 다중 요인 가중 합산 방식】", { size: 21, bold: true })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("총 5개 요인을 합산해 0~100점 척도의 운전 위험 지수를 산출합니다. 이 점수는 실제 사고 확률이 아닌 의사결정 보조용 위험 지수입니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("┌─────────────────────────────────────────────┐", { size: 18, color: "444444" })], spacing: { before: 20, after: 0 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("│  운전 위험 지수 = 지역사고패턴(max 50)          │", { size: 18, color: "444444" })], spacing: { before: 0, after: 0 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("│              + 시간대 위험(max 15)             │", { size: 18, color: "444444" })], spacing: { before: 0, after: 0 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("│              + 기상 위험(max 15)               │", { size: 18, color: "444444" })], spacing: { before: 0, after: 0 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("│              + 연령대 보정(max 10)             │", { size: 18, color: "444444" })], spacing: { before: 0, after: 0 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("│              + 경로 지역 보정(max 10)          │", { size: 18, color: "444444" })], spacing: { before: 0, after: 0 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("└─────────────────────────────────────────────┘", { size: 18, color: "444444" })], spacing: { before: 0, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("· 지역 사고 패턴: TAAS riskScore를 0~50점으로 정규화 (normalizeScore)", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 시간대 위험: 심야/새벽 15점, 저녁 12점, 퇴근 10점, 오전·낮 5점, 출근 8점", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 기상 위험: KMA 예보의 강수 형태·강수량·풍속을 0~100점으로 환산 후 15점으로 정규화", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 연령대 보정: 60대 4점, 70대 7점, 80대 이상 10점 (반응속도·시력 저하 감안)", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("· 위험 등급: 70점 이상 HIGH(높음) / 40~69점 MEDIUM(보통) / 39점 이하 LOW(낮음)", { size: 20, color: "333333" })], spacing: { before: 20, after: 80 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("【혼잡도 예측 — AFC 재차인원 비율 분석】", { size: 21, bold: true })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("혼잡도 비율(ratio) = 해당 역·시간대 평균 재차인원 ÷ 전체 역·시간대 평균 재차인원", { size: 20, color: "333333" })], spacing: { before: 40, after: 20 }, indent: { left: 600 } }),
          new Paragraph({ children: [run("ratio ≥ 1.2 → HIGH(높음) / 0.8 ≤ ratio < 1.2 → MEDIUM(보통) / ratio < 0.8 → LOW(낮음)", { size: 20, color: "333333" })], spacing: { before: 20, after: 100 }, indent: { left: 600 } }),

          // 공공데이터 활용 내용
          new Paragraph({ children: [run("○ 공공데이터포털 등을 활용한 공공데이터 활용 내용", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("① TAAS 교통사고분석시스템 — 도로교통공단 공공데이터포털 제공", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 40, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("   시·군·구별 고령 운전자 사고 건수·치사 건수·중상 건수·위험점수 → Supabase(accident_areas 테이블)에 사전 적재 후 출발지 시군구 단위로 실시간 조회", { size: 20, color: "333333" })], spacing: { before: 20, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("② AFC 열차 재차인원 데이터 — 대전도시철도공사 데이터", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 40, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("   역명·시간(시)·방향(상행/하행)·승차인원 long format으로 전처리 → Supabase(afc_station_loads 테이블)에 적재 → 역명 매핑 후 혼잡도 산출", { size: 20, color: "333333" })], spacing: { before: 20, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("③ 기상청 단기예보 API — 공공데이터포털 (https://apis.data.go.kr)", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 40, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("   출발지 위경도를 기상청 격자 좌표(nx, ny)로 변환 후 단기예보 조회. 강수형태(PTY)·강수량(RN1)·풍속(WSD)·기온(TMP) 활용", { size: 20, color: "333333" })], spacing: { before: 20, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("④ ODsay 대중교통 경로 API — 실시간 대중교통 경로 조회 (서버측 호출)", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 40, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("   출발·도착 위경도 기반 최적 대중교통 경로(소요시간·환승횟수·이동수단별 단계) 조회. 실패 시 사전 정의된 fallback 경로로 대체", { size: 20, color: "333333" })], spacing: { before: 20, after: 100 }, indent: { left: 400 } }),

          // 상세 분석 내용
          new Paragraph({ children: [run("○ 상세 분석 내용 및 시사점", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("· 모든 분석은 서버사이드(Next.js API Route)에서 병렬 처리되어 응답 시간을 최소화합니다.", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· TAAS·AFC 데이터는 Supabase에 사전 적재된 정적 데이터로, 실시간 크롤링 없이 안정적으로 운영됩니다.", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· 외부 API(기상청·ODsay) 호출 실패 시 fallback 데이터로 자동 대체되어 서비스 가용성을 유지합니다.", { size: 20, color: "333333" })], spacing: { before: 20, after: 20 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("· AI 리포트(Claude Haiku)는 분석 결과를 입력으로 받아 가족 공유용 감성 메시지를 생성하며, 실패 시 템플릿 기반 메시지로 fallback됩니다.", { size: 20, color: "333333" })], spacing: { before: 20, after: 80 }, indent: { left: 400 } }),
        ]),
        blank(200),

        // ── 다. 활용방안 및 기대효과 ──
        subTitle("다. 활용방안 및 기대효과"),
        boxedParagraph([
          new Paragraph({ children: [run("○ 대전광역시 정책과의 부합성 및 활용 가능성", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),

          new Paragraph({ children: [run("▸ 고령 친화 도시 정책 연계", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("대전광역시는 '고령 친화 도시 액션플랜'을 추진 중입니다. SilverWay는 고령 시민의 이동권 보장과 안전 도모를 동시에 지원하여 이 정책 방향과 직접 부합합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("▸ 면허 반납 인센티브 정책 보완 도구", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("대전시는 고령 운전자 면허 반납 시 교통카드를 지원하는 인센티브 제도를 운영 중입니다. SilverWay는 반납 전 의사결정 단계에서 객관적인 근거를 제공함으로써 이 제도의 실질적 활용률을 높이는 보완 서비스 역할을 할 수 있습니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("▸ 대전 공공데이터 직접 활용", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("대전 도시철도 AFC 재차인원 데이터와 대전시 권역 TAAS 사고 데이터를 직접 활용합니다. 대전 지역 특화 서비스로서 노인복지관, 구청 복지과, 치매안심센터 등 공공시설과 연계·배포가 가능합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 100 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("○ 아이디어 / 제품 사용을 통한 사회적 파급효과", { size: 22, bold: true })], spacing: { before: 80, after: 60 }, indent: { left: 200 } }),

          new Paragraph({ children: [run("① 고령 운전자 교통사고 예방", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("공공데이터 기반 객관적 위험 지수 제공으로 고위험 경로·시간대의 운전을 줄이고, 고령 운전자 사고 감소에 기여합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("② 가족 간 소통 문화 개선", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("AI가 생성한 따뜻한 가족 공유 메시지를 통해, 면허 반납이라는 민감한 주제를 강요 없이 자연스럽게 꺼낼 수 있는 가족 소통의 계기를 마련합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("③ 대중교통 이용 활성화", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("대중교통 대안 경로와 혼잡도 예측을 함께 제공하여 고령 시민의 대중교통 이용 장벽을 낮추고, 대전 1호선 수요 다양화에 기여합니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 60 }, indent: { left: 600 } }),

          new Paragraph({ children: [run("④ 고령자 이동 자립성 존중", { size: 21, bold: true, color: "1F3080" })], spacing: { before: 60, after: 40 }, indent: { left: 400 } }),
          new Paragraph({ children: [run("단순 제한이 아닌 '선택지 제공' 방식으로 고령 시민의 자기결정권을 존중합니다. 디지털 취약계층을 고려한 모바일 최적화 UI로 접근성을 높였습니다.", { size: 20, color: "333333" })], spacing: { before: 40, after: 80 }, indent: { left: 600 } }),
        ]),
        blank(200),

        // ── 라. 참고 문헌 ──
        subTitle("라. 참고 문헌 출처 등"),
        boxedParagraph([
          new Paragraph({ children: [run("① 도로교통공단 TAAS 교통사고분석시스템", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 80, after: 20 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("https://taas.koroad.or.kr — 시·군·구별 고령 운전자 교통사고 통계", { size: 20, color: "333333" })], spacing: { before: 0, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("② 공공데이터포털 기상청 단기예보 조회서비스", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 60, after: 20 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("https://www.data.go.kr — VilageFcstInfoService_2.0 getVilageFcst", { size: 20, color: "333333" })], spacing: { before: 0, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("③ ODsay 대중교통 경로 API", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 60, after: 20 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("https://api.odsay.com — searchPubTransPathT (대중교통 경로 탐색)", { size: 20, color: "333333" })], spacing: { before: 0, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("④ 대전광역시도시철도공사 AFC 열차 재차인원 데이터", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 60, after: 20 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("대전 1호선 역별·시간대별·방향별 승차인원 집계 데이터", { size: 20, color: "333333" })], spacing: { before: 0, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("⑤ 카카오 로컬 검색 API", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 60, after: 20 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("https://developers.kakao.com — 장소 검색 및 좌표 반환", { size: 20, color: "333333" })], spacing: { before: 0, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("⑥ Anthropic Claude Haiku API", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 60, after: 20 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("https://docs.anthropic.com — claude-haiku-4-5 모델, 가족 리포트 자동 생성", { size: 20, color: "333333" })], spacing: { before: 0, after: 60 }, indent: { left: 400 } }),

          new Paragraph({ children: [run("⑦ 도로교통공단, \"고령 운전자 교통사고 특성 분석 및 대응 방안 연구\", 2023", { size: 20, color: "333333" })], spacing: { before: 60, after: 60 }, indent: { left: 200 } }),
          new Paragraph({ children: [run("⑧ 서비스 URL: https://silverway.codegenie.co.kr", { size: 20, bold: true, color: "1F3080" })], spacing: { before: 60, after: 80 }, indent: { left: 200 } }),
        ]),
        blank(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [run("※ 결과내용을 HWP 또는 PDF형식으로 10매 이내 작성", { size: 22, bold: true, italics: true })],
        }),
      ],
    },
  ],
});

const buffer = await Packer.toBuffer(doc);
writeFileSync("SilverWay_제안서.docx", buffer);
console.log("✓ SilverWay_제안서.docx 생성 완료");
