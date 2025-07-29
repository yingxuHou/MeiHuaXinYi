// 统一导出所有数据模型
export { default as User, IUser } from './User';
export { default as Divination, IDivination, IHexagram, IAIInterpretation } from './Divination';
export { default as Payment, IPayment, IPackage, PACKAGES } from './Payment';

// 数据模型初始化函数
export async function initializeModels() {
  try {
    console.log('📊 初始化数据模型...');
    
    // 这里可以添加数据模型的初始化逻辑
    // 比如创建默认数据、检查索引等
    
    console.log('✅ 数据模型初始化完成');
  } catch (error) {
    console.error('❌ 数据模型初始化失败:', error);
    throw error;
  }
}
