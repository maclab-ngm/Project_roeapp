-- ========================================
-- ROE MVP 데이터베이스 권한 수정 (관리자 버전)
-- ========================================
-- 이 파일은 superuser 또는 테이블 소유자로 실행해야 합니다.
-- psql -h localhost -U postgres -d roe_mvp -f fix-permissions-admin.sql

-- 테이블 소유자를 postgres로 변경 (필요한 경우)
ALTER TABLE users OWNER TO postgres;
ALTER TABLE ads OWNER TO postgres;
ALTER TABLE ad_views OWNER TO postgres;

-- 시퀀스 소유자를 postgres로 변경 (필요한 경우)
ALTER SEQUENCE users_id_seq OWNER TO postgres;
ALTER SEQUENCE ads_id_seq OWNER TO postgres;
ALTER SEQUENCE ad_views_id_seq OWNER TO postgres;

-- 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON users TO postgres;
GRANT ALL PRIVILEGES ON ads TO postgres;
GRANT ALL PRIVILEGES ON ad_views TO postgres;

-- 시퀀스 권한 부여
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO postgres;

-- 미래에 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- 완료 메시지
SELECT '✅ 권한이 성공적으로 부여되었습니다!' as message;


