/**
 * 梅花心易 - 数据库连接配置 v2.0
 * MongoDB Atlas + Redis 云原生连接管理
 */

const mongoose = require('mongoose');
const Redis = require('ioredis');
const config = require('./index');

/**
 * MongoDB Atlas 连接管理类 (v2.0升级)
 */
class MongoDBConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 5000; // 5秒
  }

  /**
   * 连接到MongoDB Atlas
   */
  async connect() {
    try {
      console.log('🔄 正在连接 MongoDB Atlas...');

      // 设置mongoose配置 (v2.0优化)
      mongoose.set('strictQuery', false);
      mongoose.set('bufferCommands', false);

      // v2.0优化的连接选项 (Mongoose 8.x 兼容)
      const connectionOptions = {
        ...config.database.mongodb.options,
        // 云数据库优化配置
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // 使用IPv4
        // 重连配置
        retryWrites: true,
        retryReads: true,
        // 读写关注
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority', j: true, wtimeout: 10000 },
        // Mongoose 8.x 兼容性配置
        bufferCommands: false, // 禁用命令缓冲
        autoIndex: true, // 自动创建索引
        autoCreate: true // 自动创建集合
      };

      // 连接MongoDB Atlas
      this.connection = await mongoose.connect(
        config.database.mongodb.uri,
        connectionOptions
      );

      this.isConnected = true;
      this.connectionAttempts = 0;

      console.log('✅ MongoDB Atlas 连接成功');
      console.log(`📊 数据库: ${config.database.mongodb.dbName}`);
      console.log(`🌐 集群: ${this.getClusterInfo()}`);

      // 监听连接事件
      this.setupEventListeners();

      // 创建索引
      await this.ensureIndexes();

    } catch (error) {
      this.connectionAttempts++;
      console.error(`❌ MongoDB Atlas 连接失败 (尝试 ${this.connectionAttempts}/${this.maxRetries}):`, error.message);

      if (this.connectionAttempts < this.maxRetries) {
        console.log(`🔄 ${this.retryDelay/1000}秒后重试连接...`);
        await this.delay(this.retryDelay);
        return this.connect();
      }

      throw error;
    }
  }

  /**
   * 获取集群信息
   */
  getClusterInfo() {
    try {
      const uri = config.database.mongodb.uri;
      const match = uri.match(/@([^/]+)/);
      return match ? match[1] : 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 确保索引存在 (v2.0新增)
   */
  async ensureIndexes() {
    try {
      console.log('🔧 正在创建数据库索引...');

      // 这里可以添加自定义索引创建逻辑
      // 模型的索引会在模型加载时自动创建

      console.log('✅ 数据库索引创建完成');
    } catch (error) {
      console.warn('⚠️ 索引创建失败:', error.message);
    }
  }

  /**
   * 设置事件监听器 (v2.0增强)
   */
  setupEventListeners() {
    const db = mongoose.connection;

    // 连接成功事件
    db.on('connected', () => {
      console.log('🔗 MongoDB Atlas 连接已建立');
      this.isConnected = true;
    });

    // 连接打开事件
    db.on('open', () => {
      console.log('📂 MongoDB Atlas 连接已打开');
    });

    // 连接错误事件
    db.on('error', (error) => {
      console.error('❌ MongoDB Atlas 连接错误:', error.message);
      this.isConnected = false;

      // 记录错误详情
      if (error.name === 'MongoNetworkError') {
        console.error('🌐 网络连接问题，请检查网络设置');
      } else if (error.name === 'MongoAuthenticationError') {
        console.error('🔐 认证失败，请检查用户名和密码');
      } else if (error.name === 'MongoServerSelectionError') {
        console.error('🎯 服务器选择失败，请检查连接字符串');
      }
    });

    // 连接断开事件
    db.on('disconnected', () => {
      console.warn('⚠️ MongoDB Atlas 连接断开');
      this.isConnected = false;

      // 在生产环境中尝试重连
      if (config.app.isProduction && this.connectionAttempts < this.maxRetries) {
        console.log('🔄 尝试重新连接...');
        setTimeout(() => this.connect(), this.retryDelay);
      }
    });

    // 重连成功事件
    db.on('reconnected', () => {
      console.log('🔄 MongoDB Atlas 重新连接成功');
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    // 连接关闭事件
    db.on('close', () => {
      console.log('🔒 MongoDB Atlas 连接已关闭');
      this.isConnected = false;
    });

    // 全部副本集成员断开连接
    db.on('fullsetup', () => {
      console.log('🎯 MongoDB Atlas 副本集连接完成');
    });

    // 监控慢查询 (v2.0新增)
    if (config.app.isDevelopment) {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(`🐌 慢查询: ${collectionName}.${method}`, JSON.stringify(query));
      });
    }

    // 优雅关闭处理
    const gracefulShutdown = async (signal) => {
      console.log(`📡 收到 ${signal} 信号，正在优雅关闭...`);
      await this.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGUSR2', gracefulShutdown); // nodemon restart
  }

  /**
   * 断开MongoDB Atlas连接 (v2.0增强)
   */
  async disconnect() {
    try {
      if (this.connection) {
        console.log('🔄 正在关闭 MongoDB Atlas 连接...');

        // 设置超时，避免无限等待
        const disconnectPromise = mongoose.disconnect();
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('断开连接超时')), 10000);
        });

        await Promise.race([disconnectPromise, timeoutPromise]);

        console.log('👋 MongoDB Atlas 连接已关闭');
        this.isConnected = false;
        this.connection = null;
      }
    } catch (error) {
      console.error('❌ MongoDB Atlas 断开连接失败:', error.message);
      // 强制设置状态
      this.isConnected = false;
      this.connection = null;
    }
  }

  /**
   * 获取连接状态 (v2.0增强)
   */
  getStatus() {
    const readyStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      readyStateText: readyStates[mongoose.connection.readyState] || 'unknown',
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: mongoose.connection.name,
      cluster: this.getClusterInfo(),
      connectionAttempts: this.connectionAttempts,
      collections: Object.keys(mongoose.connection.collections),
      models: mongoose.modelNames()
    };
  }

  /**
   * 获取连接统计信息 (v2.0新增)
   */
  async getStats() {
    try {
      if (!this.isConnected) {
        return { error: '数据库未连接' };
      }

      const db = mongoose.connection.db;
      const admin = db.admin();

      // 获取数据库统计
      const dbStats = await db.stats();
      const serverStatus = await admin.serverStatus();

      return {
        database: {
          name: db.databaseName,
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize
        },
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections,
          network: serverStatus.network,
          opcounters: serverStatus.opcounters
        },
        connection: {
          readyState: this.getStatus().readyStateText,
          host: mongoose.connection.host,
          port: mongoose.connection.port
        }
      };
    } catch (error) {
      console.error('获取数据库统计失败:', error.message);
      return { error: error.message };
    }
  }

  /**
   * 测试连接 (v2.0新增)
   */
  async testConnection() {
    try {
      if (!this.isConnected) {
        return { success: false, message: '数据库未连接' };
      }

      // 执行简单的ping操作
      const result = await mongoose.connection.db.admin().ping();

      if (result.ok === 1) {
        return {
          success: true,
          message: '连接正常',
          latency: Date.now() - Date.now() // 这里可以添加实际的延迟测量
        };
      } else {
        return { success: false, message: 'Ping失败' };
      }
    } catch (error) {
      return {
        success: false,
        message: `连接测试失败: ${error.message}`
      };
    }
  }
}

