/**
 * 梅花心易 - 知识库数据模型 v2.0
 * RAG向量检索和颜秉田理论知识库支持
 */

const mongoose = require('mongoose');

/**
 * 知识来源子Schema
 */
const sourceSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['book', 'article', 'manual', 'case_study', 'expert_annotation']
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  author: {
    type: String,
    maxlength: 100
  },
  publisher: {
    type: String,
    maxlength: 100
  },
  publishDate: Date,
  isbn: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/.test(v);
      },
      message: 'ISBN格式不正确'
    }
  },
  chapter: {
    type: String,
    maxlength: 100
  },
  section: {
    type: String,
    maxlength: 100
  },
  page: {
    type: Number,
    min: 1
  },
  url: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'URL格式不正确'
    }
  },
  version: {
    type: String,
    maxlength: 20
  }
}, { _id: false });

/**
 * 向量嵌入子Schema
 */
const embeddingSchema = new mongoose.Schema({
  vector: {
    type: [Number],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 1536; // OpenAI text-embedding-ada-002 维度
      },
      message: '向量维度必须为1536'
    }
  },
  model: {
    type: String,
    required: true,
    enum: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
    default: 'text-embedding-ada-002'
  },
  version: {
    type: String,
    default: 'v2'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

/**
 * 使用统计子Schema
 */
const usageSchema = new mongoose.Schema({
  retrievalCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastRetrieved: Date,
  averageRelevance: {
    type: Number,
    min: 0,
    max: 1,
    default: 0
  },
  userFeedback: {
    helpful: {
      type: Number,
      default: 0,
      min: 0
    },
    notHelpful: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5
  }
}, { _id: false });

/**
 * 知识库主Schema
 */
const knowledgeBaseSchema = new mongoose.Schema({
  // 基本信息
  title: {
    type: String,
    required: [true, '知识条目标题不能为空'],
    trim: true,
    maxlength: [200, '标题最多200个字符'],
    index: true
  },
  
  content: {
    type: String,
    required: [true, '知识内容不能为空'],
    trim: true,
    minlength: [10, '内容至少10个字符'],
    maxlength: [5000, '内容最多5000个字符']
  },

  summary: {
    type: String,
    maxlength: 500,
    trim: true
  },

  // 分类信息
  category: {
    type: String,
    required: true,
    enum: [
      'theory',           // 理论基础
      'hexagram',         // 卦象解释
      'wuxing',          // 五行分析
      'application',      // 实际应用
      'timing',          // 时机分析
      'case_study',      // 案例研究
      'expert_insight'   // 专家见解
    ],
    index: true
  },

  subcategory: {
    type: String,
    enum: [
      // 理论基础子分类
      'basic_theory', 'advanced_theory', 'historical_context',
      // 卦象解释子分类
      'ben_gua', 'hu_gua', 'bian_gua', 'yao_analysis',
      // 五行分析子分类
      'generation', 'destruction', 'balance', 'seasonal',
      // 应用子分类
      'career', 'relationship', 'health', 'finance', 'study',
      // 时机分析子分类
      'timing_theory', 'seasonal_timing', 'daily_timing',
      // 案例研究子分类
      'success_cases', 'failure_analysis', 'comparative_study',
      // 专家见解子分类
      'yan_bingtan_theory', 'modern_interpretation', 'practical_tips'
    ],
    index: true
  },

  // 来源信息
  source: {
    type: sourceSchema,
    required: true
  },

  // 元数据
  metadata: {
    hexagramId: {
      type: Number,
      min: 1,
      max: 64
    },
    hexagramName: {
      type: String,
      maxlength: 10
    },
    elements: [{
      type: String,
      enum: ['金', '木', '水', '火', '土']
    }],
    keywords: [{
      type: String,
      maxlength: 20,
      validate: {
        validator: function(v) {
          return /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/.test(v);
        },
        message: '关键词只能包含中文、英文、数字和下划线'
      }
    }],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'intermediate'
    },
    reliability: {
      type: String,
      enum: ['low', 'medium', 'high', 'authoritative'],
      default: 'medium'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'zh-TW', 'en'],
      default: 'zh-CN'
    },
    chunkSize: {
      type: Number,
      min: 0
    },
    processingDate: {
      type: Date,
      default: Date.now
    }
  },

  // 向量嵌入
  embedding: {
    type: embeddingSchema,
    required: true
  },

  // 关联信息
  relatedKnowledge: [{
    knowledgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeBase'
    },
    relationshipType: {
      type: String,
      enum: ['similar', 'complementary', 'contradictory', 'prerequisite', 'follow_up']
    },
    relevanceScore: {
      type: Number,
      min: 0,
      max: 1
    }
  }],

  // 使用统计
  usage: {
    type: usageSchema,
    default: () => ({})
  },

  // 质量控制
  quality: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: String,
      maxlength: 100
    },
    verifiedAt: Date,
    needsReview: {
      type: Boolean,
      default: false
    },
    reviewNotes: {
      type: String,
      maxlength: 500
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },

  // 状态管理
  status: {
    type: String,
    enum: ['draft', 'active', 'archived', 'deprecated'],
    default: 'active',
    index: true
  },

  // 访问控制
  access: {
    isPublic: {
      type: Boolean,
      default: true
    },
    requiredLevel: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    allowedRoles: [{
      type: String,
      enum: ['user', 'expert', 'admin']
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * 虚拟字段
 */

// 知识条目摘要
knowledgeBaseSchema.virtual('briefSummary').get(function() {
  return {
    title: this.title,
    category: this.category,
    subcategory: this.subcategory,
    keywords: this.metadata.keywords,
    reliability: this.metadata.reliability,
    source: this.source.title
  };
});

// 相关性得分
knowledgeBaseSchema.virtual('relevanceScore').get(function() {
  const baseScore = this.usage.averageRelevance || 0;
  const qualityBonus = this.quality.isVerified ? 0.1 : 0;
  const reliabilityBonus = {
    'low': 0,
    'medium': 0.05,
    'high': 0.1,
    'authoritative': 0.15
  }[this.metadata.reliability] || 0;
  
  return Math.min(1, baseScore + qualityBonus + reliabilityBonus);
});

// 使用频率
knowledgeBaseSchema.virtual('usageFrequency').get(function() {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  return daysSinceCreation > 0 ? this.usage.retrievalCount / daysSinceCreation : 0;
});

/**
 * 索引配置
 */
// 基础查询索引
knowledgeBaseSchema.index({ category: 1, subcategory: 1 });
knowledgeBaseSchema.index({ 'metadata.hexagramId': 1 });
knowledgeBaseSchema.index({ 'metadata.keywords': 1 });
knowledgeBaseSchema.index({ status: 1, 'usage.averageRelevance': -1 });

// 复合索引
knowledgeBaseSchema.index({ 
  category: 1, 
  'metadata.difficulty': 1, 
  'quality.isVerified': 1 
}, { 
  name: 'category_difficulty_verified_idx' 
});

knowledgeBaseSchema.index({ 
  'metadata.elements': 1, 
  'metadata.reliability': 1 
}, { 
  name: 'elements_reliability_idx' 
});

// 文本搜索索引
knowledgeBaseSchema.index({ 
  title: 'text',
  content: 'text',
  summary: 'text',
  'metadata.keywords': 'text'
}, {
  name: 'knowledge_search_idx',
  weights: {
    title: 10,
    'metadata.keywords': 8,
    summary: 5,
    content: 3
  }
});

/**
 * 中间件
 */

// 保存前更新质量控制信息
knowledgeBaseSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('metadata')) {
    this.quality.lastUpdated = new Date();

    // 如果内容被修改，需要重新审核
    if (this.isModified('content')) {
      this.quality.needsReview = true;
      this.quality.isVerified = false;
    }
  }

  next();
});

