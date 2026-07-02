-- analysis_logs: 저장 시점의 기상 위험도를 그대로 복원하기 위한 컬럼 추가
-- (기존에는 weather가 저장되지 않아 조회 시 항상 샘플 값으로 대체됨)
alter table analysis_logs
  add column if not exists weather jsonb;
