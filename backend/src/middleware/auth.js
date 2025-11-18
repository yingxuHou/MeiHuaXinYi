/**
 * 梅花心易 - 认证中间件
 * JWT验证和路由保护
 */

const JWTUtils = require('../utils/jwt');
const User = require('../models/User');

/**
 * 从请求中提取令牌
 */
const extractToken = (req) => {
  let token = null;

  // 从Authorization头提取
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 从Cookie提取（备用方案）
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  // 从查询参数提取（仅用于特殊情况）
  if (!token && req.query.token) {
    token = req.query.token;
  }

  return token;
};

/**
 * 处理开发token（开发环境）
 */
const handleDevToken = async (token) => {
  try {
    // 解析开发token
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = JSON.parse(atob(parts[1]));

    // 检查token是否过期
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // 检查是否是开发token
    if (!payload.isDev) {
      return null;
    }

    // 创建开发用户对象
    const devUser = {
      id: payload.userId,
      email: payload.email,
      nickname: payload.email ? payload.email.split('@')[0] + '(开发)' : '开发用户',
      avatar: '',
      gender: '',
      birthDate: '',
      phone: '',
      status: 'active',
      isLocked: false,
      isDev: true,
      createdAt: new Date(),
      verification: {
        email: { isVerified: true }
      }
    };

    return devUser;
  } catch (error) {
    console.warn('解析开发token失败:', error.message);
    return null;
  }
};

/**
 * 认证中间件
 * 验证JWT令牌并加载用户信息
 */
const authenticate = async (req, res, next) => {
  try {
    // 提取令牌
    const token = extractToken(req);

    // 开发环境调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('🔐 认证中间件调试:', {
        url: req.originalUrl,
        method: req.method,
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 50) + '...' : 'null',
        authHeader: req.headers.authorization,
        isDevToken: token ? token.includes('dev-signature') : false
      });
    }

    if (!token) {
      console.log('❌ Token缺失:', {
        url: req.originalUrl,
        headers: req.headers
      });
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: '访问令牌缺失'
        }
      });
    }

    // 添加详细的token验证日志
    console.log('🔍 开始验证token:', {
      url: req.originalUrl,
      tokenLength: token.length,
      tokenStart: token.substring(0, 20) + '...',
      tokenEnd: token.substring(token.length - 20)
    });

    // 开发环境：支持开发token
    if (process.env.NODE_ENV === 'development' && token.includes('dev-signature')) {
      console.log('🔧 处理开发token...');
      const devUser = await handleDevToken(token);
      if (devUser) {
        console.log('✅ 开发token验证成功:', {
          userId: devUser.id,
          email: devUser.email
        });
        req.user = devUser;
        req.token = token;
        req.tokenPayload = { userId: devUser.id, type: 'access', isDev: true };
        return next();
      } else {
        console.log('❌ 开发token验证失败');
      }
    }

    // 验证令牌
    console.log('🔍 调用JWTUtils.verifyToken验证token...');
    const verifyResult = JWTUtils.verifyToken(token);
    console.log('🔍 JWT验证结果:', {
      success: verifyResult.success,
      error: verifyResult.error,
      hasPayload: !!verifyResult.payload
    });
    
    if (!verifyResult.success) {
      console.log('❌ Token验证失败:', {
        url: req.originalUrl,
        error: verifyResult.error,
        tokenPreview: token.substring(0, 50) + '...'
      });
      return res.status(401).json({
        success: false,
        error: verifyResult.error
      });
    }

    console.log('✅ Token验证成功:', {
      url: req.originalUrl,
      userId: verifyResult.payload.userId,
      tokenType: verifyResult.payload.type,
      issuedAt: verifyResult.payload.iat,
      expiresAt: verifyResult.payload.exp
    });

    const { payload } = verifyResult;

    // 检查令牌类型
    if (payload.type !== 'access') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN_TYPE',
          message: '令牌类型错误'
        }
      });
    }

    // 检查令牌是否在黑名单中
    if (await JWTUtils.isTokenBlacklisted(token)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_BLACKLISTED',
          message: '令牌已失效'
        }
      });
    }

    // 检查用户令牌是否被撤销
    if (await JWTUtils.isUserTokenRevoked(payload.userId, payload.iat)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REVOKED',
          message: '令牌已被撤销'
        }
      });
    }

    // 加载用户信息
    let user;
    
    // 检查是否是模拟用户ID
    if (payload.userId && payload.userId.startsWith('mock-user-id-')) {
      // 创建模拟用户对象
      user = {
        _id: payload.userId,
        username: payload.username || 'anyuser',
        email: payload.email || 'anyuser@example.com',
        status: 'active',
        isLocked: false,
        profile: {
          nickname: payload.username || '任意用户',
          gender: 'unknown',
          birthday: null,
          avatar: null,
          location: null,
          bio: '这是任意用户，无需认证'
        },
        verification: {
          email: { isVerified: true },
          phone: { isVerified: true }
        },
        isVIP: true, // 设置为VIP用户
        todayFreeCount: 999, // 设置大量免费次数
        divination: { paidCount: 0 },
        security: { lastLoginAt: new Date() }
      };
      
      console.log('🔓 认证中间件：使用任意用户（无认证模式）', {
        userId: user._id,
        username: user.username,
        isVIP: user.isVIP,
        freeCount: user.todayFreeCount
      });
    } else {
      // 正常用户查找
      user = await User.findById(payload.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在'
          }
        });
      }
    }

    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: '用户账户已被禁用'
        }
      });
    }

    // 检查账户是否被锁定
    if (user.isLocked) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: '账户已被锁定'
        }
      });
    }

    // 将用户信息和令牌信息添加到请求对象
    req.user = user;
    req.token = token;
    req.tokenPayload = payload;

    next();
  } catch (error) {
    console.error('认证中间件错误:', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: '认证过程发生错误'
      }
    });
  }
};