/**
 * 静态方法
 */

// 根据分类查询知识
knowledgeBaseSchema.statics.findByCategory = function(category, options = {}) {
  const {
    subcategory,
    difficulty,
    reliability,
    verified = null,
    page = 1,
    limit = 20,
    sortBy = 'usage.averageRelevance',
    sortOrder = -1
  } = options;

  const query = { category, status: 'active' };

  if (subcategory) query.subcategory = subcategory;
  if (difficulty) query['metadata.difficulty'] = difficulty;
  if (reliability) query['metadata.reliability'] = reliability;
  if (verified !== null) query['quality.isVerified'] = verified;

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder };

  return this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .select('-embedding.vector'); // 排除向量数据以提高查询性能
};

// 根据卦象ID查询相关知识
knowledgeBaseSchema.statics.findByHexagram = function(hexagramId, options = {}) {
  const {
    category,
    limit = 10,
    minRelevance = 0.5
  } = options;

  const query = {
    'metadata.hexagramId': hexagramId,
    status: 'active',
    'usage.averageRelevance': { $gte: minRelevance }
  };

  if (category) query.category = category;

  return this.find(query)
    .sort({ 'usage.averageRelevance': -1, 'quality.isVerified': -1 })
    .limit(limit)
    .select('-embedding.vector');
};

// 根据五行元素查询知识
knowledgeBaseSchema.statics.findByElements = function(elements, options = {}) {
  const {
    category,
    limit = 15,
    includeGeneral = true
  } = options;

  const query = {
    status: 'active',
    $or: [
      { 'metadata.elements': { $in: elements } }
    ]
  };

  if (includeGeneral) {
    query.$or.push({ 'metadata.elements': { $size: 0 } }); // 包含通用知识
  }

  if (category) query.category = category;

  return this.find(query)
    .sort({ 'usage.averageRelevance': -1, 'metadata.reliability': -1 })
    .limit(limit)
    .select('-embedding.vector');
};

