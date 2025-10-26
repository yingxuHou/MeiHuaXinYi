/**
 * 梅花易数AI解读服务
 * 使用DeepSeek AI对占卜结果进行专业解读
 */

const AIServiceManager = require('../ai/AIServiceManager');
const logger = require('../utils/logger');

class DivinationInterpretationService {
  constructor() {
    this.aiManager = new AIServiceManager();
  }

  /**
   * 为占卜结果生成AI解读
   * @param {Object} divinationResult - 占卜结果
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} AI解读结果
   */
  async generateAIInterpretation(divinationResult, options = {}) {
    try {
      logger.info('开始生成AI占卜解读', {
        question: divinationResult.question?.substring(0, 50) + '...',
        method: divinationResult.method
      });

      // 构建占卜数据
      const divinationData = this.extractDivinationData(divinationResult);
      
      // 生成AI解读
      const interpretation = await this.aiManager.generateDivinationInterpretation(
        divinationData,
        divinationResult.question,
        options
      );

      // 格式化解读结果
      const formattedInterpretation = this.formatInterpretation(interpretation, divinationResult);

      logger.info('AI占卜解读生成成功', {
        question: divinationResult.question?.substring(0, 50) + '...',
        interpretationLength: formattedInterpretation.content.length
      });

      return {
        success: true,
        data: formattedInterpretation
      };

    } catch (error) {
      logger.error('生成AI占卜解读失败', {
        error: error.message,
        question: divinationResult.question?.substring(0, 50) + '...'
      });

      // 返回降级解读
      return {
        success: false,
        data: this.generateFallbackInterpretation(divinationResult),
        error: error.message
      };
    }
  }

  /**
   * 从占卜结果中提取数据
   * @param {Object} divinationResult - 占卜结果
   * @returns {Object} 提取的占卜数据
   */
  extractDivinationData(divinationResult) {
    const hexagrams = divinationResult.hexagrams || {};
    const analysis = divinationResult.analysis || {};
    const interpretation = divinationResult.interpretation || {};

    // ✅ 添加调试日志
    const extractedData = {
      // 卦象信息
      mainHexagram: hexagrams.ben?.name || '未知',
      changingHexagram: hexagrams.bian?.name || '未知',
      mutualHexagram: hexagrams.hu?.name || '未知',
      
      // 体用关系
      bodyHexagram: hexagrams.ben?.name || '未知',
      useHexagram: hexagrams.hu?.name || '未知',
      
      // 五行信息
      fiveElements: {
        ben: analysis.wuxing?.ben || '未知',
        hu: analysis.wuxing?.hu || '未知',
        bian: analysis.wuxing?.bian || '未知',
        fortune: analysis.wuxing?.fortune || '未知'
      },
      
      // 卦象描述
      hexagramImage: this.buildHexagramDescription(hexagrams),
      
      // 动爻信息
      movingLine: divinationResult.movingLine || null,
      
      // 起卦方法
      method: divinationResult.method || '未知',
      
      // 时间信息
      timestamp: divinationResult.timestamp || new Date(),
      
      // 添加更多有用信息
      hexagramNumbers: {
        ben: hexagrams.ben?.id || null,
        bian: hexagrams.bian?.id || null,
        hu: hexagrams.hu?.id || null
      },
      
      // 卦象关键词
      keywords: {
        ben: hexagrams.ben?.keywords || [],
        bian: hexagrams.bian?.keywords || [],
        hu: hexagrams.hu?.keywords || []
      },
      
      // 原始解读信息（作为参考）
      originalInterpretation: {
        summary: interpretation.summary || '',
        advice: interpretation.advice || '',
        precautions: interpretation.precautions || ''
      },
      
      // 运势分析
      fortuneAnalysis: {
        overall: analysis.fortune || '未知',
        timing: analysis.timing || '未知',
        favorableElements: analysis.wuxing?.favorableElements || []
      }
    };

    // ✅ 添加调试日志，确认传递的是真实数据
    logger.info('📊 提取占卜数据供AI解读', {
      mainHexagram: extractedData.mainHexagram,
      changingHexagram: extractedData.changingHexagram,
      mutualHexagram: extractedData.mutualHexagram,
      movingLine: extractedData.movingLine,
      question: divinationResult.question?.substring(0, 30) + '...'
    });

    return extractedData;
  }

