-- accident_areas: 실제 TAAS 원천 데이터 적재를 위한 컬럼 추가
alter table accident_areas
  add column if not exists region_full_name  text,
  add column if not exists minor_count       integer     not null default 0,
  add column if not exists injury_report_count integer   not null default 0,
  add column if not exists day_count         integer     not null default 0,
  add column if not exists night_count       integer     not null default 0,
  add column if not exists source_year_start integer,
  add column if not exists source_year_end   integer,
  add column if not exists source_file       text,
  add column if not exists raw_payload       jsonb;

create index if not exists idx_accident_areas_region_full on accident_areas (region_full_name);

-- afc_station_loads: 실제 AFC 원천 데이터 적재를 위한 컬럼 추가
alter table afc_station_loads
  add column if not exists direction_label      text,
  add column if not exists origin_station       text,
  add column if not exists destination_station  text,
  add column if not exists station_name_raw     text,
  add column if not exists source_period        text,
  add column if not exists source_file          text,
  add column if not exists service_date         date;

create index if not exists idx_afc_service_date   on afc_station_loads (service_date);
create index if not exists idx_afc_source_period  on afc_station_loads (source_period);
