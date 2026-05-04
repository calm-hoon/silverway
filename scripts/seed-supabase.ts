/**
 * SilverWay Supabase seed 스크립트
 * 실행: npx tsx scripts/seed-supabase.ts
 *
 * SUPABASE_SERVICE_ROLE_KEY는 서버/로컬 seed 전용입니다.
 * 클라이언트 번들에 포함되어선 안 됩니다.
 */

import { createClient } from "@supabase/supabase-js";
import accidentAreas from "../data/processed/sample-accident-areas.json";
import afcStationLoads from "../data/processed/sample-afc-station-loads.json";
import stationAliases from "../data/processed/sample-station-aliases.json";

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[seed] 환경변수 누락: ${key}`);
    process.exit(1);
  }
  return value;
}

async function seedAccidentAreas(client: ReturnType<typeof createClient>) {
  console.log("[seed] accident_areas 삽입 시작...");
  const { error } = await client.from("accident_areas").insert(accidentAreas);
  if (error) {
    console.error("[seed] accident_areas 삽입 실패:", error.message);
  } else {
    console.log(`[seed] accident_areas ${accidentAreas.length}건 삽입 완료`);
  }
}

async function seedAfcStationLoads(client: ReturnType<typeof createClient>) {
  console.log("[seed] afc_station_loads 삽입 시작...");
  const { error } = await client.from("afc_station_loads").insert(afcStationLoads);
  if (error) {
    console.error("[seed] afc_station_loads 삽입 실패:", error.message);
  } else {
    console.log(`[seed] afc_station_loads ${afcStationLoads.length}건 삽입 완료`);
  }
}

async function seedStationAliases(client: ReturnType<typeof createClient>) {
  console.log("[seed] station_aliases 삽입 시작...");
  const { error } = await client.from("station_aliases").upsert(stationAliases, {
    onConflict: "odsay_station_name,afc_station_name",
  });
  if (error) {
    console.error("[seed] station_aliases 삽입 실패:", error.message);
  } else {
    console.log(`[seed] station_aliases ${stationAliases.length}건 삽입 완료`);
  }
}

async function main() {
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  await seedAccidentAreas(client);
  await seedAfcStationLoads(client);
  await seedStationAliases(client);

  console.log("[seed] 완료");
}

main().catch((err) => {
  console.error("[seed] 예기치 않은 오류:", err);
  process.exit(1);
});
