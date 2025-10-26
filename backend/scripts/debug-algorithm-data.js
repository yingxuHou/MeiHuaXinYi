/**
 * 调试算法返回的数据结构
 */

const { algorithmManager } = require('../src/algorithms');

async function debugAlgorithmData() {
  try {
    console.log('🔍 调试算法返回的数据结构...\n');
    
    const result = await algorithmManager.performDivination('我的事业运势如何？', {
      method: 'time',
      params: {}
    });

    console.log('📊 完整数据结构:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 关键字段分析:');
    console.log('question:', typeof result.question, '=', result.question);
    console.log('hexagrams:', typeof result.hexagrams, '=', !!result.hexagrams);
    console.log('hexagrams.ben:', typeof result.hexagrams?.ben, '=', !!result.hexagrams?.ben);
    console.log('hexagrams.hu:', typeof result.hexagrams?.hu, '=', !!result.hexagrams?.hu);
    console.log('hexagrams.bian:', typeof result.hexagrams?.bian, '=', !!result.hexagrams?.bian);
    console.log('movingLine:', typeof result.movingLine, '=', result.movingLine);
    console.log('wuxing:', typeof result.wuxing, '=', !!result.wuxing);
    console.log('interpretation:', typeof result.interpretation, '=', !!result.interpretation);
    
    if (result.wuxing) {
      console.log('\n🔍 wuxing字段分析:');
      console.log('wuxing.fortune:', typeof result.wuxing.fortune, '=', result.wuxing.fortune);
      console.log('wuxing.timing:', typeof result.wuxing.timing, '=', result.wuxing.timing);
      console.log('wuxing.favorableElements:', typeof result.wuxing.favorableElements, '=', result.wuxing.favorableElements);
    }
    
    if (result.interpretation) {
      console.log('\n🔍 interpretation字段分析:');
      console.log('interpretation.summary:', typeof result.interpretation.summary, '=', result.interpretation.summary);
      console.log('interpretation.advice:', typeof result.interpretation.advice, '=', result.interpretation.advice);
      console.log('interpretation.confidence:', typeof result.interpretation.confidence, '=', result.interpretation.confidence);
    }
    
  } catch (error) {
    console.error('❌ 调试失败:', error.message);
    console.error('错误详情:', error.stack);
  }
}

debugAlgorithmData();

