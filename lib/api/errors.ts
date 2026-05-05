const SAFE_REASON_MAX_LEN = 120;

export function toSafeErrorReason(error: unknown): string {
  if (!error) return "알 수 없는 오류";
  if (typeof error === "string") {
    return error.slice(0, SAFE_REASON_MAX_LEN);
  }
  if (error instanceof Error) {
    // Stack trace 전체는 노출하지 않는다
    const msg = error.message || error.name || "오류";
    return msg.slice(0, SAFE_REASON_MAX_LEN);
  }
  return "요청 처리 중 오류가 발생했습니다.";
}

export function getUserFriendlyMessage(source: string): string {
  switch (source) {
    case "ODSAY":
      return "대중교통 경로를 불러오지 못했습니다. 예시 경로를 참고해 주세요.";
    case "KMA":
    case "WEATHER":
      return "날씨 정보를 불러오지 못했습니다. 예시 기상 조건을 참고해 주세요.";
    case "CLAUDE":
      return "AI 리포트를 생성하지 못했습니다. 기본 안내 리포트를 확인해 주세요.";
    case "KAKAO":
      return "장소 검색 결과를 불러오지 못했습니다. 추천 장소 목록을 참고해 주세요.";
    case "KAKAO_MAP":
      return "지도를 불러오지 못해도 분석 결과는 계속 확인할 수 있습니다.";
    case "SUPABASE":
      return "결과 저장에 실패했습니다. 현재 화면에서 결과를 확인해 주세요.";
    default:
      return "일부 외부 데이터를 불러오지 못해 예시 데이터를 함께 사용했습니다.";
  }
}
