"use client";

import { useEffect, useRef, useState } from "react";
import type { KakaoMapProps, MapLoadState } from "./types";
import { MapFallback } from "./MapFallback";
import { getMapCenter, isValidCoordinate } from "./mapUtils";

const SDK_SCRIPT_ID = "kakao-map-sdk";

export function KakaoMap({
  origin,
  destination,
  showLine = false,
  height = 320,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = useState<MapLoadState>("idle");
  const [errorReason, setErrorReason] = useState<string | undefined>();

  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  // Step 1: Load SDK
  useEffect(() => {
    if (!apiKey) {
      setLoadState("missing-key");
      return;
    }

    // Already initialized — kakao.maps namespace exists
    if (window.kakao?.maps) {
      window.kakao.maps.load(() => setLoadState("ready"));
      return;
    }

    // Script already in DOM but not yet loaded
    const existing = document.getElementById(SDK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      setLoadState("loading");
      existing.addEventListener("load", () => {
        window.kakao?.maps?.load(() => setLoadState("ready"));
      });
      return;
    }

    // Append new script
    setLoadState("loading");
    const script = document.createElement("script");
    script.id = SDK_SCRIPT_ID;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&autoload=false`;
    script.onload = () => {
      if (!window.kakao?.maps) {
        setLoadState("error");
        return;
      }
      window.kakao.maps.load(() => setLoadState("ready"));
    };
    script.onerror = () => {
      setErrorReason("Kakao Maps 도메인 미등록 — developers.kakao.com → 플랫폼 → Web에 현재 도메인(예: http://localhost) 추가 필요");
      setLoadState("error");
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // Timeout: if still loading after 10s, show error
  useEffect(() => {
    if (loadState !== "loading") return;
    const timer = setTimeout(() => setLoadState("error"), 10_000);
    return () => clearTimeout(timer);
  }, [loadState]);

  // Step 2: Init map when SDK is ready
  useEffect(() => {
    if (loadState !== "ready" || !mapRef.current || !window.kakao?.maps) return;

    try {
      const center = getMapCenter(origin, destination);
      const maps = window.kakao.maps;

      const map = new maps.Map(mapRef.current, {
        center: new maps.LatLng(center.lat, center.lng),
        level: 7,
      });

      if (origin && isValidCoordinate(origin.lat, origin.lng)) {
        const pos = new maps.LatLng(origin.lat, origin.lng);
        const marker = new maps.Marker({ position: pos });
        marker.setMap(map);
      }

      if (destination && isValidCoordinate(destination.lat, destination.lng)) {
        const pos = new maps.LatLng(destination.lat, destination.lng);
        const marker = new maps.Marker({ position: pos });
        marker.setMap(map);
      }

      if (showLine && origin && destination && maps.Polyline) {
        const linePath = [
          new maps.LatLng(origin.lat, origin.lng),
          new maps.LatLng(destination.lat, destination.lng),
        ];
        const polyline = new maps.Polyline({
          path: linePath,
          strokeWeight: 3,
          strokeColor: "#0A5A75",
          strokeOpacity: 0.55,
          strokeStyle: "dashed",
        });
        polyline.setMap(map);
      }

      if (origin && destination && maps.LatLngBounds) {
        const bounds = new maps.LatLngBounds();
        bounds.extend(new maps.LatLng(origin.lat, origin.lng));
        bounds.extend(new maps.LatLng(destination.lat, destination.lng));
        map.setBounds(bounds);
      }
    } catch {
      setLoadState("error");
    }
  }, [loadState, origin, destination, showLine]);

  if (loadState === "missing-key") {
    return <MapFallback reason="key" height={height} />;
  }
  if (loadState === "error") {
    return <MapFallback reason="error" height={height} devHint={errorReason} />;
  }

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "var(--sw-r-xl)",
        overflow: "hidden",
        border: "1px solid var(--sw-hairline)",
      }}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: typeof height === "number" ? `${height}px` : height,
        }}
      />
      {(loadState === "idle" || loadState === "loading") && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--sw-paper-elev)",
          }}
        >
          <span style={{ fontSize: "var(--sw-fs-sm)", color: "var(--sw-ink-3)" }}>
            지도를 불러오는 중입니다…
          </span>
        </div>
      )}
    </div>
  );
}
