-- ========================================
-- 4. 테스트 데이터 (선택사항)
-- ========================================

-- 테스트 사업자 계정 (비밀번호: test123)
INSERT INTO users (email, password, name, user_type) VALUES
('test_business@roe.com', '$2b$10$8JZvNQXz5XQqP8x8F7Y9.uK8qJvC.jZz5Y5rZ5Y5Y5Y5Y5Y5Y5Y5Y', '테스트학원', 'business');

-- 테스트 소비자 계정 (비밀번호: test123)
INSERT INTO users (email, password, name, user_type, points) VALUES
('test_consumer@roe.com', '$2b$10$8JZvNQXz5XQqP8x8F7Y9.uK8qJvC.jZz5Y5rZ5Y5Y5Y5Y5Y5Y5Y5Y', '김소비', 'consumer', 0);

-- 스키마 생성 완료!
SELECT 'ROE MVP 데이터베이스 스키마가 생성되었습니다!' as message;