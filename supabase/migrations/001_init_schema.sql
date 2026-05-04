-- SilverWay 초기 스키마
-- uuid 생성 확장
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. accident_areas
-- TAAS 고령 운전자 사고 데이터를 행정구역 단위로 집계한 테이블.
-- 운전 위험 지수 계산 시 sido/sigungu/dong 기준으로 조회한다.
-- ============================================================
create table if not exists accident_areas (
  id                   uuid        primary key default gen_random_uuid(),
  sido                 text        not null,
  sigungu              text        not null,
  dong                 text,
  accident_count       integer     not null default 0,
  elderly_driver_count integer     not null default 0,
  fatal_count          integer     not null default 0,
  severe_count         integer     not null default 0,
  risk_score           numeric(5,2) not null default 0,
  center_lat           numeric(10,7),
  center_lng           numeric(10,7),
  source_year          integer,
  created_at           timestamptz default now()
);

create index if not exists idx_accident_areas_sido_sigungu on accident_areas (sido, sigungu);
create index if not exists idx_accident_areas_risk_score   on accident_areas (risk_score);

-- ============================================================
-- 2. accident_points
-- 위경도 기반 사고 지점 데이터. MVP에서는 선택 사용.
-- 추후 지도 시각화나 반경 기반 위험도 계산으로 확장 예정.
-- ============================================================
create table if not exists accident_points (
  id             uuid        primary key default gen_random_uuid(),
  address        text,
  lat            numeric(10,7),
  lng            numeric(10,7),
  accident_type  text,
  severity       text,
  occurred_year  integer,
  source         text,
  created_at     timestamptz default now()
);

create index if not exists idx_accident_points_lat_lng       on accident_points (lat, lng);
create index if not exists idx_accident_points_occurred_year on accident_points (occurred_year);

-- ============================================================
-- 3. afc_station_loads
-- AFC 열차 재차인원 데이터 (long format).
-- 과거 패턴 기반 예측형 혼잡도 계산에 사용한다.
-- ============================================================
create table if not exists afc_station_loads (
  id               uuid        primary key default gen_random_uuid(),
  service_day_type text        not null,
  day_of_week      text,
  is_holiday       boolean     default false,
  direction        text        not null,
  train_no         text,
  station_name     text        not null,
  departure_time   time,
  arrival_time     time,
  hour             integer,
  onboard_count    integer     not null default 0,
  source_date      date,
  created_at       timestamptz default now()
);

create index if not exists idx_afc_station_name          on afc_station_loads (station_name);
create index if not exists idx_afc_hour                  on afc_station_loads (hour);
create index if not exists idx_afc_direction             on afc_station_loads (direction);
create index if not exists idx_afc_service_day_type      on afc_station_loads (service_day_type);
create index if not exists idx_afc_station_hour_dir      on afc_station_loads (station_name, hour, direction);

-- ============================================================
-- 4. station_aliases
-- ODsay API 역명과 AFC 데이터 역명을 매칭하는 테이블.
-- 역명 불일치로 인한 조회 실패를 방지한다.
-- ============================================================
create table if not exists station_aliases (
  id                  uuid primary key default gen_random_uuid(),
  odsay_station_name  text not null,
  afc_station_name    text not null,
  display_name        text,
  created_at          timestamptz default now(),
  unique (odsay_station_name, afc_station_name)
);

-- ============================================================
-- 5. analysis_logs
-- 회원가입 없이 분석 결과를 저장하고 /result/[id]에서 조회하는 테이블.
-- resultId(= id)를 URL에 노출해 시연·새로고침·추후 공유 기능을 지원한다.
-- auth.users 참조 없이 MVP 구조를 유지한다.
-- ============================================================
create table if not exists analysis_logs (
  id                   uuid         primary key default gen_random_uuid(),
  origin_name          text,
  origin_address       text,
  origin_lat           numeric(10,7),
  origin_lng           numeric(10,7),
  destination_name     text,
  destination_address  text,
  destination_lat      numeric(10,7),
  destination_lng      numeric(10,7),
  departure_time       timestamptz,
  age_group            text         check (age_group in ('60s', '70s', '80s')),
  risk_score           numeric(5,2),
  risk_level           text         check (risk_level in ('LOW', 'MEDIUM', 'HIGH')),
  risk_factors         jsonb        not null default '{}'::jsonb,
  transit_summary      jsonb        not null default '{}'::jsonb,
  report               jsonb        not null default '{}'::jsonb,
  data_sources         jsonb        not null default '[]'::jsonb,
  fallback_flags       jsonb        not null default '{}'::jsonb,
  created_at           timestamptz  default now()
);

create index if not exists idx_analysis_logs_created_at  on analysis_logs (created_at);
create index if not exists idx_analysis_logs_risk_level  on analysis_logs (risk_level);

-- ============================================================
-- RLS (Row Level Security)
-- TODO: auth 구현 시 각 테이블에 RLS 정책을 추가한다.
-- MVP 단계에서는 Supabase 대시보드에서 anon key 접근 범위를 수동 제한한다.
-- ============================================================
