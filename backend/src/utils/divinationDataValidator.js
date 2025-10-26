/**
 * 占卜数据一致性检查和修复工具
 * 用于解决主卦和变卦相同的问题
 */

// 检查占卜数据的一致性
function checkDivinationDataConsistency(data) {
  console.log('🔍 检查占卜数据一致性...');
  
  if (!data || !data.hexagrams) {
    console.warn('⚠️ 数据缺失，无法检查');
    return { isValid: false, issues: ['数据缺失'] };
  }
  
  const { ben, hu, bian } = data.hexagrams;
  const movingLine = data.movingLine;
  
  const issues = [];
  
  // 检查主卦和变卦是否相同
  if (ben && bian && ben.lines && bian.lines) {
    const isSame = JSON.stringify(ben.lines) === JSON.stringify(bian.lines);
    if (isSame) {
      issues.push('主卦和变卦相同');
      console.error('❌ 主卦和变卦相同！');
      console.log('  主卦:', ben.lines);
      console.log('  变卦:', bian.lines);
      console.log('  动爻位置:', movingLine);
    } else {
      console.log('✅ 主卦和变卦不同');
    }
  }
  
  // 检查动爻是否正确变化
  if (ben && bian && ben.lines && bian.lines && movingLine) {
    const benLine = ben.lines[movingLine - 1];
    const bianLine = bian.lines[movingLine - 1];
    
    if (benLine === bianLine) {
      issues.push('动爻没有变化');
      console.error('❌ 动爻没有变化！');
      console.log(`  第${movingLine}爻: ${benLine} → ${bianLine}`);
    } else {
      console.log(`✅ 动爻正确变化: 第${movingLine}爻 ${benLine} → ${bianLine}`);
    }
  }
  
  // 检查数据完整性
  if (!ben || !ben.lines) issues.push('主卦数据缺失');
  if (!hu || !hu.lines) issues.push('互卦数据缺失');
  if (!bian || !bian.lines) issues.push('变卦数据缺失');
  if (!movingLine) issues.push('动爻位置缺失');
  
  const isValid = issues.length === 0;
  
  console.log(`📊 检查完成: ${isValid ? '✅ 数据正常' : '❌ 发现问题'}`);
  if (issues.length > 0) {
    console.log('问题列表:', issues);
  }
  
  return { isValid, issues, data };
}

// 修复占卜数据
function fixDivinationData(data) {
  console.log('🔧 尝试修复占卜数据...');
  
  if (!data || !data.hexagrams) {
    console.warn('⚠️ 无法修复：数据缺失');
    return data;
  }
  
  const { ben, hu, bian } = data.hexagrams;
  const movingLine = data.movingLine;
  
  // 如果主卦和变卦相同，重新生成变卦
  if (ben && bian && ben.lines && bian.lines) {
    const isSame = JSON.stringify(ben.lines) === JSON.stringify(bian.lines);
    
    if (isSame && movingLine) {
      console.log('🔧 修复：重新生成变卦');
      
      const fixedBian = { ...bian };
      fixedBian.lines = [...ben.lines];
      fixedBian.lines[movingLine - 1] = fixedBian.lines[movingLine - 1] === 1 ? 0 : 1;
      
      // 重新计算变卦的六十四卦信息
      const baguaSystem = require('./backend/src/algorithms/core/baguaSystem');
      const bagua = new baguaSystem();
      
      const bianOuterGua = [fixedBian.lines[5], fixedBian.lines[4], fixedBian.lines[3]];
      const bianInnerGua = [fixedBian.lines[2], fixedBian.lines[1], fixedBian.lines[0]];
      
      try {
        const bianHexagram = bagua.createHexagram(
          bagua.getBaguaNumber(bianOuterGua),
          bagua.getBaguaNumber(bianInnerGua)
        );
        
        fixedBian.id = bianHexagram.id;
        fixedBian.name = bianHexagram.name;
        fixedBian.upperGua = bagua.getBaguaProperties(bagua.getBaguaNumber(bianOuterGua));
        fixedBian.lowerGua = bagua.getBaguaProperties(bagua.getBaguaNumber(bianInnerGua));
        
        console.log('✅ 变卦修复完成:', fixedBian.lines);
        
        return {
          ...data,
          hexagrams: {
            ...data.hexagrams,
            bian: fixedBian
          }
        };
      } catch (error) {
        console.error('❌ 修复失败:', error.message);
        return data;
      }
    }
  }
  
  console.log('✅ 数据无需修复');
  return data;
}

// 验证修复结果
function validateFix(originalData, fixedData) {
  console.log('🔍 验证修复结果...');
  
  const originalCheck = checkDivinationDataConsistency(originalData);
  const fixedCheck = checkDivinationDataConsistency(fixedData);
  
  console.log('修复前:', originalCheck.isValid ? '✅ 正常' : '❌ 有问题');
  console.log('修复后:', fixedCheck.isValid ? '✅ 正常' : '❌ 仍有问题');
  
  return fixedCheck.isValid;
}

// 导出工具函数
module.exports = {
  checkDivinationDataConsistency,
  fixDivinationData,
  validateFix
};