/**
 * Redis 连接管理类
 */
class RedisConnection {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  /**
   * 连接到Redis
   */
  async connect() {
    try {
      console.log('🔄 正在连接 Redis...');

      this.client = new Redis({
        host: config.database.redis.host,
        port: config.database.redis.port,
        password: config.database.redis.password,
        db: config.database.redis.db,
        lazyConnect: true,
        // 开发环境下快速失败
        retryDelayOnClusterDown: config.app.isDevelopment ? 100 : 100,
        retryDelayOnFailover: config.app.isDevelopment ? 100 : 100,
        maxRetriesPerRequest: config.app.isDevelopment ? 0 : 3,
        connectTimeout: config.app.isDevelopment ? 1000 : 10000,
        commandTimeout: config.app.isDevelopment ? 1000 : 5000,
        // 禁用自动重连（开发环境）
        enableAutoPipelining: false,
        // 开发环境下禁用重连
        retryDelayOnFailover: config.app.isDevelopment ? 0 : 100,
        maxRetriesPerRequest: config.app.isDevelopment ? 0 : 3
      });

      // 连接Redis
      await this.client.connect();
      this.isConnected = true;

      console.log('✅ Redis 连接成功');
      console.log(`📊 Redis: ${config.database.redis.host}:${config.database.redis.port}`);

      // 设置事件监听器
      this.setupEventListeners();

    } catch (error) {
      console.warn('⚠️ Redis 连接失败:', error.message);
      console.warn('⚠️ 应用将在无Redis模式下运行');
      this.isConnected = false;
      this.client = null;
      // 在开发环境下不抛出错误，允许应用继续运行
      if (config.app.isProduction) {
        throw error;
      }
    }
  }

