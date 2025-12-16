/**
 * 梅花心易 - 占卜记录数据模型 v2.0
 * 完整的卦象信息、五行分析、AI解读
 */

const mongoose = require('mongoose');

/**
 * 八卦子Schema
 */
const baguaSchema = new mongoose.Schema({
  number: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true,
    enum: ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷']
  },
  element: {
    type: String,
    required: true,
    enum: ['金', '木', '水', '火', '土']
  },
  nature: {
    type: String,
    required: true,
    enum: ['天', '泽', '火', '雷', '风', '水', '山', '地']
  },
  direction: {
    type: String,
    enum: ['西北', '西', '南', '东', '东南', '北', '东北', '西南']
  },
  attributes: {
    family: String,
    body: String,
    animal: String,
    color: String,
    season: String
  }
}, { _id: false });

/**
 * 六十四卦子Schema
 */
const hexagramSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    min: 1,
    max: 64
  },
  name: {
    type: String,
    required: true,
    maxlength: 10
  },
  upperGua: {
    type: baguaSchema,
    required: true
  },
  lowerGua: {
    type: baguaSchema,
    required: true
  },
  lines: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 6 && v.every(line => line === 0 || line === 1);
      },
      message: '卦爻必须是6个0或1的数组'
    }
  },
  traditional: {
    judgment: {
      type: String,
      maxlength: 500
    },
    image: {
      type: String,
      maxlength: 500
    },
    meaning: {
      type: String,
      maxlength: 1000
    }
  }
}, { _id: false });

/**
 * 五行关系子Schema
 */
const wuxingRelationshipSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['generation', 'destruction', 'same', 'neutral']
  },
  strength: {
    type: String,
    required: true,
    enum: ['strong', 'neutral', 'weak']
  },
  meaning: {
    type: String,
    required: true,
    enum: ['生', '克', '同', '平']
  },
  description: {
    type: String,
    maxlength: 100
  }
}, { _id: false });

/**
 * 五行分析子Schema
 */
const wuxingAnalysisSchema = new mongoose.Schema({
  ben: {
    type: String,
    required: true,
    enum: ['金', '木', '水', '火', '土']
  },
  hu: {
    type: String,
    required: true,
    enum: ['金', '木', '水', '火', '土']
  },
  bian: {
    type: String,
    required: true,
    enum: ['金', '木', '水', '火', '土']
  },
  relationships: {
    benToHu: {
      type: wuxingRelationshipSchema,
      required: true
    },
    benToBian: {
      type: wuxingRelationshipSchema,
      required: true
    },
    huToBian: {
      type: wuxingRelationshipSchema,
      required: true
    }
  },
  fortune: {
    type: String,
    required: true,
    enum: ['大吉', '中吉', '小吉', '平', '小凶', '中凶', '大凶']
  },
  timing: {
    type: String,
    maxlength: 200
  },
  favorableElements: [{
    type: String,
    enum: ['金', '木', '水', '火', '土']
  }],
  unfavorableElements: [{
    type: String,
    enum: ['金', '木', '水', '火', '土']
  }]
}, { _id: false });

/**
 * AI解读子Schema
 */
const interpretationSchema = new mongoose.Schema({
  summary: {
    type: String,
    required: true,
    maxlength: 500
  },
  detailed: {
    type: String,
    required: true,
    maxlength: 2000
  },
  advice: {
    type: String,
    required: true,
    maxlength: 500
  },
  timing: {
    type: String,
    required: true,
    maxlength: 200
  },
  precautions: {
    type: String,
    maxlength: 300
  },
  aiGenerated: {
    type: Boolean,
    default: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.7
  },
  promptUsed: {
    type: String,
    enum: ['professional_interpretation', 'career_analysis', 'relationship_analysis', 'health_analysis', 'general_guidance']
  },
  model: {
    type: String,
    default: 'claude-3-5-sonnet'
  },
  tokensUsed: {
    type: Number,
    min: 0
  }
}, { _id: false });

/**
 * 占卜记录主Schema
 */
