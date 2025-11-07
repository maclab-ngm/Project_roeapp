// ========================================
// 데이터베이스 연결 설정
// ========================================

const { Pool } = require('pg');
require('dotenv').config();

// Render는 DATABASE_URL을 자동으로 제공합니다
// DATABASE_URL이 있으면 우선 사용, 없으면 개별 환경변수 사용
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false, // Render 등의 클라우드 DB 연결 시 필요
        },
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'roe_mvp',
        password: process.env.DB_PASSWORD || 'password',
        port: process.env.DB_PORT || 5432,
      }
);

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 오류:', err);
});

module.exports = pool;