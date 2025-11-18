/**
 * 梅花心易 - 用户数据模型
 * 用户信息、认证和权限管理
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('../config');

/**
 * 用户Schema定义
 */
const userSchema = new mongoose.Schema({
  // 基本信息
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    trim: true,
    minlength: [3, '用户名至少3个字符'],
    maxlength: [20, '用户名最多20个字符'],
    match: [/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文']
  },
  
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '邮箱格式不正确']
  },

  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true // 可选字段

        // 清理输入：移除空格、横线、括号等分隔符
        const cleaned = v.replace(/[\s\-\(\)\+]/g, '')

        // 验证格式：11位数字且以1开头
        return /^1[0-9]\d{9}$/.test(cleaned)
      },
      message: '请输入有效的11位手机号，如：138****8000'
    },
    // 保存前清理数据
    set: function(v) {
      return v ? v.replace(/[\s\-\(\)\+]/g, '') : v
    }
  },

  // 认证信息
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false // 默认查询时不返回密码
  },

  // 个人资料
  profile: {
    nickname: {
      type: String,
      trim: true,
      maxlength: [30, '昵称最多30个字符'],
      default: function() {
        return this.username;
      }
    },
    avatar: {
      type: String,
      default: ''
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', ''],
      default: ''
    },
    birthday: {
      type: Date
    },
    location: {
      province: String,
      city: String,
      district: String
    },
    bio: {
      type: String,
      maxlength: [200, '个人简介最多200个字符'],
      default: ''
    }
  },

  // 生辰八字信息 (v2.0扩展)
  birthInfo: {
    year: {
      type: Number,
      min: 1900,
      max: 2100,
      validate: {
        validator: function(v) {
          return v >= 1900 && v <= new Date().getFullYear();
        },
        message: '出生年份必须在1900年到当前年份之间'
      }
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      validate: {
        validator: function(v) {
          return v >= 1 && v <= 12;
        },
        message: '出生月份必须在1-12之间'
      }
    },
    day: {
      type: Number,
      min: 1,
      max: 31,
      validate: {
        validator: function(v) {
          return v >= 1 && v <= 31;
        },
        message: '出生日期必须在1-31之间'
      }
    },
    hour: {
      type: Number,
      min: 0,
      max: 23,
      validate: {
        validator: function(v) {
          return v >= 0 && v <= 23;
        },
        message: '出生时辰必须在0-23之间'
      }
    },
    minute: {
      type: Number,
      min: 0,
      max: 59,
      default: 0
    },
    timezone: {
      type: String,
      default: 'Asia/Shanghai',
      enum: ['Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Taipei', 'UTC']
    },
    lunar: {
      year: Number,
      month: Number,
      day: Number,
      isLeap: {
        type: Boolean,
        default: false
      },
      hour: Number
    },
    location: {
      country: {
        type: String,
        default: 'CN'
      },
      province: String,
      city: String,
      coordinates: {
        longitude: Number,
        latitude: Number
      }
    },
    isComplete: {
      type: Boolean,
      default: false
    }
  },

  // 账户状态
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'deleted'],
    default: 'active'
  },

  // 验证状态
  verification: {
    email: {
      isVerified: {
        type: Boolean,
        default: false
      },
      token: String,
      expiresAt: Date
    },
    phone: {
      isVerified: {
        type: Boolean,
        default: false
      },
      code: String,
      expiresAt: Date
    }
  },

  // 会员订阅信息 (v2.0升级)
  subscription: {
    type: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    expiresAt: {
      type: Date,
      default: null
    },
    features: [{
      name: {
        type: String,
        enum: ['unlimited_divination', 'ai_consultant', 'expert_consultation', 'priority_support']
      },
      enabled: {
        type: Boolean,
        default: false
      },
      expiresAt: Date
    }],
    autoRenew: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['wechat', 'alipay', 'card'],
      default: null
    }
  },

  // 使用统计 (v2.0新增)
  usage: {
    divinationCount: {
      type: Number,
      default: 0,
      min: 0
    },
    consultationCount: {
      type: Number,
      default: 0,
      min: 0
    },
    freeCountToday: {
      type: Number,
      default: 10,
      min: 0,
      max: 10
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    },
    totalLoginDays: {
      type: Number,
      default: 0,
      min: 0
    },
    consecutiveLoginDays: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // 占卜统计信息
  divination: {
    totalCount: {
      type: Number,
      default: 0,
      min: 0
    },
    paidCount: {
      type: Number,
      default: 0,
      min: 0
    },
    freeCount: {
      type: Number,
      default: 10,
      min: 0,
      max: 10
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },

  // 安全信息
  security: {
    lastLoginAt: Date,
    lastLoginIP: String,
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    passwordChangedAt: {
      type: Date,
      default: Date.now
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    twoFactorSecret: String
  },

  // 偏好设置 (v2.0扩展)
  preferences: {
    language: {
      type: String,
      enum: ['zh-CN', 'zh-TW', 'en'],
      default: 'zh-CN'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      },
      divinationReminder: {
        type: Boolean,
        default: true
      },
      weeklyReport: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showDivinationHistory: {
        type: Boolean,
        default: false
      },
      allowDataAnalysis: {
        type: Boolean,
        default: true
      },
      shareWithCommunity: {
        type: Boolean,
        default: false
      }
    },
    divination: {
      preferredMethod: {
        type: String,
        enum: ['time', 'number', 'manual'],
        default: 'time'
      },
      autoSave: {
        type: Boolean,
        default: true
      },
      detailedAnalysis: {
        type: Boolean,
        default: true
      },
      aiInterpretation: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true, // 自动添加createdAt和updatedAt
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.security.twoFactorSecret;
      delete ret.verification;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

/**
 * 虚拟字段
 */

// 是否为VIP用户
userSchema.virtual('isVIP').get(function() {
  return this.membership && (this.membership.type === 'vip' || this.membership.type === 'premium');
});

// 账户是否被锁定
userSchema.virtual('isLocked').get(function() {
  return !!(this.security.lockUntil && this.security.lockUntil > Date.now());
});

// 今日剩余免费次数
userSchema.virtual('todayFreeCount').get(function() {
  const today = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  // 如果不是同一天，重置免费次数
  if (today.toDateString() !== lastReset.toDateString()) {
    return 10; // 默认每日免费次数
  }
  
  return this.usage.freeCountToday;
});

/**
 * 索引配置 (v2.0优化)
 */
// 基础唯一索引
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ phone: 1 }, { sparse: true });

// 查询优化索引
userSchema.index({ createdAt: -1 });
userSchema.index({ status: 1 });
userSchema.index({ 'security.lastLoginAt': -1 });

// v2.0新增索引
userSchema.index({ 'subscription.type': 1, 'subscription.expiresAt': 1 });
userSchema.index({ 'usage.lastActiveAt': -1 });
userSchema.index({ 'birthInfo.isComplete': 1 });
userSchema.index({ 'preferences.language': 1 });

// 复合索引
userSchema.index({
  'subscription.type': 1,
  'usage.lastActiveAt': -1
}, {
  name: 'subscription_activity_idx'
});

userSchema.index({
  status: 1,
  'verification.email.isVerified': 1
}, {
  name: 'status_verification_idx'
});

/**
 * 中间件
 */

// 保存前密码加密
userSchema.pre('save', async function(next) {
  // 只有密码被修改时才加密
  if (!this.isModified('password')) return next();

  try {
    // 加密密码
    const salt = await bcrypt.genSalt(config.auth.bcrypt.saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    
    // 更新密码修改时间
    this.security.passwordChangedAt = new Date();
    
    next();
  } catch (error) {
    next(error);
  }
});

// 保存前验证邮箱唯一性
userSchema.pre('save', async function(next) {
  if (!this.isModified('email')) return next();

  try {
    const existingUser = await this.constructor.findOne({ 
      email: this.email,
      _id: { $ne: this._id }
    });

    if (existingUser) {
      const error = new Error('邮箱已被注册');
      error.code = 'EMAIL_EXISTS';
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

/**
 * 实例方法
 */

// 验证密码
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 生成邮箱验证令牌
userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verification.email.token = crypto.createHash('sha256').update(token).digest('hex');
  this.verification.email.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时
  return token;
};

// 验证邮箱令牌
userSchema.methods.verifyEmailToken = function(token) {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return this.verification.email.token === hashedToken && 
         this.verification.email.expiresAt > Date.now();
};

// 重置每日免费次数
userSchema.methods.resetDailyFreeCount = function() {
  const today = new Date();
  const lastReset = new Date(this.usage.lastResetDate);
  
  if (today.toDateString() !== lastReset.toDateString()) {
    this.usage.freeCountToday = 10;
    this.usage.lastResetDate = today;
    return true;
  }
  
  return false;
};

// 消费占卜次数
userSchema.methods.consumeDivinationCount = function() {
  // 先尝试重置每日免费次数
  this.resetDailyFreeCount();
  
  if (this.usage.freeCountToday > 0) {
    this.usage.freeCountToday--;
    this.divination.totalCount++;
    return { type: 'free', success: true };
  } else if (this.divination.paidCount > 0) {
    this.divination.paidCount--;
    this.divination.totalCount++;
    return { type: 'paid', success: true };
  }
  
  return { type: 'none', success: false };
};

/**
 * 静态方法
 */

// 根据邮箱或用户名查找用户
userSchema.statics.findByEmailOrUsername = function(identifier) {
  return this.findOne({
    $or: [
      { email: identifier },
      { username: identifier }
    ]
  }).select('+password');
};

// 创建用户
userSchema.statics.createUser = async function(userData) {
  const user = new this(userData);
  await user.save();
  return user;
};

module.exports = mongoose.model('User', userSchema);
