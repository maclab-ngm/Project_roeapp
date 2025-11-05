// ========================================
// ROE MVP 백엔드 서버
// ========================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const adsRoutes = require('./routes/ads');
const authenticateToken = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// 미들웨어
// ========================================
app.use(cors({
  origin: '*',  // 모든 출처 허용
  credentials: true
})); // 모든 출처 허용 (프로덕션에서는 제한 필요)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (이미지) - 추가!
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 요청 로깅
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================================
// 라우트
// ========================================

// 헬스체크
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'ROE MVP API 서버가 실행 중입니다',
    version: '1.0.0'
  });
});

// 인증 라우트
app.use('/api/auth', authRoutes);

// 광고 라우트
app.use('/api/ads', adsRoutes);

// 내 정보 조회 (별도 엔드포인트)
app.get('/api/users/me', authenticateToken, async (req, res) => {
  const pool = require('./config/database');
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      'SELECT id, email, name, user_type, points, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: '사용자를 찾을 수 없습니다' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('사용자 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다' 
    });
  } finally {
    client.release();
  }
});

// ========================================
// 404 핸들러
// ========================================
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: '요청한 엔드포인트를 찾을 수 없습니다' 
  });
});

// ========================================
// 에러 핸들러
// ========================================
app.use((err, req, res, next) => {
  console.error('서버 오류:', err.stack);
  res.status(500).json({ 
    success: false,
    error: '서버 내부 오류가 발생했습니다' 
  });
});

// ========================================
// 서버 시작
// ========================================
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 ROE MVP API 서버 시작!');
  console.log(`📡 포트: ${PORT}`);
  console.log(`🌍 URL: http://localhost:${PORT}`);
  console.log(`🔧 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================');
});

// 에러 핸들링
process.on('unhandledRejection', (err) => {
  console.error('❌ 처리되지 않은 Promise 거부:', err);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM 신호 수신. 서버를 종료합니다...');
  process.exit(0);
});

module.exports = app;