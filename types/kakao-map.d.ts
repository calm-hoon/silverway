declare global {
  interface Window {
    kakao?: {
      maps?: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: unknown
        ) => {
          setBounds: (bounds: unknown) => void;
          setCenter: (latlng: unknown) => void;
          setLevel: (level: number) => void;
        };
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: unknown) => {
          setMap: (map: unknown) => void;
        };
        Polyline?: new (options: unknown) => {
          setMap: (map: unknown) => void;
        };
        LatLngBounds?: new () => {
          extend: (latlng: unknown) => void;
        };
      };
    };
  }
}

export {};
