export type MapPoint = {
  name: string;
  address?: string;
  lat: number;
  lng: number;
  type: "origin" | "destination" | "risk" | "waypoint";
};

export type KakaoMapProps = {
  origin?: MapPoint;
  destination?: MapPoint;
  points?: MapPoint[];
  showLine?: boolean;
  height?: number | string;
};

export type MapLoadState = "idle" | "loading" | "ready" | "error" | "missing-key";
