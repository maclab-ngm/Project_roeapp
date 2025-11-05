// ========================================
// 데이터베이스 연결 테스트 스크립트
// ========================================

require('dotenv').config();
const pool = require('./src/config/database');

async function testDatabase() {
  console.log('🔍 데이터베이스 연결 테스트 시작...\n');
  
  console.log('📋 환경 변수:');
  console.log('  DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('  DB_PORT:', process.env.DB_PORT || 5432);
  console.log('  DB_NAME:', process.env.DB_NAME || 'roe_mvp');
  console.log('  DB_USER:', process.env.DB_USER || 'postgres');
  console.log('  JWT_SECRET:', process.env.JWT_SECRET ? '✅ 설정됨' : '❌ 설정 안됨');
  console.log('');

  let client;
  try {
    console.log('🔄 데이터베이스 연결 시도 중...');
    client = await pool.connect();
    console.log('✅ 데이터베이스 연결 성공!\n');

    // 테이블 존재 확인
    console.log('🔍 테이블 존재 여부 확인 중...');
    const tables = ['users', 'ads', 'ad_views'];
    
    for (const table of tables) {
      const result = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )`,
        [table]
      );
      
      if (result.rows[0].exists) {
        console.log(`  ✅ ${table} 테이블 존재`);
      } else {
        console.log(`  ❌ ${table} 테이블 없음`);
      }
    }

    console.log('\n✅ 모든 테스트 완료!');
    
  } catch (error) {
    console.error('\n❌ 오류 발생:');
    console.error('  메시지:', error.message);
    console.error('  코드:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 해결 방법:');
      console.error('  1. PostgreSQL이 실행 중인지 확인하세요');
      console.error('  2. DB_HOST와 DB_PORT가 올바른지 확인하세요');
    } else if (error.code === '28P01') {
      console.error('\n💡 해결 방법:');
      console.error('  1. DB_USER와 DB_PASSWORD가 올바른지 확인하세요');
    } else if (error.code === '3D000') {
      console.error('\n💡 해결 방법:');
      console.error('  1. 데이터베이스가 존재하는지 확인하세요');
      console.error('  2. database/schema.sql 파일을 실행하여 데이터베이스를 생성하세요');
    }
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
    process.exit(0);
  }
}

testDatabase();


