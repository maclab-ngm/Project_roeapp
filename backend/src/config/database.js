// ========================================
// 데이터베이스 연결 설정
// ========================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'roe_mvp',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// 연결 테스트
pool.on('connect', () => {
  console.log('✅ PostgreSQL 데이터베이스 연결 성공');
});

pool.on('error', (err) => {
  console.error('❌ 데이터베이스 연결 오류:', err);
});

module.exports = pool;