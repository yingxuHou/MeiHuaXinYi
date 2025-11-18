/**
 * 梅花心易 - 认证控制器
 * 处理用户注册、登录、令牌刷新等认证相关操作
 */

const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    // 验证输入数据
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '输入数据验证失败',
          details: errors.array()
        }
      });
    }

    const { username, email, password, phone, profile } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [
        { email },
        { username }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email ? '邮箱' : '用户名';
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: `${field}已被注册`
        }
      });
    }

    // 创建新用户
    const userData = {
      username,
      email,
      password,
      ...(phone && { phone }),
      ...(profile && { profile })
    };

    const user = await User.createUser(userData);

    // 确保新用户有10次免费占卜次数（初始化）
    user.usage.freeCountToday = 10;
    user.usage.lastResetDate = new Date();

    // 生成验证码
    const verificationCode = emailService.generateVerificationCode();
    const emailVerificationToken = user.generateEmailVerificationToken();
    
    // 保存验证码到用户记录
    user.verification.email.code = verificationCode;
    user.verification.email.codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟有效期
    await user.save();

    // 生成JWT令牌对
    const tokens = JWTUtils.generateTokenPair({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    // 发送验证码邮件
    const emailSent = await emailService.sendVerificationCode(email, verificationCode, 'register');
    
    if (!emailSent) {
      console.warn('⚠️ 验证码邮件发送失败，但用户注册成功');
    }

    // 开发环境输出验证码到控制台
    console.log('📧 注册验证码:', verificationCode);
    console.log('📧 邮箱验证令牌:', emailVerificationToken);

    // 获取当前免费次数（使用实际值，确保正确）
    const freeCount = user.usage.freeCountToday;
    console.log('🔍 注册时用户免费次数:', freeCount);
    console.log('🔍 用户usage对象:', JSON.stringify(user.usage));

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          isEmailVerified: user.verification.email.isVerified,
          divination: {
            freeCount: freeCount,
            paidCount: user.divination.paidCount
          },
          createdAt: user.createdAt
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });
  } catch (error) {
    console.error('注册错误:', error.message);
    
    if (error.code === 'EMAIL_EXISTS') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: '注册过程发生错误'
      }
    });
  }
};

/**
 * 用户登录（真实认证版本）
 * 验证用户名/邮箱和密码，只有注册过的用户才能登录
 */
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    // 验证输入
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: '用户名/邮箱和密码不能为空'
        }
      });
    }

    console.log('🔐 开始用户登录认证...');
    console.log('输入的用户名/邮箱:', identifier);

    // 规范化identifier：邮箱统一转小写，去除首尾空格
    const isEmail = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(identifier);
    const normalizedIdentifier = (identifier || '').trim();
    const lookupIdentifier = isEmail ? normalizedIdentifier.toLowerCase() : normalizedIdentifier;

    // 根据邮箱或用户名查找用户（包含密码字段）
    const user = await User.findByEmailOrUsername(lookupIdentifier).select('+password');

    if (!user) {
      console.log('❌ 用户不存在:', identifier);
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名/邮箱或密码错误'
        }
      });
    }

    // 检查用户状态
    if (user.status !== 'active') {
      console.log('❌ 用户账户已被禁用:', user._id);
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_DISABLED',
          message: '用户账户已被禁用'
        }
      });
    }

    // 检查账户是否被锁定
    if (user.isLocked) {
      console.log('❌ 账户已被锁定:', user._id);
      return res.status(401).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: '账户已被锁定，请联系管理员'
        }
      });
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      console.log('❌ 密码错误:', user._id);
      
      // 增加登录失败次数
      user.security.loginAttempts += 1;
      
      // 如果失败次数超过5次，锁定账户
      if (user.security.loginAttempts >= 5) {
        user.security.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 锁定2小时
        await user.save();
        
        return res.status(401).json({
          success: false,
          error: {
            code: 'TOO_MANY_ATTEMPTS',
            message: '登录失败次数过多，账户已锁定2小时'
          }
        });
      }
      
      await user.save();
      
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用户名/邮箱或密码错误'
        }
      });
    }

    // 登录成功，重置登录失败次数
    const previousLastLoginAt = user.security.lastLoginAt || new Date(0);
    user.security.loginAttempts = 0;
    user.security.lockUntil = undefined;
    user.security.lastLoginAt = new Date();
    user.usage.lastActiveAt = new Date();
    
    // 重置每日免费次数（如果是新的一天，或新用户首次登录）
    const wasReset = user.resetDailyFreeCount();
    // 如果是新用户（免费次数为0或未设置），设置为10
    if (!user.usage.freeCountToday || user.usage.freeCountToday === 0) {
      user.usage.freeCountToday = 10;
      user.usage.lastResetDate = new Date();
    }
    
    // 更新连续登录天数（基于上次登录时间计算）
    const today = new Date();
    const daysDiff = Math.floor((today - previousLastLoginAt) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      user.usage.consecutiveLoginDays += 1;
    } else if (daysDiff > 1) {
      user.usage.consecutiveLoginDays = 1;
    }
    
    await user.save();

    // 生成JWT令牌对
    const tokens = JWTUtils.generateTokenPair({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    console.log('✅ 登录成功:', {
      userId: user._id,
      username: user.username
    });

    // 获取当前免费次数（使用实际值）
    const freeCount = user.usage.freeCountToday;

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          isEmailVerified: user.verification.email.isVerified,
          isPhoneVerified: user.verification.phone.isVerified,
          isVIP: user.isVIP,
          divination: {
            freeCount: freeCount,
            paidCount: user.divination.paidCount
          },
          lastLoginAt: user.security.lastLoginAt,
          createdAt: user.createdAt
        },
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: '登录过程发生错误'
      }
    });
  }
};

