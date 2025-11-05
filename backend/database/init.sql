-- ========================================
-- ROE MVP 데이터베이스 초기화 (테이블만)
-- ========================================

-- 기존 테이블 삭제 (있다면)
DROP TABLE IF EXISTS ad_views CASCADE;
DROP TABLE IF EXISTS ads CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ========================================
-- 1. 사용자 테이블
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

-- ========================================
-- 2. 광고 테이블
-- ========================================
CREATE TABLE ads (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_count INTEGER NOT NULL,
    point_per_user INTEGER NOT NULL,
    remaining_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ads_business ON ads(business_id);
CREATE INDEX idx_ads_status ON ads(status);

-- ========================================
-- 3. 광고 시청 기록
-- ========================================
CREATE TABLE ad_views (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ad_id INTEGER NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, ad_id)
);

CREATE INDEX idx_ad_views_user ON ad_views(user_id);
CREATE INDEX idx_ad_views_ad ON ad_views(ad_id);

-- ========================================
-- 권한 부여
-- ========================================
-- 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON users TO postgres;
GRANT ALL PRIVILEGES ON ads TO postgres;
GRANT ALL PRIVILEGES ON ad_views TO postgres;

-- 시퀀스 권한 부여 (SERIAL 타입 사용 시 필요)
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO postgres;
GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO postgres;

-- 완료 메시지
SELECT '✅ ROE MVP 테이블이 성공적으로 생성되었습니다!' as message;