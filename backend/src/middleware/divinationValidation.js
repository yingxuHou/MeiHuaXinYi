/**
 * 占卜数据验证中间件
 * 用于在返回占卜结果前验证数据的一致性
 */

const { checkDivinationDataConsistency, fixDivinationData } = require('./divinationDataValidator');

/**
 * 占卜数据验证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
function validateDivinationData(req, res, next) {
  // 只对占卜相关的响应进行验证
  if (req.path.includes('/divination/') && res.locals.divinationResult) {
    const result = res.locals.divinationResult;
    
    console.log('🔍 验证占卜数据一致性...');
    
    // 检查数据一致性
    const consistencyCheck = checkDivinationDataConsistency(result);
    
    if (!consistencyCheck.isValid) {
      console.warn('⚠️ 检测到占卜数据问题:', consistencyCheck.issues);
      
      // 尝试修复数据
      const fixedResult = fixDivinationData(result);
      const fixedCheck = checkDivinationDataConsistency(fixedResult);
      
      if (fixedCheck.isValid) {
        console.log('✅ 数据修复成功');
        res.locals.divinationResult = fixedResult;
      } else {
        console.error('❌ 数据修复失败');
        // 可以选择返回错误或使用原始数据
      }
    } else {
      console.log('✅ 占卜数据一致性检查通过');
    }
  }
  
  next();
}

/**
 * 占卜结果响应中间件
 * 在发送响应前进行最终验证
 */
function validateDivinationResponse(req, res, next) {
  const originalJson = res.json;
  
  res.json = function(data) {
    // 只对占卜相关的响应进行验证
    if (req.path.includes('/divination/') && data && data.success && data.data) {
      console.log('🔍 最终验证占卜响应数据...');
      
      const consistencyCheck = checkDivinationDataConsistency(data.data);
      
      if (!consistencyCheck.isValid) {
        console.warn('⚠️ 响应数据有问题:', consistencyCheck.issues);
        
        // 尝试修复
        const fixedData = fixDivinationData(data.data);
        const fixedCheck = checkDivinationDataConsistency(fixedData);
        
        if (fixedCheck.isValid) {
          console.log('✅ 响应数据修复成功');
          data.data = fixedData;
        } else {
          console.error('❌ 响应数据修复失败');
        }
      }
    }
    
    return originalJson.call(this, data);
  };
  
  next();
}

module.exports = {
  validateDivinationData,
  validateDivinationResponse
};
