import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createAdminClient: vi.fn(),
}));

import { getAfcStationLoads } from "@/lib/data/afcStationLoads";
import { createAdminClient } from "@/lib/supabase/server";

const mockCreateAdminClient = vi.mocked(createAdminClient);

function makeSupabaseChain(aliasData: unknown, loadsData: unknown, loadsError: unknown = null) {
  const loadsChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: loadsData, error: loadsError }),
  };
  const aliasChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: aliasData, error: null }),
  };
  const fromMock = vi.fn((table: string) => {
    if (table === "station_aliases") return aliasChain;
    return loadsChain;
  });
  return { from: fromMock, _aliasChain: aliasChain, _loadsChain: loadsChain };
}

const WEEKDAY_ROWS = [
  { station_name: "시청역", hour: 10, direction: "UP", onboard_count: 450, service_day_type: "WEEKDAY" },
  { station_name: "시청역", hour: 10, direction: "DOWN", onboard_count: 380, service_day_type: "WEEKDAY" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAfcStationLoads — station_aliases 역명 매핑", () => {
  it("station_aliases에 매핑이 있으면 afc_station_name으로 조회한다", async () => {
    const client = makeSupabaseChain({ afc_station_name: "시청역" }, WEEKDAY_ROWS);
    mockCreateAdminClient.mockReturnValue(client as never);

    const result = await getAfcStationLoads({ stationName: "시청", hour: 10 });

    expect(result.ok).toBe(true);
    // afc_station_name "시청역"으로 afc_station_loads를 조회했어야 함
    expect(client._loadsChain.eq).toHaveBeenCalledWith("station_name", "시청역");
  });

  it("station_aliases 매핑 없으면 odsay 역명 + '역' suffix로 조회한다", async () => {
    const client = makeSupabaseChain(null, WEEKDAY_ROWS);
    mockCreateAdminClient.mockReturnValue(client as never);

    const result = await getAfcStationLoads({ stationName: "대전", hour: 10 });

    expect(result.ok).toBe(true);
    expect(client._loadsChain.eq).toHaveBeenCalledWith("station_name", "대전역");
  });

  it("역 suffix가 이미 있으면 중복 추가하지 않는다", async () => {
    const client = makeSupabaseChain(null, WEEKDAY_ROWS);
    mockCreateAdminClient.mockReturnValue(client as never);

    await getAfcStationLoads({ stationName: "대전역", hour: 10 });

    expect(client._loadsChain.eq).toHaveBeenCalledWith("station_name", "대전역");
  });

  it("station_aliases 조회 예외 발생 시 suffix 정규화로 fallback한다", async () => {
    const loadsChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: WEEKDAY_ROWS, error: null }),
    };
    const aliasChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockRejectedValue(new Error("network error")),
    };
    mockCreateAdminClient.mockReturnValue({
      from: (table: string) => (table === "station_aliases" ? aliasChain : loadsChain),
    } as never);

    const result = await getAfcStationLoads({ stationName: "시청", hour: 10 });

    expect(result.ok).toBe(true);
    expect(loadsChain.eq).toHaveBeenCalledWith("station_name", "시청역");
  });
});

describe("getAfcStationLoads — 기본 동작", () => {
  it("역명 없으면 STATION_NAME_EMPTY 반환", async () => {
    const result = await getAfcStationLoads({ stationName: "", hour: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("STATION_NAME_EMPTY");
  });

  it("client가 null이면 DB_CLIENT_MISSING 반환", async () => {
    mockCreateAdminClient.mockReturnValue(null as never);
    const result = await getAfcStationLoads({ stationName: "시청역", hour: 10 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("DB_CLIENT_MISSING");
  });

  it("데이터 있으면 ok:true + loads 배열 반환", async () => {
    const client = makeSupabaseChain({ afc_station_name: "시청역" }, WEEKDAY_ROWS);
    mockCreateAdminClient.mockReturnValue(client as never);

    const result = await getAfcStationLoads({ stationName: "시청역", hour: 10 });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.loads).toHaveLength(2);
      expect(result.loads[0].stationName).toBe("시청역");
      expect(result.loads[0].onboardCount).toBe(450);
    }
  });

  it("데이터 없으면 AFC_DATA_NOT_FOUND 반환", async () => {
    const client = makeSupabaseChain(null, []);
    mockCreateAdminClient.mockReturnValue(client as never);

    const result = await getAfcStationLoads({ stationName: "없는역", hour: 10 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("AFC_DATA_NOT_FOUND");
  });

  it("DB 에러 시 DB_QUERY_FAILED 반환", async () => {
    const client = makeSupabaseChain(null, null, { code: "PGRST116", hint: "" });
    mockCreateAdminClient.mockReturnValue(client as never);

    const result = await getAfcStationLoads({ stationName: "시청역", hour: 10 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe("DB_QUERY_FAILED");
  });
});
