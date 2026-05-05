import type { Place, RecentPlace, RecentRoute } from "@/types";

const RECENT_PLACES_KEY = "silverway:recent-places";
const RECENT_ROUTES_KEY = "silverway:recent-routes";
const MAX_RECENT_PLACES = 10;
const MAX_RECENT_ROUTES = 5;

function isWindowAvailable(): boolean {
  return typeof window !== "undefined";
}

function makePlaceId(place: Place): string {
  const addr = place.address?.trim();
  return addr || `${place.name}:${place.lat}:${place.lng}`;
}

function makeRouteId(origin: Place, destination: Place): string {
  return `${makePlaceId(origin)}→${makePlaceId(destination)}`;
}

function readStorage<T>(key: string): T[] {
  if (!isWindowAvailable()) return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as T[];
  } catch {
    return [];
  }
}

function writeStorage<T>(key: string, data: T[]): void {
  if (!isWindowAvailable()) return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded 또는 private mode — 무시
  }
}

export function getRecentPlaces(): RecentPlace[] {
  return readStorage<RecentPlace>(RECENT_PLACES_KEY);
}

export function saveRecentPlace(place: Place): RecentPlace[] {
  if (!place.name || !place.lat || !place.lng) return getRecentPlaces();
  const id = makePlaceId(place);
  const now = new Date().toISOString();
  const existing = getRecentPlaces().filter((p) => p.id !== id);
  const updated: RecentPlace[] = [{ ...place, id, lastUsedAt: now }, ...existing].slice(
    0,
    MAX_RECENT_PLACES
  );
  writeStorage(RECENT_PLACES_KEY, updated);
  return updated;
}

export function removeRecentPlace(id: string): RecentPlace[] {
  const updated = getRecentPlaces().filter((p) => p.id !== id);
  writeStorage(RECENT_PLACES_KEY, updated);
  return updated;
}

export function clearRecentPlaces(): void {
  writeStorage(RECENT_PLACES_KEY, []);
}

export function getRecentRoutes(): RecentRoute[] {
  return readStorage<RecentRoute>(RECENT_ROUTES_KEY);
}

export function saveRecentRoute(input: { origin: Place; destination: Place }): RecentRoute[] {
  const { origin, destination } = input;
  if (!origin.name || !destination.name) return getRecentRoutes();
  const id = makeRouteId(origin, destination);
  const now = new Date().toISOString();
  const existing = getRecentRoutes().filter((r) => r.id !== id);
  const updated: RecentRoute[] = [
    { id, origin, destination, lastUsedAt: now },
    ...existing,
  ].slice(0, MAX_RECENT_ROUTES);
  writeStorage(RECENT_ROUTES_KEY, updated);
  return updated;
}

export function removeRecentRoute(id: string): RecentRoute[] {
  const updated = getRecentRoutes().filter((r) => r.id !== id);
  writeStorage(RECENT_ROUTES_KEY, updated);
  return updated;
}

export function clearRecentRoutes(): void {
  writeStorage(RECENT_ROUTES_KEY, []);
}
