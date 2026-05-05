"use client";

import { useState, useEffect, useRef } from "react";
import type { Place } from "@/types";
import { Icon } from "@/components/ui/Icon";

type PlaceInputProps = {
  label: string;
  initialValue?: string;
  onSelect: (place: Place) => void;
  onClear: () => void;
  placeholder?: string;
};

export function PlaceInput({
  label,
  initialValue = "",
  onSelect,
  onClear,
  placeholder = "장소 또는 주소 검색",
}: PlaceInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipSearchRef = useRef(false);

  // Debounced auto-search when query changes
  useEffect(() => {
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      void performSearch(query.trim());
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  async function performSearch(q: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/kakao/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, size: 5 }),
      });
      const json = await res.json() as { data?: Place[] };
      const places = json.data ?? [];
      setResults(places);
      setOpen(true);
    } catch {
      setResults([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(text: string) {
    setQuery(text);
    if (!text) {
      setResults([]);
      setOpen(false);
      onClear();
    }
  }

  function handleSearchClick() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 1) {
      void performSearch(query.trim());
    }
  }

  function handleSelect(place: Place) {
    skipSearchRef.current = true;
    setQuery(place.name);
    setResults([]);
    setOpen(false);
    onSelect(place);
  }

  function handleClear() {
    skipSearchRef.current = true;
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear();
  }

  const filled = query.length > 0;

  return (
    <div
      ref={containerRef}
      style={{ display: "flex", flexDirection: "column", gap: 8, position: "relative" }}
    >
      <label
        style={{
          fontSize: "var(--sw-fs-sm)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink)",
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 56,
          padding: "0 16px",
          background: "var(--sw-card)",
          borderRadius: "var(--sw-r-lg)",
          boxShadow: filled
            ? "0 0 0 2px var(--sw-primary), 0 0 0 6px rgba(10,90,117,0.18)"
            : "var(--sw-e2)",
          transition: "box-shadow var(--sw-d-fast) var(--sw-ease)",
        }}
      >
        <Icon
          name="pin"
          size={20}
          color={filled ? "var(--sw-primary)" : "var(--sw-ink-3)"}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearchClick();
            }
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowDown" && open) {
              e.preventDefault();
              const first = containerRef.current?.querySelector<HTMLButtonElement>("[data-result-item]");
              first?.focus();
            }
          }}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "var(--sw-fs-base)",
            fontFamily: "inherit",
            color: "var(--sw-ink)",
            fontWeight: filled ? "var(--sw-fw-medium)" : "var(--sw-fw-regular)",
          }}
        />

        {loading && (
          <span style={{ fontSize: 12, color: "var(--sw-ink-3)", whiteSpace: "nowrap" }}>
            검색 중…
          </span>
        )}

        {!loading && filled && (
          <button
            type="button"
            onClick={handleSearchClick}
            aria-label="장소 검색"
            style={{
              padding: "0 12px",
              height: 36,
              border: "none",
              borderRadius: "var(--sw-r-md)",
              background: "var(--sw-primary)",
              color: "#fff",
              fontSize: 13,
              fontFamily: "inherit",
              fontWeight: "var(--sw-fw-medium)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            검색
          </button>
        )}

        {filled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="입력 지우기"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "var(--sw-r-full)",
              border: "none",
              background: "var(--sw-paper-elev)",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Icon name="x" size={14} color="var(--sw-ink-3)" />
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--sw-card)",
            borderRadius: "var(--sw-r-lg)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          {results.length > 0 ? (
            results.map((place, i) => (
              <button
                key={`${place.name}-${i}`}
                type="button"
                role="option"
                data-result-item
                onClick={() => handleSelect(place)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    (e.currentTarget.nextElementSibling as HTMLButtonElement | null)?.focus();
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const prev = e.currentTarget.previousElementSibling as HTMLButtonElement | null;
                    prev
                      ? prev.focus()
                      : containerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
                  }
                  if (e.key === "Escape") {
                    setOpen(false);
                    containerRef.current?.querySelector<HTMLInputElement>("input")?.focus();
                  }
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSelect(place);
                  }
                }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                  padding: "14px 16px",
                  minHeight: 56,
                  border: "none",
                  borderBottom:
                    i < results.length - 1 ? "1px solid var(--sw-hairline)" : "none",
                  background: "transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--sw-fs-sm)",
                    fontWeight: "var(--sw-fw-medium)",
                    color: "var(--sw-ink)",
                  }}
                >
                  {place.name}
                </span>
                {place.address && (
                  <span style={{ fontSize: 12, color: "var(--sw-ink-3)", marginTop: 2 }}>
                    {place.address}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div
              style={{
                padding: "16px",
                fontSize: "var(--sw-fs-sm)",
                color: "var(--sw-ink-3)",
                textAlign: "center",
              }}
            >
              검색 결과가 없습니다. 다른 검색어를 시도해보세요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
