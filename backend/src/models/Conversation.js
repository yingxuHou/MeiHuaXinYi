/**
 * 梅花心易 - 对话记录数据模型 v2.0
 * AI占卜顾问问答功能支持
 */

const mongoose = require('mongoose');

/**
 * 消息子Schema
 */
const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    default: () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  metadata: {
    messageType: {
      type: String,
      enum: ['question', 'answer', 'clarification', 'follow_up', 'system_info'],
      default: 'question'
    },
    questionCategory: {
      type: String,
      enum: ['clarification', 'interpretation', 'timing', 'advice', 'general']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    reasoning: {
      type: String,
      maxlength: 1000
    },
    responseTime: {
      type: Number,
      min: 0
    },
    tokensUsed: {
      type: Number,
      min: 0
    },
    promptTemplate: {
      type: String,
      enum: ['consultant_clarification', 'consultant_interpretation', 'consultant_advice', 'consultant_timing']
    },
    model: {
      type: String,
      default: 'claude-3-5-sonnet'
    }
  },
  // AI回答特有字段
  relatedKnowledge: [{
    source: {
      type: String,
      enum: ['颜秉田梅花心易理论', '六十四卦详解', '五行生克理论', '实际应用案例']
    },
    section: String,
    relevance: {
      type: Number,
      min: 0,
      max: 1
    },
    content: {
      type: String,
      maxlength: 500
    }
  }],
  followUpSuggestions: [{
    type: String,
    maxlength: 200
  }],
  // 编辑和状态
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    default: 'sent'
  }
}, { _id: false });

/**
 * 对话记录主Schema
 */
const conversationSchema = new mongoose.Schema({
  // 基本关联信息
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  divinationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Divination',
    required: true,
    index: true
  },
  
  // 对话基本信息
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: function() {
      return `关于占卜的咨询 - ${new Date().toLocaleDateString()}`;
    }
  },
  
  // 消息列表
  messages: {
    type: [messageSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: '对话必须包含至少一条消息'
    }
  },

  // 对话上下文
  context: {
    hexagramAnalysis: {
      benGua: {
        id: Number,
        name: String,
        element: String
      },
      huGua: {
        id: Number,
        name: String,
        element: String
      },
      bianGua: {
        id: Number,
        name: String,
        element: String
      },
      wuxingRelation: String,
      fortune: String
    },
    userProfile: {
      birthInfo: {
        year: Number,
        month: Number,
        day: Number,
        hour: Number
      },
      preferences: {
        language: String,
        detailedAnalysis: Boolean
      }
    },
    conversationSummary: {
      type: String,
      maxlength: 500
    },
    mainTopics: [{
      type: String,
      maxlength: 50
    }],
    keyInsights: [{
      type: String,
      maxlength: 200
    }]
  },

  // 对话状态和分类
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  },
  
  category: {
    type: String,
    enum: ['interpretation', 'clarification', 'advice', 'timing', 'general'],
    default: 'general'
  },

  tags: [{
    type: String,
    maxlength: 20,
    validate: {
      validator: function(v) {
        return /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(v);
      },
      message: '标签只能包含中文、英文、数字和下划线'
    }
  }],

  // 用户评价
  rating: {
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      maxlength: 500
    },
    aspects: {
      helpfulness: {
        type: Number,
        min: 1,
        max: 5
      },
      accuracy: {
        type: Number,
        min: 1,
        max: 5
      },
      clarity: {
        type: Number,
        min: 1,
        max: 5
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    ratedAt: Date
  },

  // 统计信息
  stats: {
    messageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    userMessageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    assistantMessageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    averageResponseTime: {
      type: Number,
      min: 0
    },
    totalTokensUsed: {
      type: Number,
      default: 0,
      min: 0
    },
    sessionDuration: {
      type: Number,
      min: 0
    }
  },

  // 隐私和分享设置
  privacy: {
    isPrivate: {
      type: Boolean,
      default: true
    },
    allowAnalytics: {
      type: Boolean,
      default: true
    },
    shareWithCommunity: {
      type: Boolean,
      default: false
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

// 最后一条消息
conversationSchema.virtual('lastMessage').get(function() {
  return this.messages && this.messages.length > 0 
    ? this.messages[this.messages.length - 1] 
    : null;
});

// 对话持续时间
conversationSchema.virtual('duration').get(function() {
  if (!this.messages || this.messages.length < 2) return 0;
  
  const firstMessage = this.messages[0];
  const lastMessage = this.messages[this.messages.length - 1];
  
  return lastMessage.timestamp - firstMessage.timestamp;
});

// 是否为今日对话
conversationSchema.virtual('isToday').get(function() {
  const today = new Date();
  const conversationDate = new Date(this.createdAt);
  return today.toDateString() === conversationDate.toDateString();
});

/**
 * 索引配置
 */
// 基础查询索引
conversationSchema.index({ userId: 1, divinationId: 1 });
conversationSchema.index({ status: 1, updatedAt: -1 });
conversationSchema.index({ tags: 1 });
conversationSchema.index({ category: 1, createdAt: -1 });

// 复合索引
conversationSchema.index({ 
  userId: 1, 
  status: 1, 
  updatedAt: -1 
}, { 
  name: 'user_status_time_idx' 
});

conversationSchema.index({ 
  'rating.userRating': 1, 
  'stats.messageCount': 1 
}, { 
  name: 'rating_activity_idx' 
});

// 文本搜索索引
conversationSchema.index({ 
  title: 'text',
  'messages.content': 'text',
  'context.conversationSummary': 'text'
}, {
  name: 'conversation_search_idx',
  weights: {
    title: 10,
    'messages.content': 5,
    'context.conversationSummary': 3
  }
});

/**
 * 中间件
 */

// 保存前更新统计信息
conversationSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.stats.messageCount = this.messages.length;
    this.stats.userMessageCount = this.messages.filter(msg => msg.role === 'user').length;
    this.stats.assistantMessageCount = this.messages.filter(msg => msg.role === 'assistant').length;

    // 计算平均响应时间
    const responseTimes = this.messages
      .filter(msg => msg.metadata && msg.metadata.responseTime)
      .map(msg => msg.metadata.responseTime);

    if (responseTimes.length > 0) {
      this.stats.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    }

    // 计算总token使用量
    this.stats.totalTokensUsed = this.messages
      .filter(msg => msg.metadata && msg.metadata.tokensUsed)
      .reduce((total, msg) => total + msg.metadata.tokensUsed, 0);
  }

  next();
});

