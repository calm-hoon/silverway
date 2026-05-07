"use client";

import { useEffect, useRef } from "react";
import type { MapPoint } from "./types";

type LeafletMapProps = {
  origin?: MapPoint;
  destination?: MapPoint;
  showLine?: boolean;
  height?: number | string;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L?: any;
  }
}

const LEAFLET_CSS_ID = "leaflet-css";
const LEAFLET_JS_ID = "leaflet-js";
const LEAFLET_CSS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.L) { resolve(); return; }

    // CSS
    if (!document.getElementById(LEAFLET_CSS_ID)) {
      const link = document.createElement("link");
      link.id = LEAFLET_CSS_ID;
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS_URL;
      document.head.appendChild(link);
    }

    // JS
    if (document.getElementById(LEAFLET_JS_ID)) {
      const existing = document.getElementById(LEAFLET_JS_ID) as HTMLScriptElement;
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.id = LEAFLET_JS_ID;
    script.src = LEAFLET_JS_URL;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function markerIcon(color: string) {
  // inline SVG marker — no image file needed
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
    <path fill="${color}" stroke="#fff" stroke-width="2"
      d="M14 2C8.477 2 4 6.477 4 12c0 8 10 22 10 22s10-14 10-22c0-5.523-4.477-10-10-10z"/>
    <circle fill="#fff" cx="14" cy="12" r="4"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function LeafletMap({ origin, destination, showLine = false, height = 320 }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    loadLeaflet().then(() => {
      if (cancelled || !mapRef.current || !window.L) return;

      // Destroy previous instance if component re-mounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const L = window.L;

      // Determine center
      let center: [number, number] = [36.3504, 127.3845]; // Daejeon default
      if (origin && destination) {
        center = [(origin.lat + destination.lat) / 2, (origin.lng + destination.lng) / 2];
      } else if (origin) {
        center = [origin.lat, origin.lng];
      } else if (destination) {
        center = [destination.lat, destination.lng];
      }

      const map = L.map(mapRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const originIcon = L.icon({ iconUrl: markerIcon("#0A5A75"), iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36] });
      const destIcon = L.icon({ iconUrl: markerIcon("#E05A00"), iconSize: [28, 36], iconAnchor: [14, 36], popupAnchor: [0, -36] });

      if (origin) {
        L.marker([origin.lat, origin.lng], { icon: originIcon })
          .addTo(map)
          .bindPopup(`<b>출발</b><br/>${origin.name}`);
      }

      if (destination) {
        L.marker([destination.lat, destination.lng], { icon: destIcon })
          .addTo(map)
          .bindPopup(`<b>도착</b><br/>${destination.name}`);
      }

      if (showLine && origin && destination) {
        L.polyline(
          [[origin.lat, origin.lng], [destination.lat, destination.lng]],
          { color: "#0A5A75", weight: 3, opacity: 0.6, dashArray: "8 6" }
        ).addTo(map);
      }

      if (origin && destination) {
        map.fitBounds([
          [origin.lat, origin.lng],
          [destination.lat, destination.lng],
        ], { padding: [40, 40] });
      }

      mapInstanceRef.current = map;
    }).catch(() => {
      // Leaflet CDN unreachable — silently fail, MapFallback shown by parent
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination, showLine]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: "var(--sw-r-xl)",
        overflow: "hidden",
        border: "1px solid var(--sw-hairline)",
        zIndex: 0,
      }}
    />
  );
}
