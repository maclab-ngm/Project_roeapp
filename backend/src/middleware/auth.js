// ========================================
// JWT 인증 미들웨어
// ========================================

const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: '인증 토큰이 필요합니다' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: '유효하지 않은 토큰입니다' 
      });
    }
    
    req.user = user; // { id, email, user_type }
    next();
  });
};

module.exports = authenticateToken;