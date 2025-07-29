import { initializeDatabase } from './config/database';
import User from './models/User';

async function testDatabase() {
  try {
    console.log('🧪 开始数据库连接测试...');
    
    // 初始化数据库连接
    const { redisClient } = await initializeDatabase();
    
    // 测试MongoDB - 创建测试用户
    console.log('📝 测试MongoDB用户创建...');
    const testUser = new User({
      email: 'test@meihua.com',
      password: 'test123456',
      nickname: '测试用户'
    });
    
    // 保存用户（测试）
    await testUser.save();
    console.log('✅ MongoDB用户创建成功:', testUser.email);
    
    // 测试Redis - 设置和获取数据
    console.log('🔴 测试Redis数据操作...');
    await redisClient.set('test:key', 'Hello MeiHua XinYi!');
    const redisValue = await redisClient.get('test:key');
    console.log('✅ Redis测试成功:', redisValue);
    
    // 清理测试数据
    await User.deleteOne({ email: 'test@meihua.com' });
    await redisClient.del('test:key');
    
    console.log('🎉 数据库连接测试完成！');
    console.log('📊 系统状态：');
    console.log('  - MongoDB: ✅ 连接正常');
    console.log('  - Redis: ✅ 连接正常');
    console.log('  - 用户模型: ✅ 工作正常');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 数据库测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testDatabase();
