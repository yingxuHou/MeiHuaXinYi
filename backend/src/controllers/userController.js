/**
 * 梅花心易 - 用户控制器
 * 处理用户信息管理相关操作
 */

const User = require('../models/User');
const JWTUtils = require('../utils/jwt');
const { validationResult } = require('express-validator');

/**
 * 获取当前用户信息
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    // 重置每日免费次数
    const wasReset = user.resetDailyFreeCount();
    if (wasReset) {
      await user.save();
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          profile: user.profile,
          birthInfo: user.birthInfo,
          status: user.status,
          isEmailVerified: user.verification.email.isVerified,
          isPhoneVerified: user.verification.phone.isVerified,
          isVIP: user.isVIP,
          membership: user.membership,
          divination: {
            freeCount: user.todayFreeCount,
            totalCount: user.divination.totalCount,
            paidCount: user.divination.paidCount
          },
          preferences: user.preferences,
          security: {
            lastLoginAt: user.security.lastLoginAt,
            lastLoginIP: user.security.lastLoginIP,
            twoFactorEnabled: user.security.twoFactorEnabled
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: '获取用户信息失败'
      }
    });
  }
};

/**
 * 更新用户基本信息
 */
const updateProfile = async (req, res) => {
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

    const user = req.user;
    const { profile, phone } = req.body;

    // 更新个人资料
    if (profile) {
      Object.keys(profile).forEach(key => {
        if (profile[key] !== undefined && user.profile[key] !== undefined) {
          user.profile[key] = profile[key];
        }
      });
    }

    // 更新手机号
    if (phone !== undefined) {
      // 检查手机号是否已被其他用户使用
      if (phone && phone !== user.phone) {
        const existingUser = await User.findOne({ 
          phone, 
          _id: { $ne: user._id } 
        });
        
        if (existingUser) {
          return res.status(409).json({
            success: false,
            error: {
              code: 'PHONE_EXISTS',
              message: '手机号已被其他用户使用'
            }
          });
        }
        
        // 重置手机验证状态
        user.verification.phone.isVerified = false;
      }
      
      user.phone = phone;
    }

    await user.save();

    res.json({
      success: true,
      message: '个人信息更新成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          profile: user.profile,
          isPhoneVerified: user.verification.phone.isVerified,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PROFILE_ERROR',
        message: '更新个人信息失败'
      }
    });
  }
};

/**
 * 更新生辰八字信息
 */
const updateBirthInfo = async (req, res) => {
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

    const user = req.user;
    const { birthInfo } = req.body;

    // 更新生辰八字信息
    if (birthInfo) {
      Object.keys(birthInfo).forEach(key => {
        if (birthInfo[key] !== undefined) {
          if (key === 'lunar' && typeof birthInfo[key] === 'object') {
            user.birthInfo.lunar = { ...user.birthInfo.lunar, ...birthInfo[key] };
          } else {
            user.birthInfo[key] = birthInfo[key];
          }
        }
      });
    }

    await user.save();

    res.json({
      success: true,
      message: '生辰八字信息更新成功',
      data: {
        birthInfo: user.birthInfo
      }
    });
  } catch (error) {
    console.error('更新生辰八字信息错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_BIRTH_INFO_ERROR',
        message: '更新生辰八字信息失败'
      }
    });
  }
};

/**
 * 更新用户偏好设置
 */
const updatePreferences = async (req, res) => {
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

    const user = req.user;
    const { preferences } = req.body;

    // 更新偏好设置
    if (preferences) {
      // 深度合并偏好设置
      const updateNestedObject = (target, source) => {
        Object.keys(source).forEach(key => {
          if (source[key] !== undefined) {
            if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
              if (!target[key]) target[key] = {};
              updateNestedObject(target[key], source[key]);
            } else {
              target[key] = source[key];
            }
          }
        });
      };

      updateNestedObject(user.preferences, preferences);
    }

    await user.save();

    res.json({
      success: true,
      message: '偏好设置更新成功',
      data: {
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('更新偏好设置错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_PREFERENCES_ERROR',
        message: '更新偏好设置失败'
      }
    });
  }
};

/**
 * 修改密码
 */
const changePassword = async (req, res) => {
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

    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // 验证当前密码
    const userWithPassword = await User.findById(user._id).select('+password');
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: '当前密码错误'
        }
      });
    }

    // 更新密码
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    // 撤销所有现有令牌（强制重新登录）
    await JWTUtils.revokeAllUserTokens(user._id);

    res.json({
      success: true,
      message: '密码修改成功，请重新登录'
    });
  } catch (error) {
    console.error('修改密码错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'CHANGE_PASSWORD_ERROR',
        message: '修改密码失败'
      }
    });
  }
};

/**
 * 获取用户统计信息
 */
const getUserStats = async (req, res) => {
  try {
    const user = req.user;

    // 这里可以添加更多统计信息的计算
    const stats = {
      totalDivinations: user.divination.totalCount,
      todayFreeCount: user.todayFreeCount,
      paidCount: user.divination.paidCount,
      membershipType: user.membership.type,
      isVIP: user.isVIP,
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // 天数
      lastLoginDays: user.security.lastLoginAt ? 
        Math.floor((Date.now() - user.security.lastLoginAt) / (1000 * 60 * 60 * 24)) : null
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_STATS_ERROR',
        message: '获取用户统计信息失败'
      }
    });
  }
};

/**
 * 删除用户账户
 */
const deleteAccount = async (req, res) => {
  try {
    const user = req.user;
    const { password, confirmText } = req.body;

    // 验证密码
    const userWithPassword = await User.findById(user._id).select('+password');
    const isPasswordValid = await userWithPassword.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: '密码错误'
        }
      });
    }

    // 验证确认文本
    if (confirmText !== '删除我的账户') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONFIRM_TEXT',
          message: '确认文本不正确'
        }
      });
    }

    // 软删除用户（标记为已删除状态）
    user.status = 'deleted';
    user.email = `deleted_${Date.now()}_${user.email}`;
    user.username = `deleted_${Date.now()}_${user.username}`;
    await user.save();

    // 撤销所有令牌
    await JWTUtils.revokeAllUserTokens(user._id);

    res.json({
      success: true,
      message: '账户已删除'
    });
  } catch (error) {
    console.error('删除账户错误:', error.message);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ACCOUNT_ERROR',
        message: '删除账户失败'
      }
    });
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  updateBirthInfo,
  updatePreferences,
  changePassword,
  getUserStats,
  deleteAccount
};
