-- ============================================================
-- SilverWay MVP 테스트용 seed 데이터
-- 실제 공공데이터 원본이 아닌 MVP 시연 및 개발 테스트 목적 샘플입니다.
-- risk_score는 실제 사고 확률이 아니라 운전 위험 지수 산정에 활용할 상대 점수입니다.
-- ============================================================

-- ------------------------------------------------------------
-- accident_areas — 대전광역시 구별 사고 패턴 샘플 (5개)
-- ------------------------------------------------------------
INSERT INTO accident_areas (sido, sigungu, dong, accident_count, elderly_driver_count, fatal_count, severe_count, risk_score, center_lat, center_lng, source_year)
VALUES
  ('대전광역시', '서구',  '둔산동',   18, 7, 0, 3, 62.00, 36.3504, 127.3845, 2024),
  ('대전광역시', '유성구', '노은동',  14, 5, 0, 2, 48.00, 36.4011, 127.3371, 2024),
  ('대전광역시', '중구',  '대흥동',   22, 9, 1, 4, 74.00, 36.3247, 127.4272, 2024),
  ('대전광역시', '동구',  '천동',     11, 4, 0, 2, 41.00, 36.3187, 127.4521, 2024),
  ('대전광역시', '대덕구', '신탄진동',  9, 3, 0, 1, 35.00, 36.4382, 127.4139, 2024);

-- ------------------------------------------------------------
-- afc_station_loads — 대전 도시철도 주요 역 재차인원 샘플 (8건)
-- 과거 패턴 기반 예측형 혼잡도 산정을 위한 테스트 데이터입니다.
-- ------------------------------------------------------------
INSERT INTO afc_station_loads (service_day_type, day_of_week, is_holiday, direction, train_no, station_name, departure_time, arrival_time, hour, onboard_count, source_date)
VALUES
  ('평일', 'MON', false, '상행', '101', '시청역',    '08:05:00', '08:07:00', 8,  312, '2024-10-07'),
  ('평일', 'MON', false, '상행', '103', '시청역',    '10:05:00', '10:07:00', 10, 178, '2024-10-07'),
  ('평일', 'MON', false, '하행', '202', '정부청사역', '08:12:00', '08:14:00', 8,  287, '2024-10-07'),
  ('평일', 'MON', false, '하행', '204', '정부청사역', '10:12:00', '10:14:00', 10, 156, '2024-10-07'),
  ('평일', 'MON', false, '상행', '105', '대전역',    '08:25:00', '08:27:00', 8,  421, '2024-10-07'),
  ('평일', 'MON', false, '상행', '107', '대전역',    '10:25:00', '10:27:00', 10, 203, '2024-10-07'),
  ('평일', 'MON', false, '상행', '109', '충남대역',  '10:18:00', '10:20:00', 10, 134, '2024-10-07'),
  ('주말', 'SAT', false, '상행', '301', '시청역',    '10:05:00', '10:07:00', 10,  98, '2024-10-05');

-- ------------------------------------------------------------
-- station_aliases — ODsay 역명 ↔ AFC 역명 매칭 샘플
-- ------------------------------------------------------------
INSERT INTO station_aliases (odsay_station_name, afc_station_name, display_name)
VALUES
  ('시청',   '시청역',    '시청역'),
  ('정부청사', '정부청사역', '정부청사역'),
  ('대전',   '대전역',    '대전역'),
  ('충남대',  '충남대역',  '충남대역'),
  ('갈마',   '갈마역',    '갈마역'),
  ('중구청',  '중구청역',  '중구청역')
ON CONFLICT (odsay_station_name, afc_station_name) DO NOTHING;

-- ------------------------------------------------------------
-- analysis_logs — sampleAnalysis와 유사한 시연용 분석 결과 1건
-- ------------------------------------------------------------
INSERT INTO analysis_logs (
  origin_name, origin_address, origin_lat, origin_lng,
  destination_name, destination_address, destination_lat, destination_lng,
  departure_time, age_group,
  risk_score, risk_level,
  risk_factors, transit_summary, report, data_sources, fallback_flags
) VALUES (
  '대전광역시청', '대전광역시 서구 둔산로 100', 36.3513, 127.3849,
  '충남대학교병원', '대전광역시 중구 문화로 282', 36.3706, 127.3664,
  '2026-05-04T10:00:00+09:00', '70s',
  62.00, 'MEDIUM',
  '{"score": 62, "level": "MEDIUM", "factors": [{"key": "area", "score": 55}, {"key": "time", "score": 40}, {"key": "weather", "score": 20}, {"key": "age", "score": 70}, {"key": "distance", "score": 45}]}'::jsonb,
  '{"available": true, "totalDurationMin": 26, "transferCount": 0, "congestionLevel": "MEDIUM"}'::jsonb,
  '{"title": "SilverWay 이동 분석 리포트", "recommendation": "대중교통 이용 권장", "familyMessage": "지하철 26분 이동 가능, 동행 권장"}'::jsonb,
  '["TAAS 고령 운전자 사고 데이터", "AFC 과거 패턴 기반 혼잡도", "기상청 단기예보", "ODsay 대중교통 경로"]'::jsonb,
  '{"analysis": true, "route": true, "weather": true, "report": true}'::jsonb
);
