// ========================================
// 광고 관련 API (MVP 버전)
// ========================================

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authenticateToken = require('../middleware/auth');

// MVP 고정값
const TOTAL_BUDGET = 1000000; // 100만원
const USABLE_POINTS = 600000; // 60만원
const TARGET_OPTIONS = [200, 500, 1000]; // 가능한 타겟 인원

// 광고 생성 (사업자만)
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // 사업자 권한 확인
    if (req.user.user_type !== 'business') {
      return res.status(403).json({ 
        success: false,
        error: '사업자만 광고를 등록할 수 있습니다' 
      });
    }

    const { title, description, target_count } = req.body;

    // 입력 검증
    if (!title || !target_count) {
      return res.status(400).json({ 
        success: false,
        error: '제목과 타겟 인원을 입력해주세요' 
      });
    }

    // 타겟 인원 검증
    if (!TARGET_OPTIONS.includes(parseInt(target_count))) {
      return res.status(400).json({ 
        success: false,
        error: '타겟 인원은 200명, 500명, 1000명 중 하나여야 합니다' 
      });
    }

    // 1인당 포인트 계산
    const point_per_user = Math.floor(USABLE_POINTS / target_count);

    // 광고 생성
    const result = await client.query(
      `INSERT INTO ads (
        business_id, title, description, target_count,
        point_per_user, remaining_count, status
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING *`,
      [
        req.user.id,
        title,
        description || '',
        target_count,
        point_per_user,
        target_count
      ]
    );

    res.status(201).json({
      success: true,
      message: '광고가 등록되었습니다',
      ad: result.rows[0],
      budget_info: {
        total_budget: TOTAL_BUDGET,
        usable_points: USABLE_POINTS,
        roe_fee: TOTAL_BUDGET - USABLE_POINTS,
        point_per_user: point_per_user
      }
    });

  } catch (error) {
    console.error('광고 생성 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다' 
    });
  } finally {
    client.release();
  }
});

// 광고 목록 조회 (소비자용)
router.get('/available', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    // 이미 본 광고 ID 조회
    const viewedAds = await client.query(
      'SELECT ad_id FROM ad_views WHERE user_id = $1',
      [req.user.id]
    );
    
    const viewedAdIds = viewedAds.rows.map(row => row.ad_id);
    
    // 볼 수 있는 광고 조회
    let query = `
      SELECT a.*, u.name as business_name 
      FROM ads a
      JOIN users u ON a.business_id = u.id
      WHERE a.status = 'active'
      AND a.remaining_count > 0
    `;
    
    const params = [];
    
    // 이미 본 광고 제외
    if (viewedAdIds.length > 0) {
      query += ` AND a.id NOT IN (${viewedAdIds.map((_, i) => `$${i + 1}`).join(',')})`;
      params.push(...viewedAdIds);
    }
    
    query += ' ORDER BY a.created_at DESC';
    
    const result = await client.query(query, params);

    res.json({
      success: true,
      ads: result.rows
    });

  } catch (error) {
    console.error('광고 목록 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다' 
    });
  } finally {
    client.release();
  }
});

// 내가 등록한 광고 목록 (사업자용)
router.get('/my', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const result = await client.query(
      `SELECT a.*,
       (a.target_count - a.remaining_count) as viewed_count,
       ROUND(((a.target_count - a.remaining_count)::numeric / a.target_count * 100), 2) as progress
       FROM ads a
       WHERE a.business_id = $1
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      ads: result.rows
    });

  } catch (error) {
    console.error('내 광고 조회 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다' 
    });
  } finally {
    client.release();
  }
});

// 광고 시청하기 (포인트 적립)
router.post('/:id/watch', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const adId = req.params.id;

    // 광고 조회
    const adResult = await client.query(
      'SELECT * FROM ads WHERE id = $1 AND status = $2',
      [adId, 'active']
    );

    if (adResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        success: false,
        error: '광고를 찾을 수 없습니다' 
      });
    }

    const ad = adResult.rows[0];

    // 남은 인원 확인
    if (ad.remaining_count <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: '광고 시청 인원이 마감되었습니다' 
      });
    }

    // 이미 본 광고인지 확인
    const viewCheck = await client.query(
      'SELECT id FROM ad_views WHERE user_id = $1 AND ad_id = $2',
      [req.user.id, adId]
    );

    if (viewCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        success: false,
        error: '이미 시청한 광고입니다' 
      });
    }

    // 광고 시청 기록
    await client.query(
      'INSERT INTO ad_views (user_id, ad_id, points_earned) VALUES ($1, $2, $3)',
      [req.user.id, adId, ad.point_per_user]
    );

    // 사용자 포인트 증가
    await client.query(
      'UPDATE users SET points = points + $1 WHERE id = $2',
      [ad.point_per_user, req.user.id]
    );

    // 광고 남은 인원 감소
    const remaining = ad.remaining_count - 1;
    const newStatus = remaining === 0 ? 'completed' : 'active';
    
    await client.query(
      'UPDATE ads SET remaining_count = $1, status = $2 WHERE id = $3',
      [remaining, newStatus, adId]
    );

    await client.query('COMMIT');

    // 업데이트된 포인트 조회
    const userResult = await client.query(
      'SELECT points FROM users WHERE id = $1',
      [req.user.id]
    );

    res.json({
      success: true,
      message: '포인트가 적립되었습니다',
      points_earned: ad.point_per_user,
      total_points: userResult.rows[0].points
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('광고 시청 오류:', error);
    res.status(500).json({ 
      success: false,
      error: '서버 오류가 발생했습니다' 
    });
  } finally {
    client.release();
  }
});

// 내 정보 조회
router.get('/me', authenticateToken, async (req, res) => {
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

module.exports = router;