// 최근 다녀온 곳 목록. localStorage 연동은 추후 작업에서 진행.
import { type Place } from "@/types";
import { Icon } from "@/components/ui/Icon";

type RecentPlaceListProps = {
  places: Place[];
  title?: string;
  onSelectAsOrigin: (place: Place) => void;
  onSelectAsDestination: (place: Place) => void;
};

export function RecentPlaceList({
  places,
  title = "추천 장소",
  onSelectAsOrigin,
  onSelectAsDestination,
}: RecentPlaceListProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: "var(--sw-fs-xs)",
          fontWeight: "var(--sw-fw-bold)",
          color: "var(--sw-ink-3)",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>

      {places.map((place) => (
        <div
          key={place.name}
          style={{
            background: "var(--sw-card)",
            borderRadius: "var(--sw-r-lg)",
            boxShadow: "var(--sw-e1)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--sw-r-md)",
              background: "var(--sw-primary-50)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="pin" size={20} color="var(--sw-primary)" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--sw-fs-sm)",
                fontWeight: "var(--sw-fw-bold)",
                color: "var(--sw-ink)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {place.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "var(--sw-ink-3)",
                marginTop: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {place.address}
            </div>
          </div>

          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onSelectAsOrigin(place)}
              style={{
                padding: "6px 10px",
                fontSize: 13,
                fontWeight: "var(--sw-fw-medium)",
                fontFamily: "inherit",
                color: "var(--sw-primary)",
                background: "var(--sw-primary-50)",
                border: "none",
                borderRadius: "var(--sw-r-md)",
                cursor: "pointer",
                minHeight: 32,
                whiteSpace: "nowrap",
              }}
            >
              출발지
            </button>
            <button
              type="button"
              onClick={() => onSelectAsDestination(place)}
              style={{
                padding: "6px 10px",
                fontSize: 13,
                fontWeight: "var(--sw-fw-medium)",
                fontFamily: "inherit",
                color: "var(--sw-ink-2)",
                background: "var(--sw-paper-elev)",
                border: "none",
                borderRadius: "var(--sw-r-md)",
                cursor: "pointer",
                minHeight: 32,
                whiteSpace: "nowrap",
              }}
            >
              도착지
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
