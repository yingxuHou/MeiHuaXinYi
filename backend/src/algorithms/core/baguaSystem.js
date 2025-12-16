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
    // 六十四卦名称映射
    const hexagramNames = {
      1: '乾', 2: '坤', 3: '屯', 4: '蒙', 5: '需', 6: '讼', 7: '师', 8: '比',
      9: '小畜', 10: '履', 11: '泰', 12: '否', 13: '同人', 14: '大有', 15: '谦', 16: '豫',
      17: '随', 18: '蛊', 19: '临', 20: '观', 21: '噬嗑', 22: '贲', 23: '剥', 24: '复',
      25: '无妄', 26: '大畜', 27: '颐', 28: '大过', 29: '坎', 30: '离', 31: '咸', 32: '恒',
      33: '遁', 34: '大壮', 35: '晋', 36: '明夷', 37: '家人', 38: '睽', 39: '蹇', 40: '解',
      41: '损', 42: '益', 43: '夬', 44: '姤', 45: '萃', 46: '升', 47: '困', 48: '井',
      49: '革', 50: '鼎', 51: '震', 52: '艮', 53: '渐', 54: '归妹', 55: '丰', 56: '旅',
      57: '巽', 58: '兑', 59: '涣', 60: '节', 61: '中孚', 62: '小过', 63: '既济', 64: '未济'
    };

    return hexagramNames[hexagramNumber] || `第${hexagramNumber}卦`;
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
   * 根据八卦编号获取三爻数组
   * @param {number} baguaNumber - 八卦编号 (1-8)
   * @returns {Array} 三爻数组
   */
  getBaguaLines(baguaNumber) {
    if (baguaNumber < 1 || baguaNumber > 8) {
      throw new Error('八卦编号必须在1-8之间');
    }

    // 根据八卦编号返回对应的三爻数组
    // 这里使用先天八卦的排列
    const baguaLinesMap = {
      1: [1, 1, 1], // 乾
      2: [0, 0, 0], // 坤
      3: [0, 0, 1], // 震
      4: [0, 1, 0], // 坎
      5: [1, 0, 0], // 艮
      6: [1, 1, 0], // 巽
      7: [1, 0, 1], // 离
      8: [0, 1, 1]  // 兑
    };

    return baguaLinesMap[baguaNumber];
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

