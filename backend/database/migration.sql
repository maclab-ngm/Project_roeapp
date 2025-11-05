-- ========================================
-- ROE MVP - 기능 추가 마이그레이션
-- ========================================

-- 1. users 테이블에 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS address VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_type VARCHAR(50);

-- 2. ads 테이블에 컬럼 추가
ALTER TABLE ads ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- 3. 기존 데이터 업데이트 (선택사항)
UPDATE users SET address = '종암동' WHERE user_type = 'consumer' AND address IS NULL;
UPDATE users SET business_type = '학원' WHERE user_type = 'business' AND business_type IS NULL;

-- 4. 확인
SELECT 'users 테이블:' as info;
\d users

SELECT 'ads 테이블:' as info;
\d ads

SELECT '✅ 마이그레이션 완료!' as message;