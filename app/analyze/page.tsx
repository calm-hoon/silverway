"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

type Step = 1 | 2;

const RECENTS = [
  { name: "서울아산병원",    sub: "송파구 올림픽로 43길 88", icon: "pin" },
  { name: "잠실 종합운동장", sub: "송파구 올림픽로 25",       icon: "pin" },
  { name: "큰딸 집",         sub: "강남구 테헤란로 134",      icon: "users" },
];

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [destination, setDestination] = useState("");
  const [departureMode, setDepartureMode] = useState<"now" | "later" | "">("");

  function goResult() {
    router.push("/result/test");
  }

  return (
    <main style={{
      minHeight: "100dvh",
      background: "var(--sw-paper)",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      {/* header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "8px 16px 16px", minHeight: 56,
        maxWidth: 480, width: "100%", margin: "0 auto",
      }}>
        <button
          onClick={() => step === 2 ? setStep(1) : router.back()}
          style={{
            width: 44, height: 44, borderRadius: "var(--sw-r-md)", border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="뒤로"
        >
          <Icon name="back" size={26} color="var(--sw-ink)" />
        </button>
        <div style={{
          flex: 1, fontSize: "var(--sw-fs-md)", fontWeight: 700,
          color: "var(--sw-ink)", textAlign: "center",
        }}>
          경로 비교
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div style={{
        maxWidth: 480, width: "100%", margin: "0 auto",
        display: "flex", flexDirection: "column", flex: 1,
        paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
      }}>
        {/* progress */}
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                height: 8, flex: 1, borderRadius: "var(--sw-r-full)",
                background: i <= step ? "var(--sw-primary)" : "var(--sw-hairline)",
                transition: "background 280ms cubic-bezier(0.2,0.8,0.2,1)",
              }} />
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: "var(--sw-fs-xs)", fontWeight: 600, color: "var(--sw-ink-2)" }}>
            {step} / 2 단계
          </div>
        </div>

        {step === 1 ? (
          <DestinationStep
            value={destination}
            onChange={setDestination}
            onNext={() => setStep(2)}
          />
        ) : (
          <TimeStep
            value={departureMode}
            onChange={(v) => setDepartureMode(v as "now" | "later" | "")}
            onNext={goResult}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </main>
  );
}

function DestinationStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
}) {
  return (
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
      <div>
        <h1 style={{
          fontSize: "var(--sw-fs-2xl)", fontWeight: 800, lineHeight: 1.3,
          letterSpacing: "-0.015em", margin: 0, color: "var(--sw-ink)",
        }}>
          어디로 가시나요?
        </h1>
        <p style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", lineHeight: 1.55, margin: "8px 0 0" }}>
          목적지를 알려주시면 안전한 길을 찾아드릴게요.
        </p>
      </div>

      {/* search input */}
      <div style={{
        height: 60, background: "var(--sw-card)", borderRadius: "var(--sw-r-lg)",
        boxShadow: value
          ? "0 0 0 2px var(--sw-primary), 0 0 0 6px rgba(10,90,117,0.22)"
          : "var(--sw-e2)",
        display: "flex", alignItems: "center", gap: 12, padding: "0 18px",
      }}>
        <Icon name="pin" size={22} color={value ? "var(--sw-primary)" : "var(--sw-ink-2)"} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="장소 또는 주소"
          style={{
            flex: 1, border: "none", outline: "none", background: "transparent",
            fontSize: "var(--sw-fs-base)", fontFamily: "inherit",
            color: "var(--sw-ink)", fontWeight: value ? 500 : 400,
          }}
        />
      </div>

      {/* recents */}
      <div>
        <div style={{
          fontSize: "var(--sw-fs-xs)", fontWeight: 700, color: "var(--sw-ink-3)",
          letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 12,
        }}>
          최근 다녀오신 곳
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {RECENTS.map((r) => (
            <button
              key={r.name}
              onClick={() => onChange(r.name)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", background: "var(--sw-card)", border: "none",
                borderRadius: "var(--sw-r-lg)", boxShadow: "var(--sw-e1)",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                minHeight: "var(--sw-touch)",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: "var(--sw-r-md)",
                background: "var(--sw-primary-50)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={r.icon} size={22} color="var(--sw-primary)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "var(--sw-fs-sm)", fontWeight: 700, color: "var(--sw-ink)" }}>{r.name}</div>
                <div style={{
                  fontSize: "var(--sw-fs-xs)", color: "var(--sw-ink-3)", marginTop: 2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {r.sub}
                </div>
              </div>
              <Icon name="next" size={22} color="var(--sw-ink-3)" />
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", paddingTop: 12 }}>
        <Button variant="primary" fullWidth disabled={!value} onClick={onNext}>다음</Button>
      </div>
    </div>
  );
}

function TimeStep({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const OPTIONS = [
    { id: "now",   title: "지금 출발",  sub: "오후 2:14 · 현재",            icon: "clock" },
    { id: "later", title: "예약 출발",  sub: "시간을 정해서 알려드릴게요",  icon: "clock" },
  ];

  return (
    <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 24, flex: 1 }}>
      <div>
        <h1 style={{
          fontSize: "var(--sw-fs-2xl)", fontWeight: 800, lineHeight: 1.3,
          letterSpacing: "-0.015em", margin: 0, color: "var(--sw-ink)",
        }}>
          언제 출발하시겠어요?
        </h1>
        <p style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", lineHeight: 1.55, margin: "8px 0 0" }}>
          시간에 따라 안전한 경로가 달라져요.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {OPTIONS.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "18px 20px", background: "var(--sw-card)",
                border: active ? "2px solid var(--sw-primary)" : "2px solid transparent",
                borderRadius: "var(--sw-r-lg)",
                boxShadow: active ? "var(--sw-e2)" : "var(--sw-e1)",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                transition: "all 200ms cubic-bezier(0.2,0.8,0.2,1)",
                minHeight: "var(--sw-touch)",
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: "var(--sw-r-md)",
                background: active ? "var(--sw-primary)" : "var(--sw-primary-50)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon name={opt.icon} size={24} color={active ? "#fff" : "var(--sw-primary)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "var(--sw-fs-md)", fontWeight: 700, color: "var(--sw-ink)" }}>
                  {opt.title}
                </div>
                <div style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-2)", marginTop: 2, lineHeight: 1.5 }}>
                  {opt.sub}
                </div>
              </div>
              <div style={{
                width: 26, height: 26, borderRadius: "var(--sw-r-full)",
                border: active ? "7px solid var(--sw-primary)" : "2px solid var(--sw-hairline-strong)",
                background: active ? "#fff" : "transparent",
                transition: "all 200ms",
              }} />
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: "auto", display: "flex", gap: 10, paddingTop: 12 }}>
        <Button variant="secondary" onClick={onBack}>이전</Button>
        <div style={{ flex: 1 }}>
          <Button variant="primary" fullWidth disabled={!value} onClick={onNext}>
            경로 비교하기
          </Button>
        </div>
      </div>
    </div>
  );
}
