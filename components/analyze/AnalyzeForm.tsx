"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type Place, type AgeGroup } from "@/types";
import { samplePlaces } from "@/lib/fallback/samplePlaces";
import { getRecentPlaces, saveRecentPlace, saveRecentRoute } from "@/lib/storage";
import { Button } from "@/components/ui/Button";
import { PlaceInput } from "./PlaceInput";
import { RecentPlaceList } from "./RecentPlaceList";
import { DepartureTimeSelector, type DepartureSlot } from "./DepartureTimeSelector";
import { AgeGroupSelector } from "./AgeGroupSelector";
import { AnalyzeNotice } from "./AnalyzeNotice";

function buildDepartureTime(slot: DepartureSlot, customTime: string): string {
  if (slot === "custom" && customTime) {
    return new Date(customTime).toISOString();
  }
  const hourMap: Record<Exclude<DepartureSlot, "custom">, number> = {
    morning: 10,
    afternoon: 14,
    evening: 19,
  };
  const now = new Date();
  const hour = hourMap[slot as Exclude<DepartureSlot, "custom">] ?? 10;
  now.setHours(hour, 0, 0, 0);
  return now.toISOString();
}

export function AnalyzeForm() {
  const router = useRouter();

  // key 변경 시 PlaceInput이 재마운트되어 initialValue를 반영한다
  const [originKey, setOriginKey] = useState(0);
  const [originPlace, setOriginPlace] = useState<Place | null>(null);
  const [destKey, setDestKey] = useState(0);
  const [destPlace, setDestPlace] = useState<Place | null>(null);

  const [departureSlot, setDepartureSlot] = useState<DepartureSlot | "">("");
  const [customTime, setCustomTime] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [recentPlaces, setRecentPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFallback, setHasFallback] = useState(false);

  useEffect(() => {
    setRecentPlaces(getRecentPlaces());
  }, []);

  const canSubmit =
    originPlace !== null &&
    destPlace !== null &&
    departureSlot !== "" &&
    (departureSlot !== "custom" || customTime !== "") &&
    ageGroup !== "";

  function persistPlace(place: Place) {
    try {
      setRecentPlaces(saveRecentPlace(place));
    } catch {
      // 저장 실패가 분석 흐름을 막지 않음
    }
  }

  // RecentPlaceList에서 선택: key를 바꿔 PlaceInput을 재마운트하고 초기값을 반영한다
  function selectOriginFromList(place: Place) {
    setOriginPlace(place);
    setOriginKey((k) => k + 1);
    persistPlace(place);
  }

  function selectDestFromList(place: Place) {
    setDestPlace(place);
    setDestKey((k) => k + 1);
    persistPlace(place);
  }

  // PlaceInput 내부 검색에서 선택: key는 변경하지 않는다
  function handleOriginSelect(place: Place) {
    setOriginPlace(place);
    persistPlace(place);
  }

  function handleDestSelect(place: Place) {
    setDestPlace(place);
    persistPlace(place);
  }

  async function handleSubmit() {
    if (!canSubmit || !originPlace || !destPlace) return;
    setLoading(true);
    setError(null);

    try { saveRecentRoute({ origin: originPlace, destination: destPlace }); } catch { /* ignore */ }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: originPlace,
          destination: destPlace,
          departureTime: buildDepartureTime(departureSlot as DepartureSlot, customTime),
          ageGroup: ageGroup as AgeGroup,
        }),
      });

      if (!res.ok) throw new Error("API_ERROR");
      const json = await res.json() as { resultId?: string; meta?: { fallback?: boolean } };
      if (json?.meta?.fallback) setHasFallback(true);
      const resultId = json?.resultId;
      router.push(resultId ? `/result/${resultId}` : "/result/test");
    } catch {
      setError("분석 요청 중 문제가 생겼어요. 예시 결과를 확인하거나 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit();
      }}
      style={{ display: "flex", flexDirection: "column", gap: 24 }}
    >
      {/* 장소 입력 */}
      <div
        style={{
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-xl)",
          boxShadow: "var(--sw-e2)",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <PlaceInput
          key={originKey}
          label="출발지"
          initialValue={originPlace?.name ?? ""}
          onSelect={handleOriginSelect}
          onClear={() => setOriginPlace(null)}
          placeholder="예: 대전광역시청"
        />

        {/* 구분선 */}
        <div style={{ height: 1, background: "var(--sw-hairline)", margin: "0 -4px" }} />

        <PlaceInput
          key={destKey + 1000}
          label="도착지"
          initialValue={destPlace?.name ?? ""}
          onSelect={handleDestSelect}
          onClear={() => setDestPlace(null)}
          placeholder="예: 충남대학교병원"
        />

        {/* 장소 선택 안내 */}
        {(!originPlace || !destPlace) && (
          <div
            style={{
              fontSize: "var(--sw-fs-xs)",
              color: "var(--sw-ink-3)",
              paddingTop: 4,
            }}
          >
            검색 후 목록에서 장소를 선택해 주세요.
          </div>
        )}
      </div>

      {/* 최근/추천 장소 */}
      <RecentPlaceList
        places={recentPlaces.length > 0 ? recentPlaces : samplePlaces}
        title={recentPlaces.length > 0 ? "최근 장소" : "추천 장소"}
        onSelectAsOrigin={selectOriginFromList}
        onSelectAsDestination={selectDestFromList}
      />

      {/* 출발 시간 */}
      <div
        style={{
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-xl)",
          boxShadow: "var(--sw-e2)",
          padding: "20px",
        }}
      >
        <DepartureTimeSelector
          value={departureSlot}
          customTime={customTime}
          onChangeSlot={setDepartureSlot}
          onChangeCustomTime={setCustomTime}
        />
      </div>

      {/* 연령대 */}
      <div
        style={{
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-xl)",
          boxShadow: "var(--sw-e2)",
          padding: "20px",
        }}
      >
        <AgeGroupSelector value={ageGroup} onChange={setAgeGroup} />
      </div>

      {/* 안내 */}
      <AnalyzeNotice />

      {/* 오류 메시지 */}
      {error && (
        <div
          style={{
            padding: "14px 16px",
            background: "var(--sw-warning-bg)",
            borderRadius: "var(--sw-r-lg)",
            fontSize: "var(--sw-fs-sm)",
            color: "#9A3412",
            lineHeight: 1.6,
          }}
        >
          {error}
        </div>
      )}

      {/* fallback 안내 */}
      {hasFallback && !error && (
        <div
          style={{
            padding: "12px 14px",
            background: "var(--sw-paper-elev)",
            borderRadius: "var(--sw-r-lg)",
            fontSize: 13,
            color: "var(--sw-ink-3)",
            lineHeight: 1.6,
          }}
        >
          일부 외부 데이터를 불러오지 못해 예시 데이터를 함께 사용했습니다.
        </div>
      )}

      {/* CTA */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={!canSubmit || loading}
        >
          {loading ? "분석 중…" : "분석 시작하기"}
        </Button>

        <Button
          type="button"
          variant="ghost"
          fullWidth
          onClick={() => router.push("/result/test")}
        >
          예시 결과 보기
        </Button>
      </div>
    </form>
  );
}
