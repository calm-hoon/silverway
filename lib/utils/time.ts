// ISO 8601 문자열에서 서버 실행 타임존과 무관하게 KST(UTC+9) 기준 시각을 계산한다.
// new Date().getHours()는 서버 로컬 타임존(배포 환경에서는 보통 UTC)에 따라 값이
// 달라지므로 사용하지 않는다. getUTCHours() 기반으로 계산해 입력 문자열이
// "Z"(UTC)든 "+09:00"(KST 오프셋)든 항상 동일한 KST 벽시계 값을 반환한다.

export type KstTime = { hour: number; minute: number };

export function getKstTime(iso?: string | null): KstTime | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return { hour: kst.getUTCHours(), minute: kst.getUTCMinutes() };
}

export function getKstHour(iso?: string | null): number | null {
  return getKstTime(iso)?.hour ?? null;
}

export type KstDateTime = { year: number; month: number; day: number; hour: number; minute: number };

/** ISO 8601 문자열에서 KST 기준 연/월/일/시/분을 모두 추출한다. */
export function getKstDateTime(iso?: string | null): KstDateTime | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (isNaN(date.getTime())) return null;
  const kst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
  };
}

/** 주어진 KST 벽시계 연/월/일/시/분을 명시적 +09:00 오프셋 ISO 8601 문자열로 조합한다. */
export function buildKstIso(year: number, month: number, day: number, hour: number, minute = 0): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+09:00`;
}