  /**
   * 构建卦象描述
   * @param {Object} hexagrams - 卦象对象
   * @returns {string} 卦象描述
   */
  buildHexagramDescription(hexagrams) {
    const descriptions = [];
    
    if (hexagrams.ben) {
      descriptions.push(`主卦：${hexagrams.ben.name}`);
      if (hexagrams.ben.upperGua && hexagrams.ben.lowerGua) {
        descriptions.push(`上卦：${hexagrams.ben.upperGua.name}(${hexagrams.ben.upperGua.element})`);
        descriptions.push(`下卦：${hexagrams.ben.lowerGua.name}(${hexagrams.ben.lowerGua.element})`);
      }
    }
    
    if (hexagrams.hu) {
      descriptions.push(`互卦：${hexagrams.hu.name}`);
    }
    
    if (hexagrams.bian) {
      descriptions.push(`变卦：${hexagrams.bian.name}`);
    }
    
    return descriptions.join('，');
  }

  /**
   * 格式化解读结果
   * @param {Object} interpretation - AI解读结果
   * @param {Object} divinationResult - 原始占卜结果
   * @returns {Object} 格式化后的解读
   */
  formatInterpretation(interpretation, divinationResult) {
    return {
      // AI解读内容
      content: interpretation.interpretation,
      
      // 原始占卜数据
      divinationData: interpretation.divinationData,
      
      // 用户问题
      question: interpretation.question,
      
      // AI模型信息
      aiModel: interpretation.model,
      
      // 生成时间
      generatedAt: interpretation.timestamp,
      
      // 原始占卜结果（用于参考）
      originalResult: {
        hexagrams: divinationResult.hexagrams,
        analysis: divinationResult.analysis,
        method: divinationResult.method,
        movingLine: divinationResult.movingLine
      },
      
      // 元数据
      metadata: {
        aiProvider: 'DeepSeek',
        interpretationType: 'ai-generated',
        confidence: 'high',
        language: 'zh-CN'
      }
    };
  }

  /**
   * 生成降级解读（当AI服务不可用时）
   * @param {Object} divinationResult - 占卜结果
   * @returns {Object} 降级解读
   */
  generateFallbackInterpretation(divinationResult) {
    const hexagrams = divinationResult.hexagrams || {};
    const analysis = divinationResult.analysis || {};
    const question = divinationResult.question || '您的问题';
    
    // 分析问题类型
    const questionType = this.analyzeQuestionType(question);
    
    // 根据问题类型生成不同的解读
    let specificAdvice = '';
    switch (questionType) {
      case '感情/爱情':
        specificAdvice = `
**感情建议：**
- 当前感情状态较为稳定，适合深入沟通
- 建议多关注对方的感受，保持情感交流
- 近期可能有感情上的重要进展`;
        break;
      case '工作/事业':
        specificAdvice = `
**事业建议：**
- 当前工作运势良好，适合主动出击
- 建议把握机会，展现个人能力
- 近期可能有职位或薪资方面的好消息`;
        break;
      case '财运/投资':
        specificAdvice = `
**财运建议：**
- 当前财运较为稳定，适合稳健投资
- 建议谨慎决策，避免盲目跟风
- 近期可能有不错的收益机会`;
        break;
      case '健康/身体':
        specificAdvice = `
**健康建议：**
- 当前身体状况良好，但需注意保养
- 建议保持规律作息，适量运动
- 近期适合进行健康检查或调理`;
        break;
      case '学业/教育':
        specificAdvice = `
**学业建议：**
- 当前学习状态良好，适合深入学习
- 建议制定学习计划，保持专注
- 近期可能有考试或学习上的突破`;
        break;
      default:
        specificAdvice = `
**综合建议：**
- 当前运势较为平稳，适合稳步发展
- 建议保持积极心态，把握机会
- 近期可能有重要的发展机遇`;
    }
    
    return {
      content: `根据您的问题"${question}"，结合占卜结果分析：

**卦象分析：**
- 主卦：${hexagrams.ben?.name || '未知'}
- 变卦：${hexagrams.bian?.name || '未知'}
- 互卦：${hexagrams.hu?.name || '未知'}

**五行分析：**
- 本卦五行：${analysis.wuxing?.ben || '未知'}
- 互卦五行：${analysis.wuxing?.hu || '未知'}
- 变卦五行：${analysis.wuxing?.bian || '未知'}
- 整体运势：${analysis.wuxing?.fortune || '未知'}

${specificAdvice}

**解读说明：**
AI解读服务暂时不可用，以上是基础卦象信息。建议您：
1. 参考传统梅花易数理论
2. 结合自身实际情况
3. 稍后重试AI解读功能

*注：此为基础解读，专业AI解读服务正在恢复中。*`,
      
      divinationData: this.extractDivinationData(divinationResult),
      question: divinationResult.question,
      aiModel: 'fallback',
      generatedAt: new Date().toISOString(),
      originalResult: {
        hexagrams: divinationResult.hexagrams,
        analysis: divinationResult.analysis,
        method: divinationResult.method,
        movingLine: divinationResult.movingLine
      },
      metadata: {
        aiProvider: 'fallback',
        interpretationType: 'fallback',
        confidence: 'low',
        language: 'zh-CN',
        questionType: questionType,
        note: 'AI服务不可用，使用个性化降级解读'
      }
    };
  }

