export type HealthCheckData = {
  ok: boolean;
  service: string;
  status: string;
  environment: string;
  checks: Record<string, boolean>;
  message: string;
};

export function buildHealthCheckData(): HealthCheckData {
  return {
    ok: true,
    service: "SilverWay",
    status: "ready",
    environment: process.env.NODE_ENV ?? "unknown",
    checks: {
      supabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      supabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      kakaoMapKey: Boolean(process.env.NEXT_PUBLIC_KAKAO_MAP_KEY),
      kakaoRestApiKey: Boolean(process.env.KAKAO_REST_API_KEY),
      odsayApiKey: Boolean(process.env.ODSAY_API_KEY),
      weatherApiKey: Boolean(process.env.WEATHER_API_KEY),
      anthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
    },
    message: "SilverWay health check is available.",
  };
}
