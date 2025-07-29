import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');
import { User, IUser } from '../models';
import { BusinessErrors } from '../utils/response';

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      userId?: string;
    }
  }
}

// JWT Token载荷接口
export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// JWT工具类
export class JWTUtils {
  private static readonly SECRET = process.env.JWT_SECRET || 'meihua-xinyi-default-secret';
  private static readonly EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
  private static readonly REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  // 生成访问Token
  static generateAccessToken(user: IUser): string {
    const payload = {
      userId: String(user._id),
      email: user.email
    };

    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.EXPIRES_IN,
      issuer: 'meihua-xinyi',
      audience: 'meihua-xinyi-users'
    });
  }

  // 生成刷新Token
  static generateRefreshToken(user: IUser): string {
    const payload = {
      userId: String(user._id),
      email: user.email,
      type: 'refresh'
    };

    return jwt.sign(payload, this.SECRET, {
      expiresIn: this.REFRESH_EXPIRES_IN,
      issuer: 'meihua-xinyi',
      audience: 'meihua-xinyi-users'
    });
  }

  // 验证Token
  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.SECRET, {
        issuer: 'meihua-xinyi',
        audience: 'meihua-xinyi-users'
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('TOKEN_INVALID');
      } else {
        throw new Error('TOKEN_VERIFICATION_FAILED');
      }
    }
  }

  // 从请求头中提取Token
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}

// 认证中间件
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从请求头中提取Token
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return BusinessErrors.unauthorized(res, '缺少认证Token');
    }

    // 验证Token
    let payload: JWTPayload;
    try {
      payload = JWTUtils.verifyToken(token);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'TOKEN_EXPIRED') {
          return BusinessErrors.tokenExpired(res);
        } else if (error.message === 'TOKEN_INVALID') {
          return BusinessErrors.tokenInvalid(res);
        }
      }
      return BusinessErrors.unauthorized(res, 'Token验证失败');
    }

    // 查找用户
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      return BusinessErrors.userNotFound(res);
    }

    // 将用户信息添加到请求对象
    req.user = user;
    req.userId = String(user._id);

    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return BusinessErrors.unauthorized(res, '认证失败');
  }
};

// 可选认证中间件（不强制要求登录）
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      try {
        const payload = JWTUtils.verifyToken(token);
        const user = await User.findById(payload.userId);
        
        if (user && user.isActive) {
          req.user = user;
          req.userId = String(user._id);
        }
      } catch (error) {
        // 可选认证失败时不返回错误，继续执行
        console.warn('可选认证失败:', error);
      }
    }

    next();
  } catch (error) {
    console.error('可选认证中间件错误:', error);
    next(); // 继续执行，不阻断请求
  }
};

// 权限检查中间件
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    // 这里可以根据需要实现更复杂的权限检查逻辑
    // 目前简单检查用户是否激活
    if (!req.user.isActive) {
      return BusinessErrors.forbidden(res, '账户已被禁用');
    }

    next();
  };
};

// 检查用户是否有足够的占卜次数
export const checkDivinationBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return BusinessErrors.unauthorized(res);
    }

    // 检查免费次数
    if (req.user.freeCount > 0) {
      return next();
    }

    // 这里可以添加检查付费次数的逻辑
    // 暂时简单检查免费次数
    return BusinessErrors.insufficientBalance(res);

  } catch (error) {
    console.error('占卜次数检查错误:', error);
    return BusinessErrors.internalError(res, '次数检查失败');
  }
};
