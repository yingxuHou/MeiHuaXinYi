/**
 * 梅花心易 - 订阅权限中间件
 * 处理用户订阅类型验证和功能访问控制
 */

const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * 订阅权限中间件类
 */
class SubscriptionMiddleware {
  
  /**
   * 检查占卜权限
   * 验证用户是否有权限进行占卜
   */
  async checkDivinationPermission(req, res, next) {
    try {
      const userId = req.user.id;

      // 开发环境：支持开发用户
      if (process.env.NODE_ENV === 'development' && req.user.isDev) {
        console.log('🔧 开发用户跳过订阅检查:', {
          userId: req.user.id,
          email: req.user.email
        });

        // 为开发用户设置默认权限
        req.user.subscription = {
          type: 'premium',
          status: 'active',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年后过期
          features: ['unlimited_divination', 'ai_analysis', 'history_access']
        };

        req.user.usage = {
          divinationCount: 0,
          lastDivinationAt: null
        };

        return next();
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      // 检查账户状态
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: '账户已被禁用，无法使用占卜功能',
          code: 'ACCOUNT_DISABLED'
        });
      }

      // 检查订阅状态
      const subscription = user.subscription;
      const now = new Date();

      // 如果是付费订阅，检查是否过期
      if (subscription.type !== 'free' && subscription.expiresAt && subscription.expiresAt < now) {
        // 订阅已过期，降级为免费用户
        user.subscription.type = 'free';
        user.subscription.expiresAt = null;
        user.subscription.features = [];
        await user.save();

        logger.info('用户订阅已过期，自动降级为免费用户', {
          userId,
          expiredType: subscription.type,
          expiredAt: subscription.expiresAt
        });
      }

      // 检查今日免费次数（仅对免费用户）
      if (user.subscription.type === 'free') {
        const today = new Date();
        const lastResetDate = new Date(user.usage.lastResetDate);

        // 如果是新的一天，重置免费次数
        if (today.toDateString() !== lastResetDate.toDateString()) {
          user.usage.freeCountToday = 3; // 每日3次免费占卜
          user.usage.lastResetDate = today;
          await user.save();
        }

        // 检查是否还有免费次数
        if (user.usage.freeCountToday <= 0) {
          return res.status(403).json({
            success: false,
            message: '今日免费占卜次数已用完，请升级会员或明日再试',
            code: 'FREE_QUOTA_EXCEEDED',
            data: {
              subscriptionType: 'free',
              freeCountToday: user.usage.freeCountToday,
              upgradeUrl: '/subscription/upgrade'
            }
          });
        }
      }

      // 将用户信息附加到请求对象
      req.userSubscription = {
        type: user.subscription.type,
        features: user.subscription.features,
        freeCountToday: user.usage.freeCountToday,
        totalDivinations: user.usage.divinationCount
      };

      next();

    } catch (error) {
      logger.error('检查占卜权限失败', {
        userId: req.user?.id,
        error: error.message,
        stack: error.stack
      });

      res.status(500).json({
        success: false,
        message: '权限验证失败',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  }

  /**
   * 检查AI顾问权限
   * 验证用户是否有权限使用AI顾问功能
   */
  async checkAIConsultantPermission(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      // 检查是否有AI顾问功能权限
      const hasAIFeature = user.subscription.features.some(
        feature => feature.name === 'ai_consultant' && feature.enabled
      );

      if (!hasAIFeature) {
        return res.status(403).json({
          success: false,
          message: 'AI顾问功能需要升级会员',
          code: 'AI_FEATURE_REQUIRED',
          data: {
            subscriptionType: user.subscription.type,
            requiredFeature: 'ai_consultant',
            upgradeUrl: '/subscription/upgrade'
          }
        });
      }

      next();

    } catch (error) {
      logger.error('检查AI顾问权限失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '权限验证失败',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  }

  /**
   * 检查专家咨询权限
   * 验证用户是否有权限使用专家咨询功能
   */
  async checkExpertConsultationPermission(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      // 检查是否有专家咨询功能权限
      const hasExpertFeature = user.subscription.features.some(
        feature => feature.name === 'expert_consultation' && feature.enabled
      );

      if (!hasExpertFeature) {
        return res.status(403).json({
          success: false,
          message: '专家咨询功能需要高级会员',
          code: 'EXPERT_FEATURE_REQUIRED',
          data: {
            subscriptionType: user.subscription.type,
            requiredFeature: 'expert_consultation',
            upgradeUrl: '/subscription/upgrade'
          }
        });
      }

      next();

    } catch (error) {
      logger.error('检查专家咨询权限失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '权限验证失败',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  }

  /**
   * 检查无限占卜权限
   * 验证用户是否有无限占卜权限
   */
  async checkUnlimitedDivinationPermission(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      // 检查是否有无限占卜功能权限
      const hasUnlimitedFeature = user.subscription.features.some(
        feature => feature.name === 'unlimited_divination' && feature.enabled
      );

      if (!hasUnlimitedFeature && user.subscription.type === 'free') {
        // 免费用户且没有无限占卜权限，需要检查次数限制
        return this.checkDivinationPermission(req, res, next);
      }

      next();

    } catch (error) {
      logger.error('检查无限占卜权限失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '权限验证失败',
        code: 'PERMISSION_CHECK_ERROR'
      });
    }
  }

  /**
   * 获取用户订阅信息
   * 返回用户当前的订阅状态和权限
   */
  async getUserSubscriptionInfo(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select('subscription usage');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在',
          code: 'USER_NOT_FOUND'
        });
      }

      const subscription = user.subscription;
      const usage = user.usage;
      const now = new Date();

      // 检查订阅是否过期
      const isExpired = subscription.expiresAt && subscription.expiresAt < now;

      // 计算剩余天数
      const daysRemaining = subscription.expiresAt 
        ? Math.max(0, Math.ceil((subscription.expiresAt - now) / (1000 * 60 * 60 * 24)))
        : null;

      res.json({
        success: true,
        data: {
          subscriptionType: subscription.type,
          isExpired,
          expiresAt: subscription.expiresAt,
          daysRemaining,
          features: subscription.features,
          usage: {
            totalDivinations: usage.divinationCount,
            freeCountToday: usage.freeCountToday,
            lastActiveAt: usage.lastActiveAt
          },
          limits: this.getSubscriptionLimits(subscription.type)
        }
      });

    } catch (error) {
      logger.error('获取用户订阅信息失败', {
        userId: req.user?.id,
        error: error.message
      });

      res.status(500).json({
        success: false,
        message: '获取订阅信息失败',
        code: 'SUBSCRIPTION_INFO_ERROR'
      });
    }
  }

  /**
   * 获取订阅类型的限制信息
   * @param {string} subscriptionType - 订阅类型
   * @returns {Object} 限制信息
   */
  getSubscriptionLimits(subscriptionType) {
    const limits = {
      free: {
        divinationsPerDay: 3,
        aiConsultant: false,
        expertConsultation: false,
        prioritySupport: false,
        apiRateLimit: 10
      },
      basic: {
        divinationsPerDay: 20,
        aiConsultant: true,
        expertConsultation: false,
        prioritySupport: false,
        apiRateLimit: 30
      },
      premium: {
        divinationsPerDay: -1, // 无限制
        aiConsultant: true,
        expertConsultation: true,
        prioritySupport: true,
        apiRateLimit: 100
      }
    };

    return limits[subscriptionType] || limits.free;
  }
}

// 创建中间件实例
const subscriptionMiddleware = new SubscriptionMiddleware();

module.exports = subscriptionMiddleware;
