// ========================================
// 인증 관련 API (회원가입, 로그인)
// ========================================

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// 회원가입
router.post('/signup', async (req, res) => {
  let client;
  
  try {
    // JWT_SECRET 확인
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET이 설정되지 않았습니다!');
      return res.status(500).json({ 
        success: false,
        error: '서버 설정 오류가 발생했습니다' 
      });
    }

    const { email, password, name, user_type } = req.body;

    // 입력 검증
    if (!email || !password || !name || !user_type) {
      return res.status(400).json({ 
        success: false,
        error: '필수 정보를 모두 입력해주세요' 
      });
    }

    // user_type 검증
    if (user_type !== 'consumer' && user_type !== 'business') {
      return res.status(400).json({ 
        success: false,
        error: '사용자 유형은 consumer 또는 business여야 합니다' 
      });
    }

    // 데이터베이스 연결
    client = await pool.connect();

    // 이메일 중복 확인
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: '이미 존재하는 이메일입니다' 
      });
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const result = await client.query(
      `INSERT INTO users (email, password, name, user_type, points) 
       VALUES ($1, $2, $3, $4, 0)
       RETURNING id, email, name, user_type, points, created_at`,
      [email, hashedPassword, name, user_type]
    );

    const user = result.rows[0];

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        user_type: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: '회원가입 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        points: user.points
      }
    });

  } catch (error) {
    console.error('회원가입 오류:', error);
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    // 데이터베이스 연결 오류인 경우
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        success: false,
        error: '데이터베이스에 연결할 수 없습니다',
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // 테이블이 없는 경우
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      return res.status(500).json({ 
        success: false,
        error: '데이터베이스 테이블이 존재하지 않습니다',
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

// 로그인
router.post('/login', async (req, res) => {
  let client;
  
  try {
    // JWT_SECRET 확인
    if (!process.env.JWT_SECRET) {
      console.error('❌ JWT_SECRET이 설정되지 않았습니다!');
      return res.status(500).json({ 
        success: false,
        error: '서버 설정 오류가 발생했습니다' 
      });
    }

    const { email, password } = req.body;

    // 데이터베이스 연결
    client = await pool.connect();

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: '이메일과 비밀번호를 입력해주세요' 
      });
    }

    // 사용자 조회
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다' 
      });
    }

    const user = result.rows[0];

    // 비밀번호 확인
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ 
        success: false,
        error: '이메일 또는 비밀번호가 올바르지 않습니다' 
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        user_type: user.user_type 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        user_type: user.user_type,
        points: user.points
      }
    });

  } catch (error) {
    console.error('로그인 오류:', error);
    console.error('오류 상세:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail
    });
    
    // 데이터베이스 연결 오류인 경우
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(500).json({ 
        success: false,
        error: '데이터베이스에 연결할 수 없습니다',
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    // 테이블이 없는 경우
    if (error.code === '42P01' || error.message.includes('does not exist')) {
      return res.status(500).json({ 
        success: false,
        error: '데이터베이스 테이블이 존재하지 않습니다',
        detail: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
});

module.exports = router;