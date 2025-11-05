-- ========================================
-- ROE MVP 데이터베이스 스키마
-- ========================================

-- 데이터베이스 생성
CREATE DATABASE roe_mvp;

-- 데이터베이스 연결
\c roe_mvp;

-- ========================================
-- 1. 사용자 테이블 (단순화)
-- ========================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL, -- 'consumer' or 'business'
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);

-- ========================================
-- 2. 광고 테이블 (MVP - 고정값)
-- ========================================
CREATE TABLE ads (
    id SERIAL PRIMARY KEY,
    business_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_count INTEGER NOT NULL, -- 200, 500, 1000
    point_per_user INTEGER NOT NULL, -- 자동 계산: 600,000 / target_count
    remaining_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
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
    UNIQUE(user_id, ad_id) -- 한 사용자는 한 광고를 한 번만
);

-- 인덱스
CREATE INDEX idx_ad_views_user ON ad_views(user_id);
CREATE INDEX idx_ad_views_ad ON ad_views(ad_id);

