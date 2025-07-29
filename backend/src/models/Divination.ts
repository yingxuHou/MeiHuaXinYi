import mongoose, { Document, Schema } from 'mongoose';

// 卦象接口定义
export interface IHexagram {
  original: {
    name: string;        // 卦名，如"乾卦"
    symbol: string;      // 卦象符号，如"☰"
    number: number;      // 卦序号 1-64
    lines: string[];     // 六爻，如["阳", "阳", "阳", "阳", "阳", "阳"]
  };
  changed?: {
    name: string;
    symbol: string;
    number: number;
    lines: string[];
  };
  changingLines: number[]; // 变爻位置，如[1, 3]表示第1爻和第3爻为变爻
}

// AI解读接口定义
export interface IAIInterpretation {
  overall: string;         // 总体运势解读
  advice: string[];        // 具体建议数组
  warning?: string;        // 注意事项
  timing: string;          // 时机建议
  confidence: number;      // AI解读置信度 0-1
}

// 占卜记录接口定义
export interface IDivination extends Document {
  userId: mongoose.Types.ObjectId;
  question: string;
  category?: string;       // 问题分类：事业、感情、健康、财运等
  hexagram: IHexagram;
  aiInterpretation: IAIInterpretation;
  status: 'pending' | 'completed' | 'failed';
  isPaid: boolean;
  metadata: {
    timestamp: Date;       // 占卜时间戳（用于算法计算）
    userAgent?: string;    // 用户设备信息
    ipAddress?: string;    // IP地址（可选）
  };
  createdAt: Date;
  updatedAt: Date;
  
  // 方法
  markAsCompleted(): Promise<IDivination>;
  markAsFailed(reason: string): Promise<IDivination>;
}

// 卦象Schema
const HexagramSchema = new Schema({
  original: {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    number: { type: Number, required: true, min: 1, max: 64 },
    lines: [{ type: String, enum: ['阳', '阴'], required: true }]
  },
  changed: {
    name: String,
    symbol: String,
    number: { type: Number, min: 1, max: 64 },
    lines: [{ type: String, enum: ['阳', '阴'] }]
  },
  changingLines: [{ type: Number, min: 1, max: 6 }]
}, { _id: false });

// AI解读Schema
const AIInterpretationSchema = new Schema({
  overall: { type: String, required: true },
  advice: [{ type: String, required: true }],
  warning: String,
  timing: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 1, default: 0.8 }
}, { _id: false });

// 占卜记录Schema
const DivinationSchema = new Schema<IDivination>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必填项'],
    index: true
  },
  question: {
    type: String,
    required: [true, '问题是必填项'],
    trim: true,
    minlength: [5, '问题至少需要5个字符'],
    maxlength: [500, '问题不能超过500个字符']
  },
  category: {
    type: String,
    enum: ['事业', '感情', '健康', '财运', '学业', '家庭', '其他'],
    default: '其他'
  },
  hexagram: {
    type: HexagramSchema,
    required: true
  },
  aiInterpretation: {
    type: AIInterpretationSchema,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  isPaid: {
    type: Boolean,
    default: false,
    index: true
  },
  metadata: {
    timestamp: { type: Date, required: true },
    userAgent: String,
    ipAddress: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.__v;
      return ret;
    }
  }
});

// 索引
DivinationSchema.index({ userId: 1, createdAt: -1 });
DivinationSchema.index({ status: 1, createdAt: -1 });
DivinationSchema.index({ category: 1 });
DivinationSchema.index({ 'metadata.timestamp': 1 });

// 实例方法：标记为完成
DivinationSchema.methods.markAsCompleted = async function(): Promise<IDivination> {
  this.status = 'completed';
  return await this.save();
};

// 实例方法：标记为失败
DivinationSchema.methods.markAsFailed = async function(reason: string): Promise<IDivination> {
  this.status = 'failed';
  this.aiInterpretation = {
    overall: `占卜失败：${reason}`,
    advice: ['请稍后重试'],
    timing: '暂时不宜',
    confidence: 0
  };
  return await this.save();
};

// 静态方法：获取用户的占卜历史
DivinationSchema.statics.getUserHistory = function(userId: string, limit: number = 10) {
  return this.find({ userId, status: 'completed' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'nickname email');
};

// 静态方法：获取占卜统计
DivinationSchema.statics.getStats = function(userId?: string) {
  const match = userId ? { userId } : {};
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// 创建并导出模型
const Divination = mongoose.model<IDivination>('Divination', DivinationSchema);

export default Divination;
