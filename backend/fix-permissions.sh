#!/bin/bash

# ========================================
# ROE MVP 데이터베이스 권한 수정 스크립트
# ========================================

echo "🔧 데이터베이스 권한 수정 중..."

# .env 파일에서 데이터베이스 정보 읽기
source .env 2>/dev/null || true

DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_NAME=${DB_NAME:-roe_mvp}
DB_PORT=${DB_PORT:-5432}

echo "📋 데이터베이스 정보:"
echo "  사용자: $DB_USER"
echo "  호스트: $DB_HOST"
echo "  데이터베이스: $DB_NAME"
echo "  포트: $DB_PORT"
echo ""

# PostgreSQL에 연결하여 권한 부여
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME <<EOF

-- 모든 테이블에 대한 권한 부여
GRANT ALL PRIVILEGES ON users TO $DB_USER;
GRANT ALL PRIVILEGES ON ads TO $DB_USER;
GRANT ALL PRIVILEGES ON ad_views TO $DB_USER;

-- 시퀀스 권한 부여
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO $DB_USER;
GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO $DB_USER;
GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO $DB_USER;

-- 미래에 생성될 테이블에 대한 기본 권한 설정
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

SELECT '✅ 권한이 성공적으로 부여되었습니다!' as message;

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 권한 수정 완료!"
else
    echo ""
    echo "❌ 권한 수정 실패. 수동으로 실행해주세요:"
    echo ""
    echo "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo ""
    echo "그 다음 다음 SQL을 실행하세요:"
    echo "GRANT ALL PRIVILEGES ON users TO $DB_USER;"
    echo "GRANT ALL PRIVILEGES ON ads TO $DB_USER;"
    echo "GRANT ALL PRIVILEGES ON ad_views TO $DB_USER;"
    echo "GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO $DB_USER;"
    echo "GRANT USAGE, SELECT ON SEQUENCE ads_id_seq TO $DB_USER;"
    echo "GRANT USAGE, SELECT ON SEQUENCE ad_views_id_seq TO $DB_USER;"
fi