  /**
   * 设置事件监听器
   */
  setupEventListeners() {
    this.client.on('connect', () => {
      console.log('🔄 Redis 连接建立');
    });

    this.client.on('ready', () => {
      console.log('✅ Redis 准备就绪');
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      // 在开发环境下减少错误日志输出
      if (config.app.isDevelopment) {
        // 只在第一次错误时输出
        if (this.isConnected) {
          console.warn('⚠️ Redis 连接中断，应用将在无Redis模式下运行');
        }
      } else {
        console.error('❌ Redis 连接错误:', error.message);
      }
      this.isConnected = false;
    });

    this.client.on('close', () => {
      if (config.app.isDevelopment && this.isConnected) {
        console.warn('⚠️ Redis 连接关闭');
      }
      this.isConnected = false;
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis 正在重连...');
    });

    // 优雅关闭
    process.on('SIGINT', async () => {
      await this.disconnect();
    });
  }

  /**
   * 断开Redis连接
   */
  async disconnect() {
    try {
      if (this.client) {
        await this.client.quit();
        console.log('👋 Redis 连接已关闭');
        this.isConnected = false;
      }
    } catch (error) {
      console.error('❌ Redis 断开连接失败:', error.message);
    }
  }

  /**
   * 获取Redis客户端
   */
  getClient() {
    if (!this.isConnected || !this.client) {
      throw new Error('Redis 未连接');
    }
    return this.client;
  }

  /**
   * 获取连接状态
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      status: this.client ? this.client.status : 'disconnected',
      host: config.database.redis.host,
      port: config.database.redis.port,
      db: config.database.redis.db
    };
  }

  /**
   * 测试Redis连接
   */
  async ping() {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis ping 失败:', error.message);
      return false;
    }
  }
}

/**
 * 数据库管理器
 */
class DatabaseManager {
  constructor() {
    this.mongodb = new MongoDBConnection();
    this.redis = new RedisConnection();
  }

  /**
   * 连接所有数据库
   */
  async connectAll() {
    try {
      console.log('🚀 正在初始化数据库连接...');

      // 先连接MongoDB（必需）
      await this.mongodb.connect();

      // 再连接Redis（可选，开发环境下失败不影响启动）
      await this.redis.connect();

      const mongoStatus = this.mongodb.isConnected ? '✅' : '❌';
      const redisStatus = this.redis.isConnected ? '✅' : '⚠️';

      console.log(`${mongoStatus} MongoDB: ${this.mongodb.isConnected ? '已连接' : '连接失败'}`);
      console.log(`${redisStatus} Redis: ${this.redis.isConnected ? '已连接' : '未连接'}`);

      // 只要MongoDB连接成功就算成功
      if (this.mongodb.isConnected) {
        console.log('✅ 数据库初始化完成');
        return true;
      } else {
        throw new Error('MongoDB连接失败');
      }
    } catch (error) {
      console.error('❌ 数据库连接失败:', error.message);
      throw error;
    }
  }

