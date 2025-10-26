/**
 * 梅花心易 - 用户路由
 * 处理用户信息管理相关的路由
 */

const express = require('express');
const router = express.Router();

// 导入控制器
const userController = require('../controllers/userController');

// 导入中间件
const { authenticate, requireEmailVerification } = require('../middleware/auth');

// 导入验证规则
const {
  validateUpdateProfile,
  validateUpdateBirthInfo,
  validateUpdatePreferences,
  validateChangePassword,
  validateDeleteAccount
} = require('../utils/validation');

/**
 * @route   GET /api/user/profile
 * @desc    获取当前用户完整信息
 * @access  Private
 */
router.get('/profile', authenticate, userController.getCurrentUser);

/**
 * @route   PUT /api/user/profile
 * @desc    更新用户基本信息
 * @access  Private
 */
router.put('/profile', authenticate, validateUpdateProfile, userController.updateProfile);

/**
 * @route   PUT /api/user/birth-info
 * @desc    更新生辰八字信息
 * @access  Private
 */
router.put('/birth-info', authenticate, validateUpdateBirthInfo, userController.updateBirthInfo);

/**
 * @route   PUT /api/user/preferences
 * @desc    更新用户偏好设置
 * @access  Private
 */
router.put('/preferences', authenticate, validateUpdatePreferences, userController.updatePreferences);

/**
 * @route   POST /api/user/change-password
 * @desc    修改密码
 * @access  Private
 */
router.post('/change-password', authenticate, validateChangePassword, userController.changePassword);

/**
 * @route   GET /api/user/stats
 * @desc    获取用户统计信息
 * @access  Private
 */
router.get('/stats', authenticate, userController.getUserStats);

/**
 * @route   DELETE /api/user/account
 * @desc    删除用户账户
 * @access  Private
 */
router.delete('/account', authenticate, validateDeleteAccount, userController.deleteAccount);

/**
 * @route   GET /api/user/divination-count
 * @desc    获取用户占卜次数信息
 * @access  Private
 */
router.get('/divination-count', authenticate, (req, res) => {
  try {
    const user = req.user;
    
    // 重置每日免费次数
    const wasReset = user.resetDailyFreeCount();
    if (wasReset) {
      user.save();
    }

    res.json({
      success: true,
      data: {
        freeCount: user.todayFreeCount,
        paidCount: user.divination.paidCount,
        totalCount: user.divination.totalCount,
        lastResetDate: user.divination.lastResetDate,
        canDivination: user.todayFreeCount > 0 || user.divination.paidCount > 0
      }
    });
  } catch (error) {
    console.error('获取占卜次数错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_DIVINATION_COUNT_ERROR',
        message: '获取占卜次数失败'
      }
    });
  }
});

/**
 * @route   POST /api/user/consume-divination
 * @desc    消费占卜次数
 * @access  Private
 */
router.post('/consume-divination', authenticate, async (req, res) => {
  try {
    const user = req.user;
    
    // 消费占卜次数
    const result = user.consumeDivinationCount();
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_DIVINATION_COUNT',
          message: '占卜次数不足'
        }
      });
    }

    // 增加总占卜次数
    user.divination.totalCount += 1;
    await user.save();

    res.json({
      success: true,
      message: '占卜次数消费成功',
      data: {
        consumedType: result.type,
        remainingFreeCount: user.divination.freeCount,
        remainingPaidCount: user.divination.paidCount,
        totalCount: user.divination.totalCount
      }
    });
  } catch (error) {
    console.error('消费占卜次数错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONSUME_DIVINATION_ERROR',
        message: '消费占卜次数失败'
      }
    });
  }
});

/**
 * @route   GET /api/user/membership
 * @desc    获取用户会员信息
 * @access  Private
 */
router.get('/membership', authenticate, (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        membership: user.membership,
        isVIP: user.isVIP,
        features: user.membership.features || []
      }
    });
  } catch (error) {
    console.error('获取会员信息错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_MEMBERSHIP_ERROR',
        message: '获取会员信息失败'
      }
    });
  }
});

/**
 * @route   GET /api/user/security
 * @desc    获取用户安全信息
 * @access  Private
 */
router.get('/security', authenticate, (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        security: {
          lastLoginAt: user.security.lastLoginAt,
          lastLoginIP: user.security.lastLoginIP,
          twoFactorEnabled: user.security.twoFactorEnabled,
          passwordChangedAt: user.security.passwordChangedAt,
          isLocked: user.isLocked
        },
        verification: {
          emailVerified: user.verification.email.isVerified,
          phoneVerified: user.verification.phone.isVerified
        }
      }
    });
  } catch (error) {
    console.error('获取安全信息错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_SECURITY_ERROR',
        message: '获取安全信息失败'
      }
    });
  }
});

module.exports = router;
