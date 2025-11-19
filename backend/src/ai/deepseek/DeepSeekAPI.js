/**
 * DeepSeek AI API客户端
 * 提供与DeepSeek AI服务的接口封装
 */

const axios = require('axios');
const config = require('../../config');
const logger = require('../../utils/logger');

class DeepSeekAPI {
  constructor() {
    this.config = config.ai.deepseek;
    this.client = axios.create({
      baseURL: this.config.apiUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        logger.debug('DeepSeek API请求', {
          url: config.url,
          method: config.method,
          data: config.data ? '已发送' : '无数据'
        });
        return config;
      },
      (error) => {
        logger.error('DeepSeek API请求错误', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        logger.debug('DeepSeek API响应', {
          status: response.status,
          data: response.data ? '已接收' : '无数据'
        });
        return response;
      },
      (error) => {
        logger.error('DeepSeek API响应错误', {
          status: error.response?.status,
          message: error.response?.data?.error?.message || error.message
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 生成AI回答（带智能重试机制）
   * @param {string} prompt - 提示词
   * @param {Object} options - 可选参数
   * @returns {Promise<Object>} AI回答结果
   */
  async generateResponse(prompt, options = {}) {
    const maxRetries = options.maxRetries || 2;
    const baseTimeout = options.timeout || this.config.timeout;
    let lastError;

    // 记录请求开始时间
    const requestStartTime = Date.now();
    logger.info('DeepSeek AI请求开始', {
      promptLength: prompt.length,
      maxRetries,
      timeout: baseTimeout,
      model: options.model || this.config.model
    });

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        // 动态调整超时时间：每次重试增加超时时间
        const dynamicTimeout = baseTimeout * (1 + (attempt - 1) * 0.5);
        
        // 更新客户端超时配置
        this.client.defaults.timeout = dynamicTimeout;

        const requestData = {
          model: options.model || this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: options.maxTokens || this.config.maxTokens,
          temperature: options.temperature || this.config.temperature,
          stream: false
        };

        logger.info(`DeepSeek AI请求尝试 ${attempt}/${maxRetries + 1}`, {
          timeout: dynamicTimeout,
          promptPreview: prompt.substring(0, 50) + '...'
        });

        const response = await this.client.post('/chat/completions', requestData);

        if (response.data && response.data.choices && response.data.choices.length > 0) {
          const result = {
            content: response.data.choices[0].message.content,
            usage: response.data.usage,
            model: response.data.model,
            timestamp: new Date().toISOString(),
            attempt: attempt,
            totalDuration: Date.now() - requestStartTime
          };

          logger.info('DeepSeek AI回答生成成功', {
            attempt,
            promptLength: prompt.length,
            responseLength: result.content.length,
            tokensUsed: result.usage,
            totalDuration: `${result.totalDuration}ms`
          });

          return result;
        } else {
          throw new Error('DeepSeek API返回格式异常');
        }
      } catch (error) {
        lastError = error;
        const isLastAttempt = attempt === maxRetries + 1;
        
        logger.warn(`DeepSeek AI请求失败 (尝试 ${attempt}/${maxRetries + 1})`, {
          error: error.message,
          code: error.code,
          isTimeout: error.code === 'ECONNABORTED',
          isLastAttempt,
          responseStatus: error.response?.status
        });

        // 如果不是最后一次尝试，且是可重试的错误，则等待后重试
        if (!isLastAttempt && this.shouldRetry(error)) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避，最大5秒
          logger.info(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // 如果是最后一次尝试或不可重试的错误，直接抛出
        break;
      }
    }

    // 所有尝试都失败了
    const totalDuration = Date.now() - requestStartTime;
    logger.error('DeepSeek AI回答生成失败（所有重试均失败）', {
      totalAttempts: maxRetries + 1,
      totalDuration: `${totalDuration}ms`,
      finalError: lastError.message,
      prompt: prompt.substring(0, 100) + '...'
    });
    
    throw new Error(`DeepSeek AI服务错误: ${lastError.message}`);
  }

  /**
   * 判断是否应该重试
   * @param {Error} error - 错误对象
   * @returns {boolean} 是否应该重试
   */
  shouldRetry(error) {
    // 超时错误
    if (error.code === 'ECONNABORTED') {
      return true;
    }
    
    // 网络错误
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      return true;
    }
    
    // 5xx服务器错误
    if (error.response && error.response.status >= 500) {
      return true;
    }
    
    // 429 限流错误
    if (error.response && error.response.status === 429) {
      return true;
    }
    
    return false;
  }

  /**
   * 批量生成回答
   * @param {Array} prompts - 提示词数组
   * @param {Object} options - 可选参数
   * @returns {Promise<Array>} 回答结果数组
   */
  async batchGenerate(prompts, options = {}) {
    const results = [];
    const batchSize = options.batchSize || 5;
    
    for (let i = 0; i < prompts.length; i += batchSize) {
      const batch = prompts.slice(i, i + batchSize);
      const batchPromises = batch.map(prompt => 
        this.generateResponse(prompt, options)
      );
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // 批次间延迟，避免API限流
        if (i + batchSize < prompts.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error('批量生成失败', { batch: i / batchSize + 1, error: error.message });
        throw error;
      }
    }
    
    return results;
  }

  /**
   * 检查API连接状态
   * @returns {Promise<boolean>} 连接状态
   */
  async checkConnection() {
    try {
      const testPrompt = '你好，请回复"连接正常"';
      const response = await this.generateResponse(testPrompt);
      return response && response.content.includes('连接正常');
    } catch (error) {
      logger.error('DeepSeek API连接检查失败', error);
      return false;
    }
  }

  /**
   * 获取模型信息
   * @returns {Promise<Object>} 模型信息
   */
  async getModelInfo() {
    try {
      const response = await this.client.get('/models');
      return response.data;
    } catch (error) {
      logger.error('获取DeepSeek模型信息失败', error);
      throw error;
    }
  }

  /**
   * 生成梅花易数解读
   * @param {Object} divinationData - 占卜数据
   * @param {string} question - 用户问题
   * @returns {Promise<Object>} 解读结果
   */
  async generateDivinationInterpretation(divinationData, question) {
    try {
      const prompt = this.buildDivinationPrompt(divinationData, question);
      const response = await this.generateResponse(prompt, {
        temperature: 0.8, // 稍微提高创造性
        maxTokens: 2000
      });

      return {
        interpretation: response.content,
        divinationData: divinationData,
        question: question,
        timestamp: response.timestamp,
        model: response.model
      };
    } catch (error) {
      logger.error('生成梅花易数解读失败', {
        error: error.message,
        question: question.substring(0, 50) + '...'
      });
      throw error;
    }
  }

  /**
   * 构建梅花易数解读提示词
   * @param {Object} divinationData - 占卜数据
   * @param {string} question - 用户问题
   * @returns {string} 构建的提示词
   */
  buildDivinationPrompt(divinationData, question) {
    // 分析问题类型，提供针对性的解读角度
    const questionType = this.analyzeQuestionType(question);
    
    // 获取当前时间信息
    const currentTime = new Date();
    const currentYear = currentTime.getFullYear();
    const currentMonth = currentTime.getMonth() + 1;
    const currentDate = currentTime.getDate();
    const formattedTime = `${currentYear}年${currentMonth}月${currentDate}日`;
    
    return `你是命理学大师，精通梅花易数。请解读以下占卜：

问题：${question}
主卦：${divinationData.mainHexagram || '未知'}
变卦：${divinationData.changingHexagram || '未知'}
互卦：${divinationData.mutualHexagram || '未知'}
动爻：${divinationData.movingLine ? `第${divinationData.movingLine}爻` : '无'}
五行：本卦${divinationData.fiveElements?.ben || '未知'} → 变卦${divinationData.fiveElements?.bian || '未知'}
运势：${divinationData.fiveElements?.fortune || '未知'}

⚠️ 重要时间提醒：
- 当前日期：${formattedTime}
- 请基于当前时间（${currentYear}年）进行分析，不要使用过时的年份
- 如果提到节气或特定时间，请确保与当前时间相符

请从以下角度分析：
1. 卦象含义：解释主卦、变卦、互卦的基本含义
2. 问题分析：结合"${question}"，从${questionType}角度解读
3. 体用关系：分析体卦和用卦关系，判断吉凶
4. 五行生克：分析五行关系对问题的影响
5. 具体建议：给出针对性建议和注意事项

用温和专业的语调，确保解读与问题高度相关。`;
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
    
    // 人际关系问题
    if (questionLower.includes('朋友') || questionLower.includes('人际') || 
        questionLower.includes('社交') || questionLower.includes('家人') || 
        questionLower.includes('父母') || questionLower.includes('子女')) {
      return '人际关系';
    }
    
    // 决策问题
    if (questionLower.includes('选择') || questionLower.includes('决定') || 
        questionLower.includes('应该') || questionLower.includes('是否') || 
        questionLower.includes('怎么办') || questionLower.includes('如何')) {
      return '决策/选择';
    }
    
    return '综合/其他';
  }

  /**
   * 根据问题类型获取上下文指导
   * @param {string} questionType - 问题类型
   * @returns {string} 上下文指导
   */
  getContextGuidance(questionType) {
    const guidanceMap = {
      '感情/爱情': `请重点关注：
- 感情发展趋势和双方关系动态
- 情感沟通和相处方式
- 感情中的机遇和挑战
- 关于爱情的具体建议`,
      
      '工作/事业': `请重点关注：
- 事业发展方向和机遇
- 职场人际关系和合作
- 工作能力和技能提升
- 职业规划建议`,
      
      '财运/投资': `请重点关注：
- 财运走势和投资时机
- 理财策略和风险控制
- 收入来源和支出管理
- 具体的财务建议`,
      
      '健康/身体': `请重点关注：
- 身体状况和健康趋势
- 养生保健方法
- 疾病预防和治疗
- 生活作息建议`,
      
      '学业/教育': `请重点关注：
- 学习状态和效果
- 考试运势和准备
- 教育选择和方向
- 学习方法和建议`,
      
      '人际关系': `请重点关注：
- 人际关系的和谐度
- 沟通方式和技巧
- 社交圈子的影响
- 人际交往建议`,
      
      '决策/选择': `请重点关注：
- 选择的利弊分析
- 时机和条件评估
- 风险和机遇权衡
- 具体的决策建议`,
      
      '综合/其他': `请重点关注：
- 整体运势和趋势
- 主要机遇和挑战
- 综合发展建议
- 需要注意的方面`
    };
    
    return guidanceMap[questionType] || guidanceMap['综合/其他'];
  }
}

module.exports = DeepSeekAPI;
