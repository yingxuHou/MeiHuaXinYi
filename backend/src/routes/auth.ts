import { Router, Request, Response } from 'express';
const { body, validationResult } = require('express-validator');
import { User } from '../models';
import { JWTUtils } from '../middleware/auth';
import { successResponse, ErrorResponses, BusinessErrors } from '../utils/response';

const router = Router();

// 用户注册
router.post('/register', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码至少需要6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
  body('nickname')
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage('昵称长度应在2-20个字符之间')
], async (req: Request, res: Response) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ErrorResponses.validationError(res, '注册信息验证失败', errors.array());
    }

    const { email, password, nickname } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return BusinessErrors.userAlreadyExists(res);
    }

    // 创建新用户
    const user = new User({
      email,
      password,
      nickname: nickname || email.split('@')[0], // 如果没有昵称，使用邮箱前缀
      freeCount: 10, // 新用户赠送10次免费占卜
      totalCount: 0
    });

    await user.save();

    // 生成Token
    const accessToken = JWTUtils.generateAccessToken(user);
    const refreshToken = JWTUtils.generateRefreshToken(user);

    // 返回用户信息和Token
    return successResponse(res, {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        freeCount: user.freeCount,
        totalCount: user.totalCount,
        createdAt: user.createdAt
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    }, 201);

  } catch (error) {
    console.error('用户注册错误:', error);
    return ErrorResponses.internalError(res, '注册失败');
  }
});

// 用户登录
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
], async (req: Request, res: Response) => {
  try {
    // 验证请求参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ErrorResponses.validationError(res, '登录信息验证失败', errors.array());
    }

    const { email, password, rememberMe } = req.body;

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return BusinessErrors.invalidCredentials(res);
    }

    // 检查用户是否激活
    if (!user.isActive) {
      return ErrorResponses.forbidden(res, '账户已被禁用，请联系客服');
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return BusinessErrors.invalidCredentials(res);
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成Token（如果选择记住登录，延长过期时间）
    const accessToken = JWTUtils.generateAccessToken(user);
    const refreshToken = JWTUtils.generateRefreshToken(user);

    // 返回用户信息和Token
    return successResponse(res, {
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        freeCount: user.freeCount,
        totalCount: user.totalCount,
        lastLoginAt: user.lastLoginAt
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('用户登录错误:', error);
    return ErrorResponses.internalError(res, '登录失败');
  }
});

// 刷新Token
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('刷新Token不能为空')
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return ErrorResponses.validationError(res, '刷新Token验证失败', errors.array());
    }

    const { refreshToken } = req.body;

    // 验证刷新Token
    let payload;
    try {
      payload = JWTUtils.verifyToken(refreshToken);
    } catch (error) {
      return BusinessErrors.tokenInvalid(res);
    }

    // 查找用户
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return BusinessErrors.userNotFound(res);
    }

    // 生成新的Token
    const newAccessToken = JWTUtils.generateAccessToken(user);
    const newRefreshToken = JWTUtils.generateRefreshToken(user);

    return successResponse(res, {
      tokens: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Token刷新错误:', error);
    return ErrorResponses.internalError(res, 'Token刷新失败');
  }
});

// 验证Token
router.get('/verify', async (req: Request, res: Response) => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return BusinessErrors.unauthorized(res, '缺少认证Token');
    }

    // 验证Token
    let payload;
    try {
      payload = JWTUtils.verifyToken(token);
    } catch (error) {
      return BusinessErrors.tokenInvalid(res);
    }

    // 查找用户
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return BusinessErrors.userNotFound(res);
    }

    return successResponse(res, {
      valid: true,
      user: {
        id: user._id,
        email: user.email,
        nickname: user.nickname,
        freeCount: user.freeCount,
        totalCount: user.totalCount
      }
    });

  } catch (error) {
    console.error('Token验证错误:', error);
    return ErrorResponses.internalError(res, 'Token验证失败');
  }
});

// 用户登出（可选实现Token黑名单）
router.post('/logout', async (req: Request, res: Response) => {
  try {
    // 这里可以实现Token黑名单逻辑
    // 目前简单返回成功响应
    return successResponse(res, {
      message: '登出成功'
    });

  } catch (error) {
    console.error('用户登出错误:', error);
    return ErrorResponses.internalError(res, '登出失败');
  }
});

export default router;