/**
 * 刷新访问令牌
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'REFRESH_TOKEN_MISSING',
          message: '刷新令牌缺失'
        }
      });
    }

    // 刷新访问令牌
    const result = await JWTUtils.refreshAccessToken(refreshToken);
    
    if (!result.success) {
      return res.status(401).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: '令牌刷新成功',
      data: {
        tokens: result.tokens
      }
    });
  } catch (error) {
    console.error('令牌刷新错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_TOKEN_ERROR',
        message: '令牌刷新过程发生错误'
      }
    });
  }
};

/**
 * 用户登出
 */
const logout = async (req, res) => {
  try {
    const token = req.token;

    if (token) {
      // 将令牌加入黑名单
      await JWTUtils.blacklistToken(token);
    }

    res.json({
      success: true,
      message: '登出成功'
    });
  } catch (error) {
    console.error('登出错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: '登出过程发生错误'
      }
    });
  }
};

/**
 * 登出所有设备
 */
const logoutAll = async (req, res) => {
  try {
    const userId = req.user._id;

    // 撤销用户所有令牌
    await JWTUtils.revokeAllUserTokens(userId);

    res.json({
      success: true,
      message: '已从所有设备登出'
    });
  } catch (error) {
    console.error('全部登出错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ALL_ERROR',
        message: '全部登出过程发生错误'
      }
    });
  }
};

/**
 * 验证邮箱
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: '验证令牌缺失'
        }
      });
    }

    // 查找用户
    const user = await User.findOne({
      'verification.email.token': require('crypto').createHash('sha256').update(token).digest('hex'),
      'verification.email.expiresAt': { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '验证令牌无效或已过期'
        }
      });
    }

    // 验证邮箱
    user.verification.email.isVerified = true;
    user.verification.email.token = undefined;
    user.verification.email.expiresAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功'
    });
  } catch (error) {
    console.error('邮箱验证错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_VERIFICATION_ERROR',
        message: '邮箱验证过程发生错误'
      }
    });
  }
};

/**
 * 重新发送邮箱验证
 */
const resendEmailVerification = async (req, res) => {
  try {
    const user = req.user;

    if (user.verification.email.isVerified) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_VERIFIED',
          message: '邮箱已验证'
        }
      });
    }

    // 生成新的验证令牌
    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: 发送邮箱验证邮件
    console.log('邮箱验证令牌:', emailVerificationToken);

    res.json({
      success: true,
      message: '验证邮件已发送'
    });
  } catch (error) {
    console.error('重发邮箱验证错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESEND_EMAIL_ERROR',
        message: '重发验证邮件过程发生错误'
      }
    });
  }
};

/**
 * 验证邮箱验证码
 */
const verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: '邮箱和验证码不能为空'
        }
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在'
        }
      });
    }

    // 检查验证码
    if (!user.verification.email.code || 
        user.verification.email.code !== code ||
        !user.verification.email.codeExpiresAt ||
        user.verification.email.codeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: '验证码无效或已过期'
        }
      });
    }

    // 验证成功，更新用户状态
    user.verification.email.isVerified = true;
    user.verification.email.code = undefined;
    user.verification.email.codeExpiresAt = undefined;
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功',
      data: {
        isEmailVerified: user.verification.email.isVerified
      }
    });
  } catch (error) {
    console.error('验证码验证错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: '验证码验证过程发生错误'
      }
    });
  }
};

/**
 * 发送登录验证码
 */
const sendLoginCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_EMAIL',
          message: '邮箱不能为空'
        }
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在'
        }
      });
    }

    // 生成验证码
    const verificationCode = emailService.generateVerificationCode();
    
    // 保存验证码到用户记录
    user.verification.email.code = verificationCode;
    user.verification.email.codeExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5分钟有效期
    await user.save();

    // 发送验证码邮件
    const emailSent = await emailService.sendVerificationCode(email, verificationCode, 'login');
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'EMAIL_SEND_FAILED',
          message: '验证码发送失败，请稍后重试'
        }
      });
    }

    // 开发环境输出验证码到控制台
    console.log('📧 登录验证码:', verificationCode);

    res.json({
      success: true,
      message: '验证码已发送到您的邮箱',
      data: {
        email: email,
        expiresIn: 300 // 5分钟
      }
    });
  } catch (error) {
    console.error('发送登录验证码错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEND_CODE_ERROR',
        message: '发送验证码过程发生错误'
      }
    });
  }
};

/**
 * 验证登录验证码
 */
const verifyLoginCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: '邮箱和验证码不能为空'
        }
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在'
        }
      });
    }

    // 检查验证码
    if (!user.verification.email.code || 
        user.verification.email.code !== code ||
        !user.verification.email.codeExpiresAt ||
        user.verification.email.codeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: '验证码无效或已过期'
        }
      });
    }

    // 清除验证码
    user.verification.email.code = undefined;
    user.verification.email.codeExpiresAt = undefined;
    await user.save();

    // 生成JWT令牌对
    const tokens = JWTUtils.generateTokenPair({
      userId: user._id,
      username: user.username,
      email: user.email
    });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isEmailVerified: user.verification.email.isVerified,
          isPhoneVerified: user.verification.phone.isVerified,
          profile: user.profile,
          subscription: user.subscription,
          createdAt: user.createdAt
        },
        tokens
      }
    });
  } catch (error) {
    console.error('验证登录验证码错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_VERIFICATION_ERROR',
        message: '登录验证过程发生错误'
      }
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  logoutAll,
  verifyEmail,
  resendEmailVerification,
  verifyEmailCode,
  sendLoginCode,
  verifyLoginCode
};
