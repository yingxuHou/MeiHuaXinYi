const { MongoClient } = require('mongodb');
const { createClient } = require('redis');
require('dotenv').config();

async function setupDatabase() {
  console.log('🔧 开始数据库设置...\n');

  // 测试MongoDB连接
  console.log('1️⃣ 测试MongoDB连接...');
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/meihua-xinyi';
    const client = new MongoClient(mongoUri);
    
    await client.connect();
    console.log('✅ MongoDB连接成功');
    
    // 创建数据库和集合
    const db = client.db();
    
    // 创建用户集合
    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('📝 用户集合索引创建成功');
    
    // 创建占卜集合
    const divinationsCollection = db.collection('divinations');
    await divinationsCollection.createIndex({ userId: 1, createdAt: -1 });
    await divinationsCollection.createIndex({ status: 1 });
    console.log('🔮 占卜集合索引创建成功');
    
    // 创建支付集合
    const paymentsCollection = db.collection('payments');
    await paymentsCollection.createIndex({ userId: 1, createdAt: -1 });
    await paymentsCollection.createIndex({ orderId: 1 }, { unique: true });
    console.log('💰 支付集合索引创建成功');
    
    await client.close();
    console.log('✅ MongoDB设置完成\n');
    
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message);
    console.log('💡 请确保MongoDB服务已启动');
    console.log('💡 Windows: 以管理员身份运行 "net start MongoDB"');
    console.log('💡 或运行 scripts/start-mongodb.bat\n');
  }

  // 测试Redis连接
  console.log('2️⃣ 测试Redis连接...');
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    const redisClient = createClient({ url: redisUrl });
    
    await redisClient.connect();
    console.log('✅ Redis连接成功');
    
    // 测试Redis操作
    await redisClient.set('test:setup', 'success');
    const testValue = await redisClient.get('test:setup');
    
    if (testValue === 'success') {
      console.log('✅ Redis读写测试成功');
      await redisClient.del('test:setup');
    }
    
    await redisClient.disconnect();
    console.log('✅ Redis设置完成\n');
    
  } catch (error) {
    console.error('❌ Redis连接失败:', error.message);
    console.log('💡 请确保Redis服务已启动');
    console.log('💡 Docker: docker run -d -p 6379:6379 redis:alpine');
    console.log('💡 或使用本地Redis服务\n');
  }

  console.log('🎉 数据库设置检查完成！');
  console.log('='.repeat(50));
}

// 运行设置
setupDatabase().catch(console.error);
