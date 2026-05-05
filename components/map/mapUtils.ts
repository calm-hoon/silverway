import type { Place } from "@/types";
import type { MapPoint } from "./types";

const DAEJEON_CENTER = { lat: 36.3504, lng: 127.3845 };

export function isValidCoordinate(lat?: number, lng?: number): boolean {
  if (lat === undefined || lat === null || lng === undefined || lng === null) return false;
  if (!isFinite(lat) || !isFinite(lng)) return false;
  if (isNaN(lat) || isNaN(lng)) return false;
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function createMapPointFromPlace(
  place: Place,
  type: MapPoint["type"]
): MapPoint | null {
  if (!isValidCoordinate(place.lat, place.lng)) return null;
  return {
    name: place.name,
    address: place.address,
    lat: place.lat,
    lng: place.lng,
    type,
  };
}

export function getMapCenter(
  origin?: MapPoint,
  destination?: MapPoint
): { lat: number; lng: number } {
  if (origin && destination) {
    return {
      lat: (origin.lat + destination.lat) / 2,
      lng: (origin.lng + destination.lng) / 2,
    };
  }
  if (origin) return { lat: origin.lat, lng: origin.lng };
  if (destination) return { lat: destination.lat, lng: destination.lng };
  return getDaejeonDefaultCenter();
}

export function getDaejeonDefaultCenter(): { lat: number; lng: number } {
  return { ...DAEJEON_CENTER };
}