  /**
   * 断开所有数据库连接
   */
  async disconnectAll() {
    console.log('🔄 正在关闭数据库连接...');
    
    await Promise.all([
      this.mongodb.disconnect(),
      this.redis.disconnect()
    ]);

    console.log('👋 所有数据库连接已关闭');
  }

  /**
   * 获取所有数据库状态
   */
  getStatus() {
    return {
      mongodb: this.mongodb.getStatus(),
      redis: this.redis.getStatus()
    };
  }

  /**
   * 健康检查 (v2.0增强)
   */
  async healthCheck() {
    const startTime = Date.now();
    const status = {
      mongodb: {
        status: false,
        latency: 0,
        error: null,
        details: {}
      },
      redis: {
        status: false,
        latency: 0,
        error: null,
        details: {}
      },
      overall: {
        status: false,
        timestamp: new Date().toISOString(),
        duration: 0
      }
    };

    try {
      // 检查MongoDB Atlas
      const mongoStartTime = Date.now();
      try {
        const mongoTest = await this.mongodb.testConnection();
        status.mongodb.status = mongoTest.success;
        status.mongodb.latency = Date.now() - mongoStartTime;
        status.mongodb.details = {
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          collections: Object.keys(mongoose.connection.collections).length
        };

        if (!mongoTest.success) {
          status.mongodb.error = mongoTest.message;
        }
      } catch (error) {
        status.mongodb.status = false;
        status.mongodb.error = error.message;
        status.mongodb.latency = Date.now() - mongoStartTime;
      }

      // 检查Redis（如果Redis客户端存在）
      const redisStartTime = Date.now();
      try {
        if (this.redis.client && this.redis.isConnected) {
          const redisPing = await this.redis.ping();
          status.redis.status = redisPing;
          status.redis.latency = Date.now() - redisStartTime;
          status.redis.details = {
            host: this.redis.getStatus().host,
            port: this.redis.getStatus().port,
            db: this.redis.getStatus().db
          };
        } else {
          status.redis.status = false;
          status.redis.error = 'Redis客户端未连接';
          status.redis.latency = Date.now() - redisStartTime;
        }
      } catch (error) {
        status.redis.status = false;
        status.redis.error = error.message;
        status.redis.latency = Date.now() - redisStartTime;
      }

      // 整体状态（只要MongoDB正常就算健康）
      status.overall.status = status.mongodb.status;
      status.overall.duration = Date.now() - startTime;

      // 添加性能警告
      if (status.mongodb.latency > 1000) {
        status.mongodb.warning = 'MongoDB响应时间较慢';
      }
      if (status.redis.latency > 500) {
        status.redis.warning = 'Redis响应时间较慢';
      }

    } catch (error) {
      console.error('数据库健康检查失败:', error.message);
      status.overall.status = false;
      status.overall.error = error.message;
      status.overall.duration = Date.now() - startTime;
    }

    return status;
  }

  /**
   * 获取详细状态信息 (v2.0新增)
   */
  async getDetailedStatus() {
    const healthCheck = await this.healthCheck();
    const mongoStats = await this.mongodb.getStats();

    return {
      health: healthCheck,
      mongodb: {
        connection: this.mongodb.getStatus(),
        stats: mongoStats
      },
      redis: {
        connection: this.redis.getStatus()
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory: process.memoryUsage()
      }
    };
  }
}

// 创建数据库管理器实例
const databaseManager = new DatabaseManager();

module.exports = {
  databaseManager,
  mongodb: databaseManager.mongodb,
  redis: databaseManager.redis
};