  /**
   * 分析问题类型
   * @param {string} question - 用户问题
   * @returns {string} 问题类型
   */
  analyzeQuestionType(question) {
    const questionLower = question.toLowerCase();
    
    // 感情相关问题
    if (questionLower.includes('感情') || questionLower.includes('爱情') || 
        questionLower.includes('恋爱') || questionLower.includes('婚姻') || 
        questionLower.includes('分手') || questionLower.includes('复合') ||
        questionLower.includes('喜欢') || questionLower.includes('对象')) {
      return '感情/爱情';
    }
    
    // 工作事业问题
    if (questionLower.includes('工作') || questionLower.includes('事业') || 
        questionLower.includes('职业') || questionLower.includes('升职') || 
        questionLower.includes('跳槽') || questionLower.includes('创业') ||
        questionLower.includes('面试') || questionLower.includes('同事')) {
      return '工作/事业';
    }
    
    // 财运问题
    if (questionLower.includes('财运') || questionLower.includes('金钱') || 
        questionLower.includes('投资') || questionLower.includes('理财') || 
        questionLower.includes('赚钱') || questionLower.includes('债务')) {
      return '财运/投资';
    }
    
    // 健康问题
    if (questionLower.includes('健康') || questionLower.includes('身体') || 
        questionLower.includes('疾病') || questionLower.includes('治疗') || 
        questionLower.includes('养生') || questionLower.includes('康复')) {
      return '健康/身体';
    }
    
    // 学业问题
    if (questionLower.includes('学习') || questionLower.includes('考试') || 
        questionLower.includes('学业') || questionLower.includes('成绩') || 
        questionLower.includes('升学') || questionLower.includes('教育')) {
      return '学业/教育';
    }
    
    return '综合/其他';
  }

  /**
   * 检查AI服务状态
   * @returns {Promise<Object>} 服务状态
   */
  async checkAIStatus() {
    try {
      const connections = await this.aiManager.checkAllConnections();
      const stats = this.aiManager.getServiceStats();
      
      return {
        success: true,
        data: {
          connections,
          stats,
          available: Object.values(connections).some(status => status === true)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 生成自定义解读（使用自定义提示词）
   * @param {Object} divinationResult - 占卜结果
   * @param {string} customPrompt - 自定义提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} 自定义解读结果
   */
  async generateCustomInterpretation(divinationResult, customPrompt, options = {}) {
    try {
      const divinationData = this.extractDivinationData(divinationResult);
      
      // 构建完整的提示词
      const fullPrompt = this.buildCustomPrompt(divinationData, divinationResult.question, customPrompt);
      
      // 调用AI生成回答
      const response = await this.aiManager.generateResponse(fullPrompt, {
        temperature: options.temperature || 0.8,
        maxTokens: options.maxTokens || 2000,
        service: options.service || 'deepseek'
      });

      return {
        success: true,
        data: {
          content: response.content,
          divinationData: divinationData,
          question: divinationResult.question,
          customPrompt: customPrompt,
          aiModel: response.model,
          generatedAt: response.timestamp,
          metadata: {
            aiProvider: 'DeepSeek',
            interpretationType: 'custom',
            confidence: 'high',
            language: 'zh-CN'
          }
        }
      };

    } catch (error) {
      logger.error('生成自定义解读失败', {
        error: error.message,
        customPrompt: customPrompt.substring(0, 100) + '...'
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 构建自定义提示词
   * @param {Object} divinationData - 占卜数据
   * @param {string} question - 用户问题
   * @param {string} customPrompt - 自定义提示词
   * @returns {string} 完整的提示词
   */
  buildCustomPrompt(divinationData, question, customPrompt) {
    return `${customPrompt}

占卜问题：${question}

占卜结果：
- 主卦：${divinationData.mainHexagram}
- 变卦：${divinationData.changingHexagram}
- 互卦：${divinationData.mutualHexagram}
- 体卦：${divinationData.bodyHexagram}
- 用卦：${divinationData.useHexagram}
- 五行：${JSON.stringify(divinationData.fiveElements)}
- 卦象：${divinationData.hexagramImage}
- 起卦方法：${divinationData.method}

请根据以上信息进行解读。`;
  }
}

module.exports = DivinationInterpretationService;
