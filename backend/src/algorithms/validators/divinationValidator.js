/**
 * 占卜输入验证器
 * 验证占卜请求的输入参数
 */

class DivinationValidator {
  constructor() {
    this.maxQuestionLength = 200;
    this.minQuestionLength = 5;
  }

  /**
   * 验证占卜问题
   * @param {string} question - 占卜问题
   * @returns {Object} 验证结果
   */
  validateQuestion(question) {
    const errors = [];

    if (!question || typeof question !== 'string') {
      errors.push('占卜问题不能为空');
    } else {
      if (question.length < this.minQuestionLength) {
        errors.push(`占卜问题至少需要${this.minQuestionLength}个字符`);
      }
      if (question.length > this.maxQuestionLength) {
        errors.push(`占卜问题不能超过${this.maxQuestionLength}个字符`);
      }
      
      // 检查是否包含敏感词汇
      const sensitiveWords = ['政治', '暴力', '色情', '赌博'];
      const hasSensitiveWords = sensitiveWords.some(word => question.includes(word));
      if (hasSensitiveWords) {
        errors.push('占卜问题包含不当内容');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证时辰参数
   * @param {number} hour - 时辰（0-23）
   * @returns {Object} 验证结果
   */
  validateHour(hour) {
    const errors = [];

    if (hour === undefined || hour === null) {
      // 时辰为空是允许的，会使用当前时间
      return { isValid: true, errors: [] };
    }

    if (typeof hour !== 'number' || !Number.isInteger(hour)) {
      errors.push('时辰必须是整数');
    } else if (hour < 0 || hour > 23) {
      errors.push('时辰必须在0-23之间');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证占卜选项
   * @param {Object} options - 占卜选项
   * @returns {Object} 验证结果
   */
  validateOptions(options) {
    const errors = [];

    if (!options || typeof options !== 'object') {
      return { isValid: true, errors: [] };
    }

    // 验证时辰
    if (options.hour !== undefined) {
      const hourValidation = this.validateHour(options.hour);
      if (!hourValidation.isValid) {
        errors.push(...hourValidation.errors);
      }
    }

    // 验证其他选项
    if (options.method && !['time', 'number', 'manual'].includes(options.method)) {
      errors.push('起卦方法必须是time、number或manual');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证完整的占卜请求
   * @param {Object} request - 占卜请求对象
   * @returns {Object} 验证结果
   */
  validateDivinationRequest(request) {
    const errors = [];

    if (!request || typeof request !== 'object') {
      errors.push('占卜请求必须是对象');
      return { isValid: false, errors: errors };
    }

    // 验证问题
    const questionValidation = this.validateQuestion(request.question);
    if (!questionValidation.isValid) {
      errors.push(...questionValidation.errors);
    }

    // 验证选项
    const optionsValidation = this.validateOptions(request.options);
    if (!optionsValidation.isValid) {
      errors.push(...optionsValidation.errors);
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证三爻数组
   * @param {Array} lines - 三爻数组
   * @returns {Object} 验证结果
   */
  validateLines(lines) {
    const errors = [];

    if (!Array.isArray(lines)) {
      errors.push('爻数组必须是数组');
    } else if (lines.length !== 3) {
      errors.push('爻数组必须包含3个元素');
    } else {
      const invalidLines = lines.filter(line => line !== 0 && line !== 1);
      if (invalidLines.length > 0) {
        errors.push('爻数组中的每个元素必须是0或1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证六爻数组
   * @param {Array} lines - 六爻数组
   * @returns {Object} 验证结果
   */
  validateHexagramLines(lines) {
    const errors = [];

    if (!Array.isArray(lines)) {
      errors.push('六爻数组必须是数组');
    } else if (lines.length !== 6) {
      errors.push('六爻数组必须包含6个元素');
    } else {
      const invalidLines = lines.filter(line => line !== 0 && line !== 1);
      if (invalidLines.length > 0) {
        errors.push('六爻数组中的每个元素必须是0或1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证八卦编号
   * @param {number} number - 八卦编号
   * @returns {Object} 验证结果
   */
  validateBaguaNumber(number) {
    const errors = [];

    if (typeof number !== 'number' || !Number.isInteger(number)) {
      errors.push('八卦编号必须是整数');
    } else if (number < 1 || number > 8) {
      errors.push('八卦编号必须在1-8之间');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * 验证动爻位置
   * @param {number} movingLine - 动爻位置
   * @returns {Object} 验证结果
   */
  validateMovingLine(movingLine) {
    const errors = [];

    if (typeof movingLine !== 'number' || !Number.isInteger(movingLine)) {
      errors.push('动爻位置必须是整数');
    } else if (movingLine < 1 || movingLine > 6) {
      errors.push('动爻位置必须在1-6之间');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = DivinationValidator;

