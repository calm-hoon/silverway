import type { Place } from "@/types";
import type { KakaoPlaceDocument, KakaoLocalRawResponse } from "./types";

// Kakao Local API: x = 경도(lng), y = 위도(lat)
function documentToPlace(doc: KakaoPlaceDocument): Place | null {
  const name = doc.place_name?.trim();
  if (!name) return null;

  const lat = parseFloat(doc.y ?? "");
  const lng = parseFloat(doc.x ?? "");
  if (!isFinite(lat) || !isFinite(lng)) return null;

  const address = (doc.road_address_name?.trim() || doc.address_name?.trim()) ?? "";

  return {
    name,
    address,
    lat,
    lng,
    ...(doc.category_name ? { category: doc.category_name } : {}),
    ...(doc.phone ? { phone: doc.phone } : {}),
    source: "KAKAO_LOCAL",
  };
}

function dedup(places: Place[]): Place[] {
  const seen = new Set<string>();
  return places.filter((p) => {
    const key = `${p.name}|${p.address}|${p.lat}|${p.lng}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeKakaoPlaces(raw: unknown): Place[] {
  try {
    if (!raw || typeof raw !== "object") return [];

    const response = raw as KakaoLocalRawResponse;
    const docs = response.documents;
    if (!Array.isArray(docs) || docs.length === 0) return [];

    const places: Place[] = [];
    for (const doc of docs) {
      const place = documentToPlace(doc as KakaoPlaceDocument);
      if (place) places.push(place);
    }

    return dedup(places);
  } catch {
    return [];
  }
}