const divinationSchema = new mongoose.Schema({
  // 基本信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  question: {
    type: String,
    required: [true, '占卜问题不能为空'],
    trim: true,
    minlength: [5, '问题至少5个字符'],
    maxlength: [500, '问题最多500个字符']
  },
  method: {
    type: String,
    required: true,
    enum: ['time', 'number', 'manual'],
    default: 'time'
  },
  
  // 起卦参数
  params: {
    datetime: Date,
    numbers: [Number],
    manualGuas: [Number],
    location: {
      country: String,
      province: String,
      city: String,
      coordinates: {
        longitude: Number,
        latitude: Number
      }
    }
  },

  // 卦象信息
  hexagrams: {
    ben: {
      type: hexagramSchema,
      required: true
    },
    hu: {
      type: hexagramSchema,
      required: true
    },
    bian: {
      type: hexagramSchema,
      required: true
    }
  },

  // 动爻
  movingLine: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },

  // 五行分析
  analysis: {
    wuxing: {
      type: wuxingAnalysisSchema,
      required: true
    },
    compatibility: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    elements: {
      favorable: [{
        type: String,
        enum: ['金', '木', '水', '火', '土']
      }],
      unfavorable: [{
        type: String,
        enum: ['金', '木', '水', '火', '土']
      }],
      neutral: [{
        type: String,
        enum: ['金', '木', '水', '火', '土']
      }]
    }
  },

  // AI解读
  interpretation: {
    type: interpretationSchema,
    required: true
  },

  // 用户上下文
  userContext: {
    birthInfo: {
      year: Number,
      month: Number,
      day: Number,
      hour: Number,
      lunar: {
        year: Number,
        month: Number,
        day: Number,
        isLeap: Boolean
      }
    },
    previousDivinations: {
      type: Number,
      default: 0
    },
    questionCategory: {
      type: String,
      enum: ['career', 'relationship', 'health', 'finance', 'study', 'family', 'travel', 'general'],
      default: 'general'
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },

  // 元数据
  metadata: {
    ipAddress: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v);
        },
        message: 'IP地址格式不正确'
      }
    },
    userAgent: {
      type: String,
      maxlength: 500
    },
    location: {
      country: String,
      province: String,
      city: String,
      timezone: String
    },
    processingTime: {
      type: Number,
      min: 0,
      default: 0
    },
    algorithmVersion: {
      type: String,
      default: 'v2.0'
    },
    deviceInfo: {
      platform: String,
      browser: String,
      version: String
    }
  },

  // 状态和标签
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'archived'],
    default: 'completed',
    index: true
  },

  tags: [{
    type: String,
    maxlength: 20
  }],

  // 用户反馈
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: 500
    },
    helpful: {
      type: Boolean
    },
    accuracy: {
      type: Number,
      min: 1,
      max: 5
    },
    ratedAt: Date
  },

  // 分享和隐私
  privacy: {
    isPublic: {
      type: Boolean,
      default: false
    },
    allowShare: {
      type: Boolean,
      default: false
    },
    anonymize: {
      type: Boolean,
      default: true
    }
  },

  // 统计信息
  stats: {
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0
    },
    consultationCount: {
      type: Number,
      default: 0,
      min: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * 虚拟字段
 */

// 占卜结果摘要
divinationSchema.virtual('summary').get(function() {
  return {
    question: this.question,
    hexagram: this.hexagrams.ben.name,
    fortune: this.analysis.wuxing.fortune,
    timing: this.analysis.wuxing.timing,
    advice: this.interpretation.advice
  };
});

// 是否为今日占卜
divinationSchema.virtual('isToday').get(function() {
  const today = new Date();
  const divinationDate = new Date(this.createdAt);
  return today.toDateString() === divinationDate.toDateString();
});

/**
 * 索引配置 (v2.0优化)
 */
// 基础查询索引
divinationSchema.index({ userId: 1, createdAt: -1 });
divinationSchema.index({ 'hexagrams.ben.id': 1 });
divinationSchema.index({ 'analysis.wuxing.fortune': 1 });
divinationSchema.index({ 'userContext.questionCategory': 1 });
divinationSchema.index({ status: 1, createdAt: -1 });

// 复合索引
divinationSchema.index({
  userId: 1,
  'userContext.questionCategory': 1,
  createdAt: -1
}, {
  name: 'user_category_time_idx'
});

divinationSchema.index({
  'analysis.wuxing.fortune': 1,
  'feedback.rating': 1
}, {
  name: 'fortune_rating_idx'
});

// 文本搜索索引
divinationSchema.index({
  question: 'text',
  'interpretation.summary': 'text',
  'interpretation.advice': 'text'
}, {
  name: 'content_search_idx',
  weights: {
    question: 10,
    'interpretation.summary': 5,
    'interpretation.advice': 3
  }
});

/**
 * 静态方法
 */

// 根据用户ID获取占卜历史
divinationSchema.statics.findByUserId = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    startDate,
    endDate,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { userId };

  if (category) {
    query['userContext.questionCategory'] = category;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username profile.nickname profile.avatar');
};

// 获取用户占卜统计
divinationSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalCount: { $sum: 1 },
        categories: {
          $push: '$userContext.questionCategory'
        },
        averageRating: {
          $avg: '$feedback.rating'
        },
        fortuneDistribution: {
          $push: '$analysis.wuxing.fortune'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalCount: 1,
        averageRating: { $round: ['$averageRating', 2] },
        categoryStats: {
          $reduce: {
            input: '$categories',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[{
                    k: '$$this',
                    v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] }
                  }]]
                }
              ]
            }
          }
        },
        fortuneStats: {
          $reduce: {
            input: '$fortuneDistribution',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [[{
                    k: '$$this',
                    v: { $add: [{ $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] }, 1] }
                  }]]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

/**
 * 实例方法
 */

// 更新用户反馈
divinationSchema.methods.updateFeedback = function(feedbackData) {
  this.feedback = {
    ...this.feedback,
    ...feedbackData,
    ratedAt: new Date()
  };
  return this.save();
};

// 增加查看次数
divinationSchema.methods.incrementViewCount = function() {
  this.stats.viewCount += 1;
  return this.save();
};

// 检查是否可以分享
divinationSchema.methods.canShare = function() {
  return this.privacy.allowShare && this.status === 'completed';
};

module.exports = mongoose.model('Divination', divinationSchema);
