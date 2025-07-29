import mongoose from 'mongoose';
import { createClient } from 'redis';

// MongoDB连接配置
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meihua-xinyi';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10, // 连接池大小
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      socketTimeoutMS: 45000, // Socket超时
      bufferCommands: false // 禁用mongoose缓冲
    });

    console.log('🍃 MongoDB连接成功');
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB连接错误:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB连接断开');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB重新连接成功');
    });

  } catch (error) {
    console.error('MongoDB连接失败:', error);
    process.exit(1);
  }
};

// Redis连接配置
export const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    const client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    client.on('error', (err) => {
      console.error('Redis连接错误:', err);
    });

    client.on('connect', () => {
      console.log('🔴 Redis连接成功');
    });

    client.on('reconnecting', () => {
      console.log('Redis重新连接中...');
    });

    await client.connect();
    
    // 测试连接
    await client.ping();
    console.log('🔴 Redis连接测试成功');

    return client;
  } catch (error) {
    console.error('Redis连接失败:', error);
    throw error;
  }
};

// 数据库初始化
export const initializeDatabase = async () => {
  try {
    await connectMongoDB();
    const redisClient = await connectRedis();
    
    console.log('📊 数据库初始化完成');
    return { redisClient };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};
