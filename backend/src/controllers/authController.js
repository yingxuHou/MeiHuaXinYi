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
 * 用户登录（完全无认证版本）
 * 接受任何账号密码都能登录成功，完全跳过所有验证
 */
const login = async (req, res) => {
  try {
    const { identifier, password, rememberMe } = req.body;

    // 完全跳过认证 - 任何账号密码都能登录
    console.log('🔓 完全跳过认证模式 - 任何账号密码都能登录');
    console.log('输入的用户名:', identifier);
    console.log('输入的密码:', password);

    // 创建模拟用户数据
    const mockUser = {
      _id: 'mock-user-id-' + Date.now(),
      username: identifier || 'anyuser',
      email: identifier ? `${identifier}@example.com` : 'anyuser@example.com',
      profile: {
        nickname: identifier || '任意用户',
        avatar: null,
        gender: 'unknown',
        birthday: null,
        location: null,
        bio: '这是任意用户，无需认证'
      },
      verification: {
        email: {
          isVerified: true
        },
        phone: {
          isVerified: true
        }
      },
      isVIP: true, // 设置为VIP用户
      todayFreeCount: 999, // 设置大量免费次数
      divination: {
        paidCount: 0
      },
      security: {
        lastLoginAt: new Date(),
        loginCount: 1
      }
    };

    // 生成JWT令牌对
    const tokens = JWTUtils.generateTokenPair({
      userId: mockUser._id,
      username: mockUser.username,
      email: mockUser.email
    });

    console.log('✅ 登录成功，生成令牌:', {
      userId: mockUser._id,
      username: mockUser.username
    });

    res.json({
      success: true,
      message: '登录成功（无认证模式）',
      data: {
        user: {
          id: mockUser._id,
          username: mockUser.username,
          email: mockUser.email,
          profile: mockUser.profile,
          isEmailVerified: mockUser.verification.email.isVerified,
          isPhoneVerified: mockUser.verification.phone.isVerified,
          isVIP: mockUser.isVIP,
          divination: {
            freeCount: mockUser.todayFreeCount,
            paidCount: mockUser.divination.paidCount
          },
          lastLoginAt: mockUser.security.lastLoginAt
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
