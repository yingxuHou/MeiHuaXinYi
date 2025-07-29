import { createClient } from 'redis';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testRedis() {
  try {
    console.log('🔴 开始Redis连接测试...');
    
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    console.log('📡 连接地址:', redisUrl);
    
    const client = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500)
      }
    });

    client.on('error', (err) => {
      console.error('❌ Redis连接错误:', err);
    });

    client.on('connect', () => {
      console.log('✅ Redis连接成功');
    });

    await client.connect();
    
    // 测试Redis操作
    console.log('🧪 测试Redis数据操作...');
    await client.set('test:meihua', 'Hello MeiHua XinYi!');
    const value = await client.get('test:meihua');
    console.log('📝 存储的值:', value);
    
    // 清理测试数据
    await client.del('test:meihua');
    console.log('🧹 清理测试数据完成');
    
    await client.disconnect();
    console.log('🎉 Redis测试完成！');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Redis测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testRedis();
