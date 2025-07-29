import mongoose, { Document, Schema } from 'mongoose';

// 支付记录接口定义
export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  orderId: string;         // 订单号
  amount: number;          // 支付金额（分）
  count: number;           // 购买的占卜次数
  packageType: string;     // 套餐类型
  paymentMethod: 'wechat' | 'alipay' | 'free';
  transactionId?: string;  // 第三方交易号
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    refundReason?: string; // 退款原因
  };
  createdAt: Date;
  updatedAt: Date;
  
  // 方法
  markAsCompleted(transactionId: string): Promise<IPayment>;
  markAsFailed(reason: string): Promise<IPayment>;
  processRefund(reason: string): Promise<IPayment>;
}

// 套餐配置接口
export interface IPackage {
  id: string;
  name: string;
  count: number;           // 占卜次数
  price: number;           // 价格（分）
  originalPrice?: number;  // 原价（分）
  description: string;
  isActive: boolean;
  sortOrder: number;
}

// 支付记录Schema
const PaymentSchema = new Schema<IPayment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必填项'],
    index: true
  },
  orderId: {
    type: String,
    required: [true, '订单号是必填项'],
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: [true, '支付金额是必填项'],
    min: [0, '支付金额不能为负数']
  },
  count: {
    type: Number,
    required: [true, '购买次数是必填项'],
    min: [1, '购买次数至少为1']
  },
  packageType: {
    type: String,
    required: [true, '套餐类型是必填项'],
    enum: ['basic', 'standard', 'premium', 'vip', 'free'],
    index: true
  },
  paymentMethod: {
    type: String,
    required: [true, '支付方式是必填项'],
    enum: ['wechat', 'alipay', 'free'],
    index: true
  },
  transactionId: {
    type: String,
    sparse: true, // 允许多个null值
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    refundReason: String
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
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ paymentMethod: 1, status: 1 });
PaymentSchema.index({ orderId: 1 }, { unique: true });

// 实例方法：标记为完成
PaymentSchema.methods.markAsCompleted = async function(transactionId: string): Promise<IPayment> {
  this.status = 'completed';
  this.transactionId = transactionId;
  return await this.save();
};

// 实例方法：标记为失败
PaymentSchema.methods.markAsFailed = async function(reason: string): Promise<IPayment> {
  this.status = 'failed';
  this.metadata.refundReason = reason;
  return await this.save();
};

// 实例方法：处理退款
PaymentSchema.methods.processRefund = async function(reason: string): Promise<IPayment> {
  this.status = 'refunded';
  this.metadata.refundReason = reason;
  return await this.save();
};

// 静态方法：生成订单号
PaymentSchema.statics.generateOrderId = function(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8);
  return `MH${timestamp}${random}`.toUpperCase();
};

// 静态方法：获取用户支付历史
PaymentSchema.statics.getUserPayments = function(userId: string, limit: number = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'nickname email');
};

// 静态方法：获取支付统计
PaymentSchema.statics.getPaymentStats = function(startDate?: Date, endDate?: Date) {
  const match: any = { status: 'completed' };
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          method: '$paymentMethod',
          package: '$packageType'
        },
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: '$count' },
        orderCount: { $sum: 1 }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

// 预定义套餐配置
export const PACKAGES: IPackage[] = [
  {
    id: 'free',
    name: '新用户免费',
    count: 10,
    price: 0,
    description: '新用户注册即送10次免费占卜',
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'basic',
    name: '基础套餐',
    count: 20,
    price: 1999, // 19.99元
    originalPrice: 2999,
    description: '20次占卜，适合偶尔使用',
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'standard',
    name: '标准套餐',
    count: 50,
    price: 3999, // 39.99元
    originalPrice: 5999,
    description: '50次占卜，性价比之选',
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'premium',
    name: '高级套餐',
    count: 100,
    price: 6999, // 69.99元
    originalPrice: 9999,
    description: '100次占卜，重度用户首选',
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'vip',
    name: 'VIP套餐',
    count: 300,
    price: 15999, // 159.99元
    originalPrice: 29999,
    description: '300次占卜，一年无忧',
    isActive: true,
    sortOrder: 5
  }
];

// 创建并导出模型
const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
