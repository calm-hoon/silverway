import {
  Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, AlignmentType, BorderStyle,
  WidthType, ShadingType, VerticalAlign, TableLayoutType,
  convertInchesToTwip,
} from "docx";
import { writeFileSync } from "fs";

const KO_FONT = "맑은 고딕";
const RED_BG    = "FFF0F0";
const GREEN_BG  = "F0FFF4";
const RED_TEXT  = "B91C1C";
const GREEN_TEXT= "15803D";
const GRAY_TEXT = "333333";
const BLUE_DARK = "1F3080";
const HEADER_BG = "1F3080";

function run(text, opts = {}) {
  return new TextRun({ text, font: KO_FONT, ...opts });
}

function blank(space = 100) {
  return new Paragraph({ children: [run("")], spacing: { before: 0, after: space } });
}

function sectionTitle(text) {
  return new Paragraph({
    children: [run(text, { size: 26, bold: true, color: "FFFFFF" })],
    shading: { type: ShadingType.SOLID, color: HEADER_BG },
    spacing: { before: 300, after: 200 },
    indent: { left: 200 },
  });
}

function subTitle(text) {
  return new Paragraph({
    children: [run(text, { size: 22, bold: true, color: BLUE_DARK })],
    spacing: { before: 160, after: 100 },
    indent: { left: 200 },
  });
}

function noteP(text) {
  return new Paragraph({
    children: [run(text, { size: 18, color: "555555", italics: true })],
    spacing: { before: 40, after: 60 },
    indent: { left: 200 },
  });
}

// ─── Before / After 비교 테이블 ───────────────────────────────
function makeBeforeAfterTable(no, location, before, after, note) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 6, color: "AAAACC" },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "AAAACC" },
      left:   { style: BorderStyle.SINGLE, size: 6, color: "AAAACC" },
      right:  { style: BorderStyle.SINGLE, size: 6, color: "AAAACC" },
      insideH:{ style: BorderStyle.SINGLE, size: 2, color: "DDDDEE" },
      insideV:{ style: BorderStyle.SINGLE, size: 2, color: "DDDDEE" },
    },
    rows: [
      // 헤더 행
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: HEADER_BG },
            width: { size: 6, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(`No.${no}`, { size: 19, bold: true, color: "FFFFFF" })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: HEADER_BG },
            width: { size: 94, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 100 },
            children: [new Paragraph({ children: [run(`[위치] ${location}`, { size: 19, bold: true, color: "FFFFFF" })] })],
          }),
        ],
      }),
      // Before 행
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "FFE4E4" },
            width: { size: 6, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("Before\n(PDF)", { size: 18, bold: true, color: RED_TEXT })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: RED_BG },
            width: { size: 94, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [run(before, { size: 19, color: RED_TEXT })] })],
          }),
        ],
      }),
      // After 행
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "DCFCE7" },
            width: { size: 6, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 80, right: 80 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("After\n(실제)", { size: 18, bold: true, color: GREEN_TEXT })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: GREEN_BG },
            width: { size: 94, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100, left: 120, right: 120 },
            children: [new Paragraph({ children: [run(after, { size: 19, color: GREEN_TEXT })] })],
          }),
        ],
      }),
      // 비고 행 (있을 때만)
      ...(note ? [new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "F5F5FF" },
            width: { size: 6, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 80, right: 80 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("비고", { size: 17, bold: true, color: BLUE_DARK })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: "F5F5FF" },
            width: { size: 94, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [run(note, { size: 18, color: "555577", italics: true })] })],
          }),
        ],
      })] : []),
    ],
  });
}

