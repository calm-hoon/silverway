"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type Place, type AgeGroup } from "@/types";
import { samplePlaces } from "@/lib/fallback/samplePlaces";
import { Button } from "@/components/ui/Button";
import { PlaceInput } from "./PlaceInput";
import { RecentPlaceList } from "./RecentPlaceList";
import { DepartureTimeSelector, type DepartureSlot } from "./DepartureTimeSelector";
import { AgeGroupSelector } from "./AgeGroupSelector";
import { AnalyzeNotice } from "./AnalyzeNotice";

// 슬롯별 출발 시각 (KST +09:00)
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

// 텍스트만 입력된 경우 대전 중심 좌표를 placeholder로 사용
function asPlace(text: string, selected: Place | null): Place {
  if (selected) return selected;
  return { name: text, address: text, lat: 36.3504, lng: 127.3845 };
}

export function AnalyzeForm() {
  const router = useRouter();

  const [originText, setOriginText] = useState("");
  const [originPlace, setOriginPlace] = useState<Place | null>(null);
  const [destText, setDestText] = useState("");
  const [destPlace, setDestPlace] = useState<Place | null>(null);
  const [departureSlot, setDepartureSlot] = useState<DepartureSlot | "">("");
  const [customTime, setCustomTime] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    originText.trim().length > 0 &&
    destText.trim().length > 0 &&
    departureSlot !== "" &&
    (departureSlot !== "custom" || customTime !== "") &&
    ageGroup !== "";

  function selectOrigin(place: Place) {
    setOriginText(place.name);
    setOriginPlace(place);
  }

  function selectDest(place: Place) {
    setDestText(place.name);
    setDestPlace(place);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: asPlace(originText, originPlace),
          destination: asPlace(destText, destPlace),
          departureTime: buildDepartureTime(departureSlot as DepartureSlot, customTime),
          ageGroup: ageGroup as AgeGroup,
        }),
      });

      if (!res.ok) throw new Error("API_ERROR");
      const json = await res.json() as { resultId?: string };
      const resultId = json?.resultId;
      router.push(resultId ? `/result/${resultId}` : "/result/test");
    } catch {
      setError("분석 요청 중 오류가 생겼어요. 예시 결과로 이동하시겠어요?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); void handleSubmit(); }}
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
          label="출발지"
          value={originText}
          onChange={(text) => { setOriginText(text); setOriginPlace(null); }}
          placeholder="예: 대전광역시청"
        />

        {/* 구분선 */}
        <div style={{ height: 1, background: "var(--sw-hairline)", margin: "0 -4px" }} />

        <PlaceInput
          label="도착지"
          value={destText}
          onChange={(text) => { setDestText(text); setDestPlace(null); }}
          placeholder="예: 충남대학교병원"
        />
      </div>

      {/* 추천 장소 */}
      <RecentPlaceList
        places={samplePlaces}
        onSelectAsOrigin={selectOrigin}
        onSelectAsDestination={selectDest}
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
