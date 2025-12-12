/**
 * 梅花心易 - 应用配置管理
 * 统一管理所有环境变量和配置项
 */

const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../../.env') });

/**
 * 验证必需的环境变量 (v2.0更新)
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET'
];

// v2.0可选但推荐的环境变量
const recommendedEnvVars = [
  'DEEPSEEK_API_KEY',
  'CLAUDE_API_KEY',
  'PINECONE_API_KEY',
  'OPENAI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:', missingEnvVars.join(', '));
  console.error('请检查 .env 文件配置');
  process.exit(1);
}

// 检查推荐的环境变量
const missingRecommendedVars = recommendedEnvVars.filter(envVar => !process.env[envVar]);
if (missingRecommendedVars.length > 0) {
  console.warn('⚠️ 缺少推荐的环境变量:', missingRecommendedVars.join(', '));
  console.warn('某些AI功能可能无法正常工作');
}

/**
 * 应用配置对象
 */
const config = {
  // 应用基础配置
  app: {
    name: process.env.APP_NAME || '梅花心易',
    version: process.env.APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT) || 8080,
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // 数据库配置
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI,
      dbName: process.env.MONGODB_DB_NAME || 'meihuaxinyi',
      options: {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      }
    }
  },

  // 认证配置
  auth: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'meihuaxinyi-api',
      audience: 'meihuaxinyi-client'
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12
    },
    crypto: {
      secretKey: process.env.CRYPTO_SECRET_KEY || 'default-secret-key-change-this'
    }
  },

  // AI服务配置 (v2.0升级)
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      apiUrl: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
      maxTokens: parseInt(process.env.DEEPSEEK_MAX_TOKENS) || 4000,
      temperature: parseFloat(process.env.DEEPSEEK_TEMPERATURE) || 0.7,
      timeout: 200000 // 增加到200秒，与前端180秒超时匹配并留有余量
    },
    claude: {
      apiKey: process.env.CLAUDE_API_KEY,
      apiUrl: process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages',
      model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
      maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS) || 4000,
      temperature: parseFloat(process.env.CLAUDE_TEMPERATURE) || 0.7,
      version: '2023-06-01'
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp',
      indexName: process.env.PINECONE_INDEX_NAME || 'meihua-knowledge-base',
      dimension: parseInt(process.env.PINECONE_DIMENSION) || 1536,
      metric: process.env.PINECONE_METRIC || 'cosine',
      cloud: process.env.PINECONE_CLOUD || 'aws',
      region: process.env.PINECONE_REGION || 'us-west-2'
    }
  },

  // 梅花易数算法API配置
  meihua: {
    apiUrl: process.env.MEIHUA_ALGORITHM_API_URL,
    apiKey: process.env.MEIHUA_ALGORITHM_API_KEY,
    timeout: 10000,
    retries: 3
  },

  // 支付配置
  payment: {
    wechat: {
      appId: process.env.WECHAT_PAY_APP_ID,
      mchId: process.env.WECHAT_PAY_MCH_ID,
      apiKey: process.env.WECHAT_PAY_API_KEY
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID,
      privateKey: process.env.ALIPAY_PRIVATE_KEY
    }
  },

  // 安全配置
  security: {
    cors: {
      origin: [
        // 本地开发环境
        'http://localhost:3000',
        'http://localhost:5173',  // Vite默认端口
        'http://localhost:5174',  // Vite备用端口
        'http://localhost:5175',  // Vite备用端口2
        'http://localhost:8080',  // Vue CLI默认端口
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        // 生产环境
        'https://meihuaxinyi.zeabur.app'
      ],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-Device-Info']
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
      message: '请求过于频繁，请稍后再试',
      standardHeaders: true,
      legacyHeaders: false
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      }
    }
  },

  // 文件上传配置
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'image/jpeg,image/png,image/gif').split(','),
    destination: 'uploads/'
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || 'logs/app.log',
    maxFiles: 5,
    maxSize: '10m'
  },

  // 监控配置
  monitoring: {
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000,
    metricsEnabled: process.env.METRICS_ENABLED === 'true'
  }
};

/**
 * 配置验证函数
 */
config.validate = () => {
  const errors = [];

  // 验证JWT密钥强度
  if (config.auth.jwt.secret.length < 32) {
    errors.push('JWT_SECRET 长度应至少为32个字符');
  }

  // 验证数据库URI格式
  if (!config.database.mongodb.uri.startsWith('mongodb://') && 
      !config.database.mongodb.uri.startsWith('mongodb+srv://')) {
    errors.push('MONGODB_URI 格式不正确');
  }

  if (errors.length > 0) {
    console.error('❌ 配置验证失败:');
    errors.forEach(error => console.error(`  - ${error}`));
    return false;
  }

  return true;
};

/**
 * 打印配置信息（隐藏敏感信息）
 */
config.printInfo = () => {
  console.log('📋 应用配置信息:');
  console.log(`  应用名称: ${config.app.name}`);
  console.log(`  版本: ${config.app.version}`);
  console.log(`  环境: ${config.app.env}`);
  console.log(`  端口: ${config.app.port}`);
  console.log(`  MongoDB: ${config.database.mongodb.uri.replace(/\/\/.*@/, '//***:***@')}`);
};

module.exports = config;