// ─── 수정 항목 목록 ─────────────────────────────────────────
const corrections = [
  {
    no: 1,
    section: "가. 기획 상세 내용 > 구체적 기획 상세 내용 > 기술 구현 현황",
    location: "지도 구현 라이브러리",
    before: "지도: Kakao Map JavaScript SDK — 출·도착지 마커 시각화",
    after: "지도: Leaflet (react-leaflet) — 출·도착지 마커 및 경로선 시각화\n※ Kakao Map SDK(KakaoMap.tsx)는 코드에 존재하나 결과 화면(MapSection.tsx)에서는 LeafletMap을 사용 중",
    note: "MapSection.tsx 가 LeafletMap을 직접 임포트함. KakaoMap은 API키 부재 시 fallback 용도로만 존재. package.json에 leaflet ^1.9.4 의존성 명시.",
  },
  {
    no: 2,
    section: "나. 분석 방법 및 시사점 > 사용 분석 기법 > 기상 위험",
    location: "기상 위험 지수 산출 파라미터",
    before: "KMA PTY(강수형태)·RN1(강수량)·WSD(풍속) 기반 0~100점 환산 후 15점 정규화",
    after: "KMA PTY(강수형태)·POP(강수확률)·WSD(풍속) 기반 0~100점 환산 후 15점 정규화\n(RN1 대신 POP 사용)",
    note: "normalizeWeatherForecast.ts의 calcRiskScore 함수: PTY·WSD·POP 값으로 점수 산출. RN1 항목은 코드에서 읽지 않음.",
  },
  {
    no: 3,
    section: "나. 분석 방법 및 시사점 > 상세 분석 내용 > 기상 연동 위험도 실시간 보정",
    location: "기상청 API 수집 항목",
    before: "강우량, 가시거리, 노면 온도 데이터를 실시간 수집합니다.",
    after: "PTY(강수형태), SKY(하늘상태), WSD(풍속), POP(강수확률), TMP(기온) 데이터를 수집합니다.\n가시거리(VVV)·노면온도는 수집하지 않습니다.",
    note: "normalizeWeatherForecast.ts 참고. getValue() 호출 카테고리: PTY, SKY, WSD, POP, TMP 만 사용.",
  },
  {
    no: 4,
    section: "나. 분석 방법 및 시사점 > 상세 분석 내용 > AFC 혼잡도 추론 및 대체 경로 설계",
    location: "AFC 혼잡도 모델 방식",
    before: "대전교통공사 AFC DB의 1년치 시계열 데이터를 요일, 시간대, 기상 조건 변수로 학습하여 과거 이용 패턴을 기반으로 혼잡도를 예측하는 모델을 구축합니다.",
    after: "AFC 재차인원 데이터를 역·시간대 단위로 집계하여 ratio = 해당 역·시간대 평균 ÷ 전체 평균 공식으로 혼잡도를 산출합니다. 요일·기상 조건 변수는 사용하지 않습니다.",
    note: "calculateCongestion.ts: filterStationLoads → 평균 계산 → ratio 비교로 HIGH/MEDIUM/LOW 판정. ML 학습 모델 없음. calculateCongestion 함수 파라미터에 요일·기상 조건 없음.",
  },
  {
    no: 5,
    section: "나. 분석 방법 및 시사점 > 상세 분석 내용 > AFC 혼잡도 추론 및 대체 경로 설계",
    location: "대중교통 경로 결합 API",
    before: "추론 결과를 카카오 모빌리티 API의 도보 경로 옵션과 결합하여, 혼잡도가 낮은 시간대에 이동 편의성을 고려한 환승 경로를 도출합니다.",
    after: "ODsay 대중교통 경로 API(getTransitRoute)로 최적 경로·소요시간·환승 횟수를 조회하며, 카카오 모빌리티 API는 사용하지 않습니다.",
    note: "lib/odsay/getTransitRoute.ts 참고. analyze/route.ts 내 Promise.all에서 getTransitRoute만 호출. 카카오 모빌리티 SDK 의존성 없음.",
  },
  {
    no: 6,
    section: "나. 분석 방법 및 시사점 > 상세 분석 내용 > 면허 반납 시뮬레이션 산출",
    location: "면허 반납 경제적 이득 시뮬레이션",
    before: "차량 연간 유지비, 보험료, 대전시 반납 지원금(최대 20만 원)을 합산한 경제적 이득을 함께 제시하여 의사결정의 근거를 수치로 명확히 전달합니다.",
    after: "해당 기능은 현재 미구현입니다. 결과 화면에서 경제적 시뮬레이션 수치는 제공되지 않습니다.",
    note: "components/result/ 및 app/api/ 전체에 면허 반납 비용 시뮬레이션 관련 코드 없음. 삭제 또는 '향후 계획' 항목으로 이동 권장.",
  },
  {
    no: 7,
    section: "나. 분석 방법 및 시사점 > 상세 분석 내용 (첫 문단)",
    location: "카카오맵 히트맵 시각화",
    before: "65세 이상 가해 운전자 교통사고 데이터를 기반으로 대전시 5개 구별 사고 건수를 집계하고, 카카오맵 히트맵으로 가시화합니다.",
    after: "사고 데이터는 Supabase accident_areas 테이블에 사전 적재하여 실시간 조회하며, 히트맵 시각화 기능은 현재 미구현입니다. 지도에는 출발지·도착지 마커만 표시됩니다.",
    note: "components/map/ 에 히트맵 관련 컴포넌트 없음. 데이터 시각화는 마커와 경로선(Polyline)만 구현.",
  },
  {
    no: 8,
    section: "나. 분석 방법 및 시사점 > 공공데이터 활용 내용",
    location: "대전 빅데이터 오픈랩 데이터 활용",
    before: "대전 빅데이터 오픈랩 — 대전 시내 도로 소통 정보와 교통 패턴 데이터를 고령자 유동인구 밀집 구간과 융합 분석합니다.",
    after: "대전 빅데이터 오픈랩 데이터는 현재 미사용입니다. 실제 활용 데이터는 TAAS·AFC·기상청·ODsay 4종입니다.",
    note: "lib/ 및 scripts/ 전체에 openlab.daejeon.go.kr 관련 코드 없음. 해당 항목은 공모전 계획서에서 삭제 권장.",
  },
];

