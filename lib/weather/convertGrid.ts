// 기상청 단기예보는 위경도가 아니라 Lambert Conformal Conic 격자(nx, ny)를 사용한다.
// 아래는 기상청 공식 변환 계수를 사용한 순수 변환 함수다.

const DEGRAD = Math.PI / 180.0;

const RE = 6371.00877;  // 지구 반경 (km)
const GRID = 5.0;        // 격자 간격 (km)
const SLAT1 = 30.0 * DEGRAD;  // 표준 위도1 (rad)
const SLAT2 = 60.0 * DEGRAD;  // 표준 위도2 (rad)
const OLON = 126.0 * DEGRAD;  // 기준점 경도 (rad)
const OLAT = 38.0 * DEGRAD;   // 기준점 위도 (rad)
const XO = 43;  // 기준점 x 격자
const YO = 136; // 기준점 y 격자

// 변환 계수를 모듈 로드 시 한 번만 계산
const re = RE / GRID;
const sn =
  Math.log(Math.cos(SLAT1) / Math.cos(SLAT2)) /
  Math.log(Math.tan(Math.PI * 0.25 + SLAT2 * 0.5) / Math.tan(Math.PI * 0.25 + SLAT1 * 0.5));
const sf = (Math.pow(Math.tan(Math.PI * 0.25 + SLAT1 * 0.5), sn) * Math.cos(SLAT1)) / sn;
const ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + OLAT * 0.5), sn);

/** 대전 기본 격자 — 좌표 변환 실패 시 fallback */
export const DAEJEON_GRID = { nx: 67, ny: 100 };

/** 위경도 → 기상청 단기예보 격자 좌표 변환 (순수 함수) */
export function convertLatLngToGrid(lat: number, lng: number): { nx: number; ny: number } {
  if (!isFinite(lat) || !isFinite(lng)) return DAEJEON_GRID;

  const ra = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5), sn);
  let theta = lng * DEGRAD - OLON;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const nx = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  const ny = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);

  return { nx, ny };
}
