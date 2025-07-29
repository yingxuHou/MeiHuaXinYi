import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 用户接口定义
export interface IUser extends Document {
  email: string;
  password: string;
  nickname?: string;
  avatar?: string;
  gender?: 'male' | 'female' | 'other';
  birthDate?: Date;
  freeCount: number;
  totalCount: number;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // 方法
  comparePassword(candidatePassword: string): Promise<boolean>;
  decrementFreeCount(): Promise<IUser>;
  incrementTotalCount(): Promise<IUser>;
}

// 用户Schema定义
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, '邮箱是必填项'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      '请输入有效的邮箱地址'
    ]
  },
  password: {
    type: String,
    required: [true, '密码是必填项'],
    minlength: [6, '密码至少需要6个字符'],
    select: false // 默认查询时不返回密码
  },
  nickname: {
    type: String,
    trim: true,
    maxlength: [20, '昵称不能超过20个字符']
  },
  avatar: {
    type: String,
    default: null
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },
  birthDate: {
    type: Date,
    default: null
  },
  freeCount: {
    type: Number,
    default: 10,
    min: [0, '免费次数不能为负数']
  },
  totalCount: {
    type: Number,
    default: 0,
    min: [0, '总次数不能为负数']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true, // 自动添加createdAt和updatedAt
  toJSON: {
    transform: function(doc: any, ret: any) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  }
});

// 索引
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ isActive: 1 });

// 密码加密中间件
UserSchema.pre('save', async function(next) {
  // 只有密码被修改时才加密
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// 实例方法：比较密码
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('密码比较失败');
  }
};

// 实例方法：减少免费次数
UserSchema.methods.decrementFreeCount = async function(): Promise<IUser> {
  if (this.freeCount > 0) {
    this.freeCount -= 1;
    return await this.save();
  }
  throw new Error('免费次数已用完');
};

// 实例方法：增加总次数
UserSchema.methods.incrementTotalCount = async function(): Promise<IUser> {
  this.totalCount += 1;
  return await this.save();
};

// 静态方法：根据邮箱查找用户（包含密码）
UserSchema.statics.findByEmailWithPassword = function(email: string) {
  return this.findOne({ email }).select('+password');
};

// 创建并导出模型
const User = mongoose.model<IUser>('User', UserSchema);

export default User;