// 搜索知识库
knowledgeBaseSchema.statics.searchKnowledge = function(searchQuery, options = {}) {
  const {
    category,
    difficulty,
    minRelevance = 0.3,
    verified = null,
    page = 1,
    limit = 20
  } = options;

  const query = {
    status: 'active',
    $text: { $search: searchQuery },
    'usage.averageRelevance': { $gte: minRelevance }
  };

  if (category) query.category = category;
  if (difficulty) query['metadata.difficulty'] = difficulty;
  if (verified !== null) query['quality.isVerified'] = verified;

  const skip = (page - 1) * limit;

  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, 'usage.averageRelevance': -1 })
    .skip(skip)
    .limit(limit)
    .select('-embedding.vector');
};

// 获取推荐知识
knowledgeBaseSchema.statics.getRecommendations = function(userProfile, options = {}) {
  const {
    limit = 10,
    categories = ['theory', 'application'],
    difficulty = 'intermediate'
  } = options;

  const query = {
    status: 'active',
    category: { $in: categories },
    'metadata.difficulty': { $in: [difficulty, 'beginner'] },
    'quality.isVerified': true
  };

  return this.find(query)
    .sort({ 'usage.averageRelevance': -1, 'usage.retrievalCount': -1 })
    .limit(limit)
    .select('-embedding.vector');
};

// 获取知识库统计
knowledgeBaseSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { status: 'active' } },
    {
      $group: {
        _id: null,
        totalKnowledge: { $sum: 1 },
        verifiedCount: {
          $sum: { $cond: ['$quality.isVerified', 1, 0] }
        },
        categories: { $push: '$category' },
        difficulties: { $push: '$metadata.difficulty' },
        reliabilities: { $push: '$metadata.reliability' },
        averageRelevance: { $avg: '$usage.averageRelevance' },
        totalRetrievals: { $sum: '$usage.retrievalCount' }
      }
    },
    {
      $project: {
        _id: 0,
        totalKnowledge: 1,
        verifiedCount: 1,
        verificationRate: {
          $round: [{ $multiply: [{ $divide: ['$verifiedCount', '$totalKnowledge'] }, 100] }, 2]
        },
        averageRelevance: { $round: ['$averageRelevance', 3] },
        totalRetrievals: 1,
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
        difficultyStats: {
          $reduce: {
            input: '$difficulties',
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

// 更新使用统计
knowledgeBaseSchema.methods.updateUsage = function(relevanceScore) {
  this.usage.retrievalCount += 1;
  this.usage.lastRetrieved = new Date();

  // 更新平均相关性（使用移动平均）
  const currentAvg = this.usage.averageRelevance || 0;
  const count = this.usage.retrievalCount;
  this.usage.averageRelevance = (currentAvg * (count - 1) + relevanceScore) / count;

  return this.save();
};

// 添加用户反馈
knowledgeBaseSchema.methods.addFeedback = function(isHelpful) {
  if (isHelpful) {
    this.usage.userFeedback.helpful += 1;
  } else {
    this.usage.userFeedback.notHelpful += 1;
  }

  // 更新质量得分
  const total = this.usage.userFeedback.helpful + this.usage.userFeedback.notHelpful;
  if (total > 0) {
    this.usage.qualityScore = this.usage.userFeedback.helpful / total;
  }

  return this.save();
};

// 验证知识条目
knowledgeBaseSchema.methods.verify = function(verifierName, notes = '') {
  this.quality.isVerified = true;
  this.quality.verifiedBy = verifierName;
  this.quality.verifiedAt = new Date();
  this.quality.needsReview = false;
  this.quality.reviewNotes = notes;

  return this.save();
};

// 标记需要审核
knowledgeBaseSchema.methods.markForReview = function(reason = '') {
  this.quality.needsReview = true;
  this.quality.reviewNotes = reason;
  this.quality.isVerified = false;

  return this.save();
};

// 归档知识条目
knowledgeBaseSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

// 获取相关知识
knowledgeBaseSchema.methods.getRelatedKnowledge = function(limit = 5) {
  const relatedIds = this.relatedKnowledge
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit)
    .map(rel => rel.knowledgeId);

  return this.constructor.find({
    _id: { $in: relatedIds },
    status: 'active'
  }).select('-embedding.vector');
};

// 检查是否可以访问
knowledgeBaseSchema.methods.canAccess = function(userLevel = 'free', userRole = 'user') {
  if (!this.access.isPublic) return false;

  const levelHierarchy = { 'free': 0, 'basic': 1, 'premium': 2 };
  const userLevelValue = levelHierarchy[userLevel] || 0;
  const requiredLevelValue = levelHierarchy[this.access.requiredLevel] || 0;

  if (userLevelValue < requiredLevelValue) return false;

  if (this.access.allowedRoles.length > 0) {
    return this.access.allowedRoles.includes(userRole);
  }

  return true;
};

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