// ─── 문서 생성 ────────────────────────────────────────────────
const children = [
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [run("SilverWay 공모전 제안서 — 사실 오류 수정 목록", { size: 32, bold: true, color: BLUE_DARK })],
    spacing: { before: 0, after: 120 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [run("PDF(1.pdf) 내용 vs 실제 소스코드 비교 | Before / After 형식", { size: 20, color: "666666" })],
    spacing: { before: 0, after: 60 },
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [run(`작성일: 2026-05-11 | 총 ${corrections.length}건 수정 필요`, { size: 18, color: "888888" })],
    spacing: { before: 0, after: 200 },
  }),

  noteP("※ 아래 Before는 제출된 PDF(1.pdf) 원문 기준이며, After는 실제 구현된 소스코드 기준입니다."),
  noteP("※ 빨간색(Before) → 초록색(After)으로 변경 후 공모전 제출 전 최종 검토 바랍니다."),
  blank(200),
];

for (const c of corrections) {
  children.push(
    sectionTitle(`No.${c.no}  ${c.section}`),
    blank(80),
    ...makeBeforeAfterTable(c.no, c.location, c.before, c.after, c.note).rows
      ? [makeBeforeAfterTable(c.no, c.location, c.before, c.after, c.note)]
      : [],
    blank(240),
  );
}

// 요약표
children.push(
  sectionTitle("수정 항목 요약"),
  blank(80),
  new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "AAAACC" },
      insideH: { style: BorderStyle.SINGLE, size: 2, color: "DDDDEE" },
      insideV: { style: BorderStyle.SINGLE, size: 2, color: "DDDDEE" },
    },
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          new TableCell({
            shading: { type: ShadingType.SOLID, color: HEADER_BG },
            width: { size: 6, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 80, right: 80 },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run("No.", { size: 18, bold: true, color: "FFFFFF" })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: HEADER_BG },
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 100, right: 80 },
            children: [new Paragraph({ children: [run("항목", { size: 18, bold: true, color: "FFFFFF" })] })],
          }),
          new TableCell({
            shading: { type: ShadingType.SOLID, color: HEADER_BG },
            width: { size: 74, type: WidthType.PERCENTAGE },
            margins: { top: 80, bottom: 80, left: 100, right: 80 },
            children: [new Paragraph({ children: [run("핵심 차이", { size: 18, bold: true, color: "FFFFFF" })] })],
          }),
        ],
      }),
      ...corrections.map((c) => new TableRow({
        children: [
          new TableCell({
            width: { size: 6, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 80, right: 80 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [run(String(c.no), { size: 18, bold: true, color: BLUE_DARK })] })],
          }),
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 100, right: 80 },
            children: [new Paragraph({ children: [run(c.location, { size: 17, bold: true, color: GRAY_TEXT })] })],
          }),
          new TableCell({
            width: { size: 74, type: WidthType.PERCENTAGE },
            margins: { top: 60, bottom: 60, left: 100, right: 80 },
            children: [
              new Paragraph({ children: [run("PDF: ", { size: 17, bold: true, color: RED_TEXT }), run(c.before.replace(/\n/g, " "), { size: 17, color: RED_TEXT })] }),
              new Paragraph({ children: [run("실제: ", { size: 17, bold: true, color: GREEN_TEXT }), run(c.after.replace(/\n/g, " "), { size: 17, color: GREEN_TEXT })] }),
            ],
          }),
        ],
      })),
    ],
  }),
);

const doc = new Document({
  styles: {
    default: { document: { run: { font: KO_FONT, size: 20 } } },
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
writeFileSync("SilverWay_사실오류_수정목록.docx", buffer);
console.log("✓ SilverWay_사실오류_수정목록.docx 생성 완료");
