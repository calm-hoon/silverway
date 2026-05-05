import type { FallbackFlags } from "@/types";

export function createDefaultFallbackFlags(): FallbackFlags {
  return {
    analysis: false,
    route: false,
    weather: false,
    report: false,
    place: false,
    map: false,
    storage: false,
  };
}

export function mergeFallbackFlags(
  ...flags: Array<Partial<FallbackFlags> | undefined>
): FallbackFlags {
  const base = createDefaultFallbackFlags();
  for (const flag of flags) {
    if (!flag) continue;
    if (flag.analysis !== undefined) base.analysis = base.analysis || flag.analysis;
    if (flag.route !== undefined) base.route = base.route || flag.route;
    if (flag.weather !== undefined) base.weather = base.weather || flag.weather;
    if (flag.report !== undefined) base.report = base.report || flag.report;
    if (flag.place !== undefined) base.place = base.place || flag.place;
    if (flag.map !== undefined) base.map = base.map || flag.map;
    if (flag.storage !== undefined) base.storage = base.storage || flag.storage;
  }
  return base;
}

export function hasAnyFallback(flags?: FallbackFlags): boolean {
  if (!flags) return false;
  return Object.values(flags).some(Boolean);
}
