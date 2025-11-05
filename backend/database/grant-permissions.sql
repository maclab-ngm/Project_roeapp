-- ========================================
-- ROE MVP 데이터베이스 권한 부여
-- ========================================
-- 이 스크립트는 데이터베이스 사용자에게 필요한 테이블 권한을 부여합니다

-- 데이터베이스 연결
\c roe_mvp;

-- 모든 테이블에 대한 권한 부여
-- 주의: 'postgres' 사용자로 실행하거나, 필요시 사용자 이름을 변경하세요
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- 특정 테이블에 대한 권한 부여 (users, ads, ad_views)
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON ads TO postgres;
GRANT SELECT, INSERT, UPDATE, DELETE ON ad_views TO postgres;

-- 시퀀스 권한 부여 (SERIAL 타입 사용 시 필요)
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO postgres;

-- 미래에 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;

-- 완료 메시지
SELECT '✅ 권한이 성공적으로 부여되었습니다!' as message;


