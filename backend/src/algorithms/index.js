/**
 * 梅花心易算法模块主入口
 * 提供统一的算法接口
 */

const MeihuaDivinationCore = require('./core/meihuaDivinationCore');
const BaguaSystem = require('./core/baguaSystem');
const FiveElementsSystem = require('./core/fiveElementsSystem');
const DivinationValidator = require('./validators/divinationValidator');

/**
 * 梅花心易算法管理器
 */
class MeihuaAlgorithmManager {
  constructor() {
    this.divinationCore = new MeihuaDivinationCore();
    this.baguaSystem = new BaguaSystem();
    this.fiveElementsSystem = new FiveElementsSystem();
    this.validator = new DivinationValidator();
  }

  /**
   * 执行占卜
   * @param {string} question - 占卜问题
   * @param {Object} options - 占卜选项
   * @returns {Promise<Object>} 占卜结果
   */
  async performDivination(question, options = {}) {
    // 验证输入 - 修正验证参数格式
    const validation = this.validator.validateDivinationRequest({
      question,
      options: {
        method: options.method,
        hour: options.hour
      }
    });

    if (!validation.isValid) {
      throw new Error(`输入验证失败: ${validation.errors.join(', ')}`);
    }

    // 执行占卜
    return await this.divinationCore.performDivination(question, options);
  }

  /**
   * 获取八卦信息
   * @param {number} baguaNumber - 八卦编号
   * @returns {Object} 八卦信息
   */
  getBaguaInfo(baguaNumber) {
    return this.baguaSystem.getBaguaProperties(baguaNumber);
  }

  /**
   * 根据三爻获取八卦信息
   * @param {Array} lines - 三爻数组
   * @returns {Object} 八卦信息
   */
  getBaguaInfoByLines(lines) {
    return this.baguaSystem.getBaguaPropertiesByLines(lines);
  }

  /**
   * 分析五行关系
   * @param {string} element1 - 第一个五行
   * @param {string} element2 - 第二个五行
   * @returns {Object} 五行关系分析
   */
  analyzeElementRelationship(element1, element2) {
    return this.fiveElementsSystem.getElementRelationship(element1, element2);
  }

  /**
   * 验证占卜输入
   * @param {Object} request - 占卜请求
   * @returns {Object} 验证结果
   */
  validateDivinationRequest(request) {
    return this.validator.validateDivinationRequest(request);
  }

  /**
   * 获取系统信息
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    return {
      name: '梅花心易算法系统',
      version: '1.0.0',
      description: '基于传统梅花易数的智能占卜算法',
      features: [
        '随机起卦',
        '三卦分析（本卦、互卦、变卦）',
        '体用关系分析',
        '五行生克分析',
        '六十四卦解析',
        '综合占卜解读'
      ],
      components: {
        divinationCore: '占卜核心算法',
        baguaSystem: '八卦系统',
        fiveElementsSystem: '五行系统',
        validator: '输入验证器'
      }
    };
  }
}

// 创建默认实例
const algorithmManager = new MeihuaAlgorithmManager();

// 导出主要接口
module.exports = {
  // 主要算法管理器
  MeihuaAlgorithmManager,
  
  // 默认实例
  algorithmManager,
  
  // 核心组件
  MeihuaDivinationCore,
  BaguaSystem,
  FiveElementsSystem,
  DivinationValidator,
  
  // 便捷方法
  performDivination: (question, options) => algorithmManager.performDivination(question, options),
  getBaguaInfo: (number) => algorithmManager.getBaguaInfo(number),
  getBaguaInfoByLines: (lines) => algorithmManager.getBaguaInfoByLines(lines),
  analyzeElementRelationship: (element1, element2) => algorithmManager.analyzeElementRelationship(element1, element2),
  validateDivinationRequest: (request) => algorithmManager.validateDivinationRequest(request),
  getSystemInfo: () => algorithmManager.getSystemInfo()
};

