/**
 * 梅花心易 - 认证中间件适配器
 * 为占卜API提供统一的认证接口
 */

const authMiddleware = require('./auth');

module.exports = {
  authenticate: authMiddleware.authenticate,
  requireAuth: authMiddleware.requireAuth || authMiddleware.authenticate,
  optional: authMiddleware.optional || ((req, res, next) => {
    // 可选认证：如果有token则验证，没有则继续
    const token = req.headers.authorization?.substring(7) || req.cookies?.accessToken;
    
    if (token) {
      return authMiddleware.authenticate(req, res, next);
    } else {
      req.user = null;
      next();
    }
  })
};
