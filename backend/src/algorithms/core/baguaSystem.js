/**
 * 八卦系统核心模块
 * 负责八卦数据的处理和卦象分析
 */

const { BAGUA_DATA } = require('../data/baguaData');

class BaguaSystem {
  constructor() {
    this.baguaData = BAGUA_DATA;
  }

  /**
   * 根据三爻数组获取八卦编号
   * @param {Array} lines - 三爻数组 [上爻, 中爻, 下爻]
   * @returns {number} 八卦编号 (1-8)
   */
  getBaguaNumber(lines) {
    if (!Array.isArray(lines) || lines.length !== 3) {
      throw new Error('三爻数组必须包含3个元素');
    }

    // 将三爻数组转换为字符串，然后查找对应的八卦
    const linesStr = lines.join('');
    
    for (const [number, data] of Object.entries(this.baguaData)) {
      if (data.lines.join('') === linesStr) {
        return parseInt(number);
      }
    }
    
    throw new Error(`未找到对应的八卦: ${linesStr}`);
  }

  /**
   * 根据八卦编号获取八卦属性
   * @param {number} number - 八卦编号 (1-8)
   * @returns {Object} 八卦属性对象
   */
  getBaguaProperties(number) {
    if (!this.baguaData[number]) {
      throw new Error(`无效的八卦编号: ${number}`);
    }

    return {
      number: number,
      name: this.baguaData[number].name,
      symbol: this.baguaData[number].symbol,
      element: this.baguaData[number].element,
      nature: this.baguaData[number].nature,
      lines: [...this.baguaData[number].lines]
    };
  }

  /**
   * 根据三爻数组获取八卦属性
   * @param {Array} lines - 三爻数组
   * @returns {Object} 八卦属性对象
   */
  getBaguaPropertiesByLines(lines) {
    const number = this.getBaguaNumber(lines);
    return this.getBaguaProperties(number);
  }

  /**
   * 获取八卦的五行属性
   * @param {Array} lines - 三爻数组
   * @returns {string} 五行属性
   */
  getBaguaElement(lines) {
    const properties = this.getBaguaPropertiesByLines(lines);
    return properties.element;
  }

  /**
   * 获取八卦的自然属性
   * @param {Array} lines - 三爻数组
   * @returns {string} 自然属性
   */
  getBaguaNature(lines) {
    const properties = this.getBaguaPropertiesByLines(lines);
    return properties.nature;
  }

  /**
   * 创建六十四卦
   * @param {number} upperGua - 上卦编号
   * @param {number} lowerGua - 下卦编号
   * @returns {Object} 六十四卦对象
   */
  createHexagram(upperGua, lowerGua) {
    const upperProperties = this.getBaguaProperties(upperGua);
    const lowerProperties = this.getBaguaProperties(lowerGua);
    
    // 计算六十四卦编号
    const hexagramNumber = this.getHexagramNumber(upperGua, lowerGua);
    
    // 生成六爻数组（从下往上：初爻到上爻）
    const lines = [
      ...lowerProperties.lines, // 下卦三爻
      ...upperProperties.lines  // 上卦三爻
    ];

    return {
      id: hexagramNumber,
      upperGua: upperProperties,
      lowerGua: lowerProperties,
      lines: lines,
      name: this.getHexagramName(hexagramNumber)
    };
  }

  /**
   * 根据上下卦编号计算六十四卦编号
   * @param {number} upperGua - 上卦编号
   * @param {number} lowerGua - 下卦编号
   * @returns {number} 六十四卦编号
   */
  getHexagramNumber(upperGua, lowerGua) {
    // 六十四卦编号计算：上卦编号 * 8 + 下卦编号
    return (upperGua - 1) * 8 + lowerGua;
  }

  /**
   * 根据六十四卦编号获取卦名
   * @param {number} hexagramNumber - 六十四卦编号
   * @returns {string} 卦名
   */
  getHexagramName(hexagramNumber) {
    // 这里可以扩展为完整的六十四卦名称映射
    // 暂时返回基础格式
    return `第${hexagramNumber}卦`;
  }

  /**
   * 验证三爻数组是否有效
   * @param {Array} lines - 三爻数组
   * @returns {boolean} 是否有效
   */
  validateLines(lines) {
    if (!Array.isArray(lines) || lines.length !== 3) {
      return false;
    }
    
    return lines.every(line => line === 0 || line === 1);
  }

  /**
   * 获取所有八卦数据
   * @returns {Object} 所有八卦数据
   */
  getAllBaguaData() {
    return { ...this.baguaData };
  }
}

module.exports = BaguaSystem;