/**
 * 静态方法
 */

// 根据用户ID获取对话历史
conversationSchema.statics.findByUserId = function(userId, options = {}) {
  const {
    page = 1,
    limit = 10,
    status = 'active',
    category,
    startDate,
    endDate,
    sortBy = 'updatedAt',
    sortOrder = -1
  } = options;

  const query = { userId, status };

  if (category) {
    query.category = category;
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
    .populate('userId', 'username profile.nickname profile.avatar')
    .populate('divinationId', 'question hexagrams.ben.name analysis.wuxing.fortune');
};

// 根据占卜ID获取对话
conversationSchema.statics.findByDivinationId = function(divinationId, userId = null) {
  const query = { divinationId, status: 'active' };
  if (userId) {
    query.userId = userId;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('userId', 'username profile.nickname profile.avatar');
};

// 获取用户对话统计
conversationSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), status: 'active' } },
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        totalMessages: { $sum: '$stats.messageCount' },
        averageRating: { $avg: '$rating.userRating' },
        categories: { $push: '$category' },
        totalTokensUsed: { $sum: '$stats.totalTokensUsed' },
        averageSessionDuration: { $avg: '$stats.sessionDuration' }
      }
    },
    {
      $project: {
        _id: 0,
        totalConversations: 1,
        totalMessages: 1,
        averageRating: { $round: ['$averageRating', 2] },
        totalTokensUsed: 1,
        averageSessionDuration: { $round: ['$averageSessionDuration', 2] },
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
        }
      }
    }
  ]);
};

// 搜索对话
conversationSchema.statics.searchConversations = function(userId, searchQuery, options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    minRating
  } = options;

  const query = {
    userId,
    status: 'active',
    $text: { $search: searchQuery }
  };

  if (category) {
    query.category = category;
  }

  if (minRating) {
    query['rating.userRating'] = { $gte: minRating };
  }

  const skip = (page - 1) * limit;

  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('divinationId', 'question hexagrams.ben.name');
};

/**
 * 实例方法
 */

// 添加消息
conversationSchema.methods.addMessage = function(messageData) {
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    ...messageData
  };

  this.messages.push(message);
  this.updatedAt = new Date();

  return this.save();
};

// 更新用户评价
conversationSchema.methods.updateRating = function(ratingData) {
  this.rating = {
    ...this.rating,
    ...ratingData,
    ratedAt: new Date()
  };

  return this.save();
};

// 归档对话
conversationSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// 删除对话
conversationSchema.methods.softDelete = function() {
  this.status = 'deleted';
  return this.save();
};

// 生成对话摘要
conversationSchema.methods.generateSummary = function() {
  const userMessages = this.messages.filter(msg => msg.role === 'user');
  const assistantMessages = this.messages.filter(msg => msg.role === 'assistant');

  const mainQuestions = userMessages.slice(0, 3).map(msg => msg.content);
  const keyAdvice = assistantMessages
    .filter(msg => msg.content.length > 100)
    .slice(0, 2)
    .map(msg => msg.content.substring(0, 100) + '...');

  this.context.conversationSummary = `主要问题：${mainQuestions.join('；')}。关键建议：${keyAdvice.join('；')}`;

  return this.save();
};

// 检查是否可以继续对话
conversationSchema.methods.canContinue = function() {
  return this.status === 'active' && this.messages.length < 50; // 限制最大消息数
};

// 获取最近的用户问题
conversationSchema.methods.getRecentUserQuestions = function(count = 3) {
  return this.messages
    .filter(msg => msg.role === 'user')
    .slice(-count)
    .map(msg => msg.content);
};

module.exports = mongoose.model('Conversation', conversationSchema);