/**
 * 可选认证中间件
 * 如果有令牌则验证，没有令牌则跳过
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return next();
    }

    // 验证令牌
    const verifyResult = JWTUtils.verifyToken(token);
    if (!verifyResult.success) {
      return next();
    }

    const { payload } = verifyResult;

    // 检查令牌类型
    if (payload.type !== 'access') {
      return next();
    }

    // 检查令牌是否在黑名单中
    if (await JWTUtils.isTokenBlacklisted(token)) {
      return next();
    }

    // 加载用户信息
    const user = await User.findById(payload.userId);
    if (user && user.status === 'active' && !user.isLocked) {
      req.user = user;
      req.token = token;
      req.tokenPayload = payload;
    }

    next();
  } catch (error) {
    // 可选认证出错时不阻止请求继续
    console.warn('可选认证中间件警告:', error.message);
    next();
  }
};

/**
 * 权限检查中间件工厂
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: '需要登录'
        }
      });
    }

    // 检查用户权限（这里可以根据实际需求扩展）
    if (permission === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: '权限不足'
        }
      });
    }

    next();
  };
};

/**
 * VIP用户检查中间件
 */
const requireVIP = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: '需要登录'
      }
    });
  }

  if (!req.user.isVIP) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'VIP_REQUIRED',
        message: '需要VIP会员权限'
      }
    });
  }

  next();
};

/**
 * 邮箱验证检查中间件
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_REQUIRED',
        message: '需要登录'
      }
    });
  }

  if (!req.user.verification.email.isVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'EMAIL_VERIFICATION_REQUIRED',
        message: '需要验证邮箱'
      }
    });
  }

  next();
};

/**
 * API密钥认证中间件
 */
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'API_KEY_MISSING',
          message: 'API密钥缺失'
        }
      });
    }

    // 验证API密钥格式
    if (!JWTUtils.validateApiKeyFormat(apiKey)) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY_FORMAT',
          message: 'API密钥格式错误'
        }
      });
    }

    // 这里可以添加API密钥的数据库验证逻辑
    // 目前先简单验证格式

    req.apiKey = apiKey;
    next();
  } catch (error) {
    console.error('API密钥认证错误:', error.message);
    return res.status(500).json({
      success: false,
      error: {
        code: 'API_KEY_AUTH_ERROR',
        message: 'API密钥认证过程发生错误'
      }
    });
  }
};

module.exports = {
  authenticate,
  optionalAuth,
  requirePermission,
  requireVIP,
  requireEmailVerification,
  authenticateApiKey,
  extractToken
};
