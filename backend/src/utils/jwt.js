/**
 * 梅花心易 - JWT工具模块
 * JWT令牌生成、验证和管理
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const { redis } = require('../config/database');

/**
 * JWT工具类
 */
class JWTUtils {
  /**
   * 生成访问令牌
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      },
      config.auth.jwt.secret,
      {
        expiresIn: config.auth.jwt.expiresIn,
        issuer: config.auth.jwt.issuer,
        audience: config.auth.jwt.audience
      }
    );
  }

  /**
   * 生成刷新令牌
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000)
      },
      config.auth.jwt.secret,
      {
        expiresIn: config.auth.jwt.refreshExpiresIn,
        issuer: config.auth.jwt.issuer,
        audience: config.auth.jwt.audience
      }
    );
  }

  /**
   * 生成令牌对
   */
  static generateTokenPair(payload) {
    const tokenId = crypto.randomUUID();
    const tokenPayload = {
      ...payload,
      jti: tokenId // JWT ID
    };

    return {
      accessToken: this.generateAccessToken(tokenPayload),
      refreshToken: this.generateRefreshToken(tokenPayload),
      tokenId,
      expiresIn: config.auth.jwt.expiresIn
    };
  }

  /**
   * 验证令牌
   */
  static verifyToken(token, options = {}) {
    try {
      const decoded = jwt.verify(token, config.auth.jwt.secret, {
        issuer: config.auth.jwt.issuer,
        audience: config.auth.jwt.audience,
        ...options
      });

      return {
        success: true,
        payload: decoded
      };
    } catch (error) {
      return {
        success: false,
        error: this.getTokenError(error)
      };
    }
  }

  /**
   * 解析令牌（不验证签名）
   */
  static decodeToken(token) {
    try {
      return jwt.decode(token, { complete: true });
    } catch (error) {
      return null;
    }
  }

  /**
   * 获取令牌错误信息
   */
  static getTokenError(error) {
    switch (error.name) {
      case 'TokenExpiredError':
        return {
          code: 'TOKEN_EXPIRED',
          message: '令牌已过期'
        };
      case 'JsonWebTokenError':
        return {
          code: 'TOKEN_INVALID',
          message: '令牌无效'
        };
      case 'NotBeforeError':
        return {
          code: 'TOKEN_NOT_ACTIVE',
          message: '令牌尚未生效'
        };
      default:
        return {
          code: 'TOKEN_ERROR',
          message: '令牌验证失败'
        };
    }
  }

  /**
   * 将令牌加入黑名单
   */
  static async blacklistToken(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload) {
        return false;
      }

      const { jti, exp } = decoded.payload;
      if (!jti) {
        return false;
      }

      // 检查Redis是否可用
      if (!redis.isConnected) {
        console.warn('Redis不可用，跳过令牌黑名单操作');
        return true; // 返回true避免阻塞登出流程
      }

      const redisClient = redis.getClient();
      const ttl = exp - Math.floor(Date.now() / 1000);

      if (ttl > 0) {
        await redisClient.setex(`blacklist:${jti}`, ttl, '1');
      }

      return true;
    } catch (error) {
      console.error('令牌黑名单添加失败:', error.message);
      return false;
    }
  }

  /**
   * 检查令牌是否在黑名单中
   */
  static async isTokenBlacklisted(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.payload || !decoded.payload.jti) {
        return false;
      }

      // 检查Redis是否可用
      if (!redis.isConnected) {
        return false; // Redis不可用时假设令牌未被列入黑名单
      }

      const redisClient = redis.getClient();
      const result = await redisClient.get(`blacklist:${decoded.payload.jti}`);
      return result === '1';
    } catch (error) {
      console.error('令牌黑名单检查失败:', error.message);
      return false;
    }
  }

  /**
   * 刷新访问令牌
   */
  static async refreshAccessToken(refreshToken) {
    try {
      // 验证刷新令牌
      const verifyResult = this.verifyToken(refreshToken);
      if (!verifyResult.success) {
        return {
          success: false,
          error: verifyResult.error
        };
      }

      const { payload } = verifyResult;

      // 检查令牌类型
      if (payload.type !== 'refresh') {
        return {
          success: false,
          error: {
            code: 'INVALID_TOKEN_TYPE',
            message: '令牌类型错误'
          }
        };
      }

      // 检查是否在黑名单中
      if (await this.isTokenBlacklisted(refreshToken)) {
        return {
          success: false,
          error: {
            code: 'TOKEN_BLACKLISTED',
            message: '令牌已失效'
          }
        };
      }

      // 生成新的访问令牌
      const newTokenPair = this.generateTokenPair({
        userId: payload.userId,
        username: payload.username,
        email: payload.email
      });

      // 将旧的刷新令牌加入黑名单
      await this.blacklistToken(refreshToken);

      return {
        success: true,
        tokens: newTokenPair
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'REFRESH_TOKEN_ERROR',
          message: '令牌刷新失败'
        }
      };
    }
  }

  /**
   * 撤销用户所有令牌
   */
  static async revokeAllUserTokens(userId) {
    try {
      // 检查Redis是否可用
      if (!redis.isConnected) {
        console.warn('Redis不可用，跳过用户令牌撤销操作');
        return true; // 返回true避免阻塞流程
      }

      const redisClient = redis.getClient();

      // 在Redis中标记用户令牌失效时间
      const revokeTime = Math.floor(Date.now() / 1000);
      await redisClient.set(`user_token_revoke:${userId}`, revokeTime);

      return true;
    } catch (error) {
      console.error('撤销用户令牌失败:', error.message);
      return false;
    }
  }

  /**
   * 检查用户令牌是否被撤销
   */
  static async isUserTokenRevoked(userId, tokenIssuedAt) {
    try {
      // 检查Redis是否可用
      if (!redis.isConnected) {
        return false; // Redis不可用时假设令牌未被撤销
      }

      const redisClient = redis.getClient();
      const revokeTime = await redisClient.get(`user_token_revoke:${userId}`);

      if (!revokeTime) {
        return false;
      }

      return parseInt(revokeTime) > tokenIssuedAt;
    } catch (error) {
      console.error('检查用户令牌撤销状态失败:', error.message);
      return false;
    }
  }

  /**
   * 生成API密钥
   */
  static generateApiKey(prefix = 'mhy') {
    const randomBytes = crypto.randomBytes(32);
    const timestamp = Date.now().toString(36);
    const hash = crypto.createHash('sha256')
      .update(randomBytes)
      .update(timestamp)
      .digest('hex');
    
    return `${prefix}_${timestamp}_${hash.substring(0, 32)}`;
  }

  /**
   * 验证API密钥格式
   */
  static validateApiKeyFormat(apiKey) {
    const pattern = /^mhy_[a-z0-9]+_[a-f0-9]{32}$/;
    return pattern.test(apiKey);
  }
}

module.exports = JWTUtils;
