/**
 * 五行系统核心模块
 * 负责五行生克关系分析和体用卦象分析
 */

const { FIVE_ELEMENTS, TI_YONG_ANALYSIS } = require('../data/baguaData');

class FiveElementsSystem {
  constructor() {
    this.elements = ['金', '木', '水', '火', '土'];
    this.generation = FIVE_ELEMENTS.generation;
    this.destruction = FIVE_ELEMENTS.destruction;
    this.tiYongAnalysis = TI_YONG_ANALYSIS;
  }

  /**
   * 分析五行关系
   * @param {string} element1 - 第一个五行
   * @param {string} element2 - 第二个五行
   * @returns {Object} 五行关系分析结果
   */
  getElementRelationship(element1, element2) {
    if (!this.elements.includes(element1) || !this.elements.includes(element2)) {
      throw new Error('无效的五行属性');
    }

    if (element1 === element2) {
      return {
        type: 'same',
        relationship: '体用比和',
        strength: 'neutral',
        meaning: '同我',
        description: '体卦与用卦五行相同，表示和谐统一，事情顺利'
      };
    }

    // 检查相生关系
    if (this.generation[element1] === element2) {
      return {
        type: 'generation',
        relationship: '体生用',
        strength: 'weak',
        meaning: '耗能量，泄气，自身不足还要给，主损失，耗损',
        description: '体卦生用卦，表示自己付出多但收获少，容易损耗'
      };
    }

    if (this.generation[element2] === element1) {
      return {
        type: 'generation',
        relationship: '用生体',
        strength: 'strong',
        meaning: '生我，助我',
        description: '用卦生体卦，表示外在环境或他人会帮助自己，事情容易成功'
      };
    }

    // 检查相克关系
    if (this.destruction[element1] === element2) {
      return {
        type: 'destruction',
        relationship: '体克用',
        strength: 'strong',
        meaning: '我克，需要付出，但有掌握权，结果好',
        description: '体卦克用卦，表示需要努力但能掌控局面，最终结果良好'
      };
    }

    if (this.destruction[element2] === element1) {
      return {
        type: 'destruction',
        relationship: '用克体',
        strength: 'weak',
        meaning: '周围人事阻我，挡我，困难困苦',
        description: '用卦克体卦，表示外在环境或他人对自己不利，困难重重'
      };
    }

    // 其他情况（如金与火、木与水等）
    return {
      type: 'neutral',
      relationship: '平',
      strength: 'neutral',
      meaning: '平',
      description: '五行关系平和，无明显的生克关系'
    };
  }

  /**
   * 计算体用关系的吉凶
   * @param {string} relationship - 体用关系类型
   * @returns {Object} 吉凶分析结果
   */
  calculateFortune(relationship) {
    const analysis = this.tiYongAnalysis;
    
    if (analysis.good[relationship]) {
      return {
        ...analysis.good[relationship],
        category: 'good'
      };
    } else if (analysis.bad[relationship]) {
      return {
        ...analysis.bad[relationship],
        category: 'bad'
      };
    } else {
      return {
        level: '平',
        meaning: '平',
        description: '关系平和，无明显的吉凶倾向',
        category: 'neutral'
      };
    }
  }

  /**
   * 分析体用卦象的完整关系
   * @param {Array} tiGua - 体卦三爻数组
   * @param {Array} yongGua - 用卦三爻数组
   * @param {Object} baguaSystem - 八卦系统实例
   * @returns {Object} 完整的体用分析结果
   */
  analyzeTiYong(tiGua, yongGua, baguaSystem) {
    // 获取体卦和用卦的五行属性
    const tiElement = baguaSystem.getBaguaElement(tiGua);
    const yongElement = baguaSystem.getBaguaElement(yongGua);
    
    // 获取体卦和用卦的属性
    const tiProperties = baguaSystem.getBaguaPropertiesByLines(tiGua);
    const yongProperties = baguaSystem.getBaguaPropertiesByLines(yongGua);

    // 分析五行关系
    const relationship = this.getElementRelationship(tiElement, yongElement);
    
    // 计算吉凶
    const fortune = this.calculateFortune(relationship.relationship);

    return {
      ti: {
        gua: tiGua,
        properties: tiProperties,
        element: tiElement
      },
      yong: {
        gua: yongGua,
        properties: yongProperties,
        element: yongElement
      },
      relationship: relationship,
      fortune: fortune,
      summary: {
        tiYong: `${tiProperties.name}(${tiElement}) vs ${yongProperties.name}(${yongElement})`,
        relationship: relationship.relationship,
        fortune: fortune.level,
        meaning: fortune.meaning
      }
    };
  }

  /**
   * 获取五行相生关系
   * @param {string} element - 五行属性
   * @returns {string|null} 被生的五行
   */
  getGeneratedElement(element) {
    return this.generation[element] || null;
  }

  /**
   * 获取五行相克关系
   * @param {string} element - 五行属性
   * @returns {string|null} 被克的五行
   */
  getDestroyedElement(element) {
    return this.destruction[element] || null;
  }

  /**
   * 检查两个五行是否相生
   * @param {string} element1 - 第一个五行
   * @param {string} element2 - 第二个五行
   * @returns {boolean} 是否相生
   */
  isGeneration(element1, element2) {
    return this.generation[element1] === element2;
  }

  /**
   * 检查两个五行是否相克
   * @param {string} element1 - 第一个五行
   * @param {string} element2 - 第二个五行
   * @returns {boolean} 是否相克
   */
  isDestruction(element1, element2) {
    return this.destruction[element1] === element2;
  }

  /**
   * 获取所有五行数据
   * @returns {Object} 五行系统数据
   */
  getAllElementsData() {
    return {
      elements: this.elements,
      generation: this.generation,
      destruction: this.destruction,
      tiYongAnalysis: this.tiYongAnalysis
    };
  }
}

module.exports = FiveElementsSystem;

