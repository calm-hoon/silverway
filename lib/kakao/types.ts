import type { Place } from "@/types";

export type KakaoPlaceSearchRequest = {
  query: string;
  size?: number;
  page?: number;
  region?: string;
};

export type KakaoPlaceSearchResult =
  | { ok: true; places: Place[]; source: "KAKAO" }
  | { ok: false; places: Place[]; source: "FALLBACK"; reason: string };

export type KakaoPlaceDocument = {
  place_name?: string;
  address_name?: string;
  road_address_name?: string;
  x?: string; // 경도(lng)
  y?: string; // 위도(lat)
  category_name?: string;
  phone?: string;
  place_url?: string;
};

export type KakaoLocalRawResponse = {
  documents?: KakaoPlaceDocument[];
  meta?: {
    total_count?: number;
    pageable_count?: number;
    is_end?: boolean;
  };
};
