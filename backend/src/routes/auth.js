/**
 * 梅花心易 - 认证路由
 * 处理用户认证相关的路由
 */

const express = require('express');
const router = express.Router();

// 导入控制器
const authController = require('../controllers/authController');

// 导入中间件
const { authenticate } = require('../middleware/auth');

// 导入验证规则
const {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateEmailVerificationToken
} = require('../utils/validation');

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    刷新访问令牌
 * @access  Public
 */
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    从所有设备登出
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    验证邮箱
 * @access  Public
 */
router.get('/verify-email/:token', validateEmailVerificationToken, authController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    重新发送邮箱验证
 * @access  Private
 */
router.post('/resend-verification', authenticate, authController.resendEmailVerification);

/**
 * @route   GET /api/auth/me
 * @desc    获取当前用户信息（认证检查）
 * @access  Private
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        isEmailVerified: req.user.verification.email.isVerified,
        isVIP: req.user.isVIP,
        status: req.user.status
      },
      token: {
        userId: req.tokenPayload.userId,
        issuedAt: new Date(req.tokenPayload.iat * 1000),
        expiresAt: new Date(req.tokenPayload.exp * 1000)
      }
    }
  });
});

/**
 * @route   POST /api/auth/verify-email-code
 * @desc    验证邮箱验证码
 * @access  Public
 */
router.post('/verify-email-code', authController.verifyEmailCode);

/**
 * @route   POST /api/auth/send-login-code
 * @desc    发送登录验证码
 * @access  Public
 */
router.post('/send-login-code', authController.sendLoginCode);

/**
 * @route   POST /api/auth/verify-login-code
 * @desc    验证登录验证码
 * @access  Public
 */
router.post('/verify-login-code', authController.verifyLoginCode);

/**
 * @route   GET /api/auth/status
 * @desc    检查认证状态
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      authenticated: false,
      message: '未认证状态'
    }
  });
});

module.exports = router;
