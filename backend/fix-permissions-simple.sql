-- ========================================
-- ROE MVP 데이터베이스 권한 수정 (간단 버전)
-- ========================================
-- 이 파일을 psql로 실행하세요:
-- psql -h localhost -U postgres -d roe_mvp -f fix-permissions-simple.sql

-- 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON users TO postgres;
GRANT ALL PRIVILEGES ON ads TO postgres;
GRANT ALL PRIVILEGES ON ad_views TO postgres;

-- 시퀀스 권한 부여 (SERIAL 타입 사용 시 필요)
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO postgres;

-- 미래에 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- 완료 메시지
SELECT '✅ 권한이 성공적으로 부여되었습니다!' as message;


