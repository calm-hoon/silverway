"use client";

import { Icon } from "./ui/Icon";
import { Button } from "./ui/Button";

type AIReportProps = {
  name?: string;
  destination?: string;
  recommendation?: "transit" | "drive";
  drivingScore?: number;
  transitRoute?: string;
  onShare?: () => void;
};

export function AIReport({
  name = "어머니",
  destination = "서울아산병원",
  recommendation = "transit",
  drivingScore = 78,
  transitRoute = "지하철 + 도보 4분",
  onShare,
}: AIReportProps) {
  const today = new Date();
  const date = `${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 style={{
          fontSize: "var(--sw-fs-xl)", fontWeight: 800, lineHeight: 1.3,
          letterSpacing: "-0.015em", margin: 0, color: "var(--sw-ink)",
        }}>
          {name.replace("어머니", "엄마")}께 보낼 메시지
        </h1>
        <p style={{ fontSize: "var(--sw-fs-base)", color: "var(--sw-ink-2)", lineHeight: 1.55, margin: "6px 0 0" }}>
          그대로 보내도 어색하지 않게, 대화를 열어주는 추천 문구예요.
        </p>
      </div>

      {/* accent banner */}
      <div style={{
        display: "flex", gap: 8, alignItems: "center",
        padding: "10px 14px", background: "var(--sw-accent-50)",
        borderRadius: "var(--sw-r-md)",
        fontSize: "var(--sw-fs-xs)", color: "#9C5D2E", lineHeight: 1.5,
      }}>
        <Icon name="shield" size={18} color="#9C5D2E" />
        <span><b>면허 반납을 어색하지 않게 꺼내는</b> 대화의 물꼬이에요.</span>
      </div>

      {/* message card */}
      <div style={{
        background: "var(--sw-card)", borderRadius: "var(--sw-r-xl)",
        padding: 22, boxShadow: "var(--sw-e3)",
        border: "1px solid var(--sw-hairline)",
      }}>
        {/* avatar row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--sw-r-full)",
            background: "var(--sw-accent-50)", border: "3px solid var(--sw-accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 800, color: "#9C5D2E",
          }}>
            따르
          </div>
          <div>
            <div style={{ fontSize: "var(--sw-fs-base)", fontWeight: 700, color: "var(--sw-ink)" }}>
              큰딸 지혜 · 추천문구
            </div>
            <div style={{ fontSize: 13, color: "var(--sw-ink-3)" }}>
              {date} · SilverWay AI가 대신 써드렸어요
            </div>
          </div>
        </div>

        {/* message body */}
        <div style={{ fontSize: "var(--sw-fs-base)", lineHeight: 1.75, color: "var(--sw-ink)" }}>
          <p style={{ margin: 0 }}>엄마, 오늘 비 많이 온대요. ☔️</p>
          <p style={{ margin: "14px 0 0" }}>
            요즘 운전하시면 <b>시야가 흐려서 위험할 수 있으니까</b>,
            이번엔 버스로 가시는 건 어때요?
          </p>
          <p style={{ margin: "14px 0 0" }}>
            제가 노선을 확인해봤는데, <b>집 앞 정류장에서 한 번에 가는 버스</b>가 있더라고요.
            {destination}까지 32분이면 도착해요.
          </p>
          <p style={{ margin: "14px 0 0" }}>
            도착하시면 연락 주세요. 제가 우산 들고 정류장으로 마중 나갈게요.
          </p>
          <p style={{ margin: "14px 0 0", color: "var(--sw-ink-2)" }}>— 지혜 드림</p>
        </div>

        {/* info summary */}
        <div style={{
          marginTop: 18, padding: "14px 16px",
          background: "var(--sw-paper)", borderRadius: "var(--sw-r-md)",
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, color: "var(--sw-ink-3)",
            letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8,
          }}>
            함께 보낼 정보
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--sw-fs-sm)" }}>
              <span style={{ color: "var(--sw-ink-2)" }}>운전 위험도</span>
              <span style={{ color: "var(--sw-danger)", fontWeight: 700 }}>{drivingScore}점 · 높음</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--sw-fs-sm)" }}>
              <span style={{ color: "var(--sw-ink-2)" }}>추천 노선</span>
              <span style={{ color: "var(--sw-ink)", fontWeight: 700 }}>{transitRoute}</span>
            </div>
          </div>
        </div>
      </div>

      {/* disclaimer */}
      <div style={{ fontSize: 12, color: "var(--sw-ink-3)", lineHeight: 1.6, padding: "0 2px" }}>
        이 내용은 의사결정 보조용 안내이며, 실제 사고 가능성을 의미하지 않습니다.
        면허 반납은 당사자의 자유로운 선택입니다.
      </div>

      <Button variant="kakao" fullWidth onClick={onShare}>
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#181600" d="M12 3C6.48 3 2 6.61 2 11.05c0 2.85 1.85 5.36 4.66 6.84l-1.04 3.81c-.09.34.27.61.57.42l4.55-3.01c.42.04.84.07 1.26.07 5.52 0 10-3.61 10-8.13S17.52 3 12 3z" />
        </svg>
        카카오톡으로 엄마께 보내기
      </Button>
      <Button variant="secondary" fullWidth>문구 고쳐서 보내기</Button>
    </div>
  );
}
