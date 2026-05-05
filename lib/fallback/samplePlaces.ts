// 시연용 sample 장소 목록. 실제 Kakao Local API 연동 전 또는 API 실패 시 fallback으로 사용한다.
import type { Place } from "@/types";

export const samplePlaces: Place[] = [
  {
    name: "대전광역시청",
    address: "대전 서구 둔산로 100",
    lat: 36.3504,
    lng: 127.3845,
    source: "SAMPLE",
  },
  {
    name: "정부청사역",
    address: "대전 서구 청사로 136",
    lat: 36.3588,
    lng: 127.3778,
    source: "SAMPLE",
  },
  {
    name: "충남대학교병원",
    address: "대전 중구 문화로 282",
    lat: 36.3166,
    lng: 127.4156,
    source: "SAMPLE",
  },
  {
    name: "대전역",
    address: "대전 동구 중앙로 215",
    lat: 36.3326,
    lng: 127.4344,
    source: "SAMPLE",
  },
  {
    name: "유성온천역",
    address: "대전 유성구 온천로 76",
    lat: 36.3591,
    lng: 127.3420,
    source: "SAMPLE",
  },
  {
    name: "서대전네거리역",
    address: "대전 중구 계룡로 685",
    lat: 36.3197,
    lng: 127.4061,
    source: "SAMPLE",
  },
  {
    name: "대전복합터미널",
    address: "대전 동구 동부대로 555",
    lat: 36.3489,
    lng: 127.4538,
    source: "SAMPLE",
  },
  {
    name: "한밭수목원",
    address: "대전 서구 둔산대로 169",
    lat: 36.3661,
    lng: 127.3844,
    source: "SAMPLE",
  },
];
