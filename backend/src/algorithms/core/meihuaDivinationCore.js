/**
 * 梅花心易占卜核心算法
 * 实现完整的梅花心易占卜流程
 */

const BaguaSystem = require('./baguaSystem');
const FiveElementsSystem = require('./fiveElementsSystem');
const { HEXAGRAM_DATA } = require('../data/hexagramData');
const { getCurrentTimeInfo, getHourNumber } = require('../utils/timeUtils');

class MeihuaDivinationCore {
  constructor() {
    this.baguaSystem = new BaguaSystem();
    this.fiveElementsSystem = new FiveElementsSystem();
  }

  /**
   * 执行完整的梅花心易占卜
   * @param {string} question - 占卜问题
   * @param {Object} options - 占卜选项
   * @returns {Object} 占卜结果
   */
  async performDivination(question, options = {}) {
    try {
      console.log('🔮 开始执行占卜算法...');
      console.log('📝 占卜方法:', options.method || 'random');

      // 步骤①：生成主卦
      let primaryGua;
      if (options.method === 'manual' && options.params) {
        // 手动起卦
        primaryGua = this.generatePrimaryHexagramManual(options.params);
      } else if (options.method === 'number' && options.params) {
        // 数字起卦
        primaryGua = this.generatePrimaryHexagramNumber(options.params);
      } else {
        // 时间起卦或随机起卦
        primaryGua = this.generatePrimaryHexagramTime(options.params);
      }
      console.log('📊 主卦生成:', primaryGua);

      // 步骤②：分析主卦，计算动爻
      const primaryAnalysis = this.analyzePrimaryGua(primaryGua, options.hour);
      console.log('🔍 主卦分析:', { movingLine: primaryAnalysis.movingLine, outerGuaNumber: primaryAnalysis.outerGuaNumber, innerGuaNumber: primaryAnalysis.innerGuaNumber });

      // 步骤③：生成变卦
      const bianGua = this.generateBianGua(primaryGua, primaryAnalysis.movingLine);
      console.log('🔄 变卦生成:', bianGua);

      // 步骤④：生成互卦
      const huGua = this.generateHuGua(primaryGua);
      console.log('🔗 互卦生成:', huGua);

      // 步骤⑤：确定体用关系
      const tiYongAnalysis = this.determineTiYong(primaryAnalysis.movingLine, primaryGua);
      console.log('⚖️ 体用关系:', { ti: tiYongAnalysis.ti, yong: tiYongAnalysis.yong, tiIsOuter: tiYongAnalysis.tiIsOuter });

      // 步骤⑥：五行分析
      const wuxingAnalysis = this.analyzeFiveElements(tiYongAnalysis.ti, tiYongAnalysis.yong);
      console.log('🌿 五行分析:', wuxingAnalysis);
      
      // 步骤⑦：互卦解析
      const huGuaAnalysis = this.analyzeHuGua(huGua, tiYongAnalysis);
      console.log('🔍 互卦解析:', huGuaAnalysis);
      
      // 生成完整的占卜结果
      const result = this.generateDivinationResult({
        question,
        primaryGua,
        primaryAnalysis,
        bianGua,
        huGua,
        tiYongAnalysis,
        wuxingAnalysis,
        huGuaAnalysis,
        options
      });

      console.log('✅ 占卜算法执行完成');
      return result;
    } catch (error) {
      console.error('❌ 占卜计算失败:', error);
      throw new Error(`占卜计算失败: ${error.message}`);
    }
  }

  /**
   * 步骤①：生成主卦
   * 随机生成六个数字（0或1），按顺序从第1爻开始填充到第6爻
   * @returns {Array} 主卦数组 [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
   * 注意：数组索引从0开始，索引0是第1爻（最下），索引5是第6爻（最上）
   */
  generatePrimaryHexagram() {
    const primaryGua = [];
    // 从第1爻开始填充到第6爻（数组索引0到5）
    for (let i = 0; i < 6; i++) {
      primaryGua[i] = Math.floor(Math.random() * 2); // 0或1
    }
    return primaryGua;
  }

  /**
   * 分析主卦，计算动爻
   * @param {Array} primaryGua - 主卦数组 [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
   * @param {number} hour - 时辰（0-23），可选，默认使用当前北京时间
   * @returns {Object} 主卦分析结果
   */
  analyzePrimaryGua(primaryGua, hour = null) {
    // 读取外卦（第6、5、4爻）和内卦（第3、2、1爻）
    const outerGua = [primaryGua[5], primaryGua[4], primaryGua[3]]; // 外卦（第6、5、4爻）
    const innerGua = [primaryGua[2], primaryGua[1], primaryGua[0]]; // 内卦（第3、2、1爻）
    
    // 获取外卦和内卦的八卦编号
    const outerGuaNumber = this.baguaSystem.getBaguaNumber(outerGua); // t_1
    const innerGuaNumber = this.baguaSystem.getBaguaNumber(innerGua); // t_2
    
    // 获取时辰对应的数字
    let hourNumber;
    let currentTimeInfo;
    
    if (hour !== null) {
      // 如果指定了时辰，使用指定的时辰
      hourNumber = getHourNumber(hour);
      currentTimeInfo = {
        hour: hour,
        hourNumber: hourNumber,
        hourName: this.getHourName(hourNumber),
        formattedTime: `指定时间: ${hour}时`
      };
    } else {
      // 使用当前北京时间
      currentTimeInfo = getCurrentTimeInfo();
      hourNumber = currentTimeInfo.hourNumber;
    }
    
    // 计算动爻：(主卦上卦数字t_1 + 下卦数字t_2 + 求卦时辰) / 6
    const total = outerGuaNumber + innerGuaNumber + hourNumber;
    const movingLine = (total % 6) || 6; // 动爻位置（1-6）
    
    return {
      primaryGua,
      outerGua,
      innerGua,
      outerGuaNumber,
      innerGuaNumber,
      hourNumber,
      movingLine,
      currentTimeInfo,
      primaryHexagram: this.baguaSystem.createHexagram(outerGuaNumber, innerGuaNumber)
    };
  }

  /**
   * 步骤③：生成变卦
   * 根据动爻n，将主卦数组第n个数字阴阳转换（0变1，1变0）
   * @param {Array} primaryGua - 主卦数组
   * @param {number} movingLine - 动爻位置（1-6）
   * @returns {Array} 变卦数组
   */
  generateBianGua(primaryGua, movingLine) {
    const bianGua = [...primaryGua];
    const index = movingLine - 1; // 转换为数组索引
    bianGua[index] = bianGua[index] === 1 ? 0 : 1; // 阴阳转换
    return bianGua;
  }

  /**
   * 步骤④：生成互卦
   * 根据234345顺序取出互卦（第2、3、4、3、4、5爻）
   * @param {Array} primaryGua - 主卦数组 [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
   * @returns {Array} 互卦数组 [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
   */
  generateHuGua(primaryGua) {
    const huGua = [
      primaryGua[1], // 第2爻
      primaryGua[2], // 第3爻
      primaryGua[3], // 第4爻
      primaryGua[2], // 第3爻
      primaryGua[3], // 第4爻
      primaryGua[4]  // 第5爻
    ];
    return huGua;
  }

  /**
   * 步骤⑤：确定体用关系
   * 根据动爻位置确定体用关系
   * @param {number} movingLine - 动爻位置（1-6）
   * @param {Array} primaryGua - 主卦数组 [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
   * @returns {Object} 体用关系分析结果
   */
  determineTiYong(movingLine, primaryGua) {
    const outerGua = [primaryGua[5], primaryGua[4], primaryGua[3]]; // 外卦（第6、5、4爻）
    const innerGua = [primaryGua[2], primaryGua[1], primaryGua[0]]; // 内卦（第3、2、1爻）
    
    let ti, yong, tiIsOuter;
    if (movingLine >= 1 && movingLine <= 3) {
      // 动爻在内卦（第1、2、3爻），内卦为用，外卦为体
      ti = outerGua;
      yong = innerGua;
      tiIsOuter = true;
    } else {
      // 动爻在外卦（第4、5、6爻），外卦为用，内卦为体
      ti = innerGua;
      yong = outerGua;
      tiIsOuter = false;
    }
    
    return {
      ti,
      yong,
      tiIsOuter,
      movingLine,
      outerGua,
      innerGua
    };
  }

  /**
   * 步骤⑥：五行分析
   * 根据体用关系分析五行生克
   * @param {Array} ti - 体卦三爻数组
   * @param {Array} yong - 用卦三爻数组
   * @returns {Object} 五行分析结果
   */
  analyzeFiveElements(ti, yong) {
    return this.fiveElementsSystem.analyzeTiYong(ti, yong, this.baguaSystem);
  }

  /**
   * 步骤⑦：互卦解析
   * 互卦代表的是从主卦到变卦的结果的过程解析
   * 直接从互卦数组里面从第六位往前依次读取，第六-四位是第一个卦象，第三到一是第二个卦象
   * @param {Array} huGua - 互卦数组 [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻]
   * @param {Object} primaryTiYong - 主卦体用关系（保留参数以兼容现有调用）
   * @returns {Object} 互卦分析结果
   */
  analyzeHuGua(huGua, primaryTiYong) {
    // 按照新要求：第六-四位是第一个卦象，第三到一是第二个卦象
    const firstGua = [huGua[5], huGua[4], huGua[3]]; // 第一个卦象（第6、5、4爻）
    const secondGua = [huGua[2], huGua[1], huGua[0]]; // 第二个卦象（第3、2、1爻）
    
    // 获取两个卦象的nature（区分顺序）
    const firstNature = this.baguaSystem.getBaguaNature(firstGua);
    const secondNature = this.baguaSystem.getBaguaNature(secondGua);
    
    // 获取两个卦象的八卦编号
    const firstGuaNumber = this.baguaSystem.getBaguaNumber(firstGua);
    const secondGuaNumber = this.baguaSystem.getBaguaNumber(secondGua);
    
    // 创建六十四卦（第一个卦象为上卦，第二个卦象为下卦）
    const huHexagram = this.baguaSystem.createHexagram(firstGuaNumber, secondGuaNumber);
    
    // 获取六十四卦的解析信息
    const huHexagramInfo = this.getHexagramInfo(huHexagram.id);
    
    return {
      huGua,
      firstGua,           // 第一个卦象（第6、5、4爻）
      secondGua,          // 第二个卦象（第3、2、1爻）
      firstNature,        // 第一个卦象的nature
      secondNature,       // 第二个卦象的nature
      firstGuaNumber,     // 第一个卦象的八卦编号
      secondGuaNumber,    // 第二个卦象的八卦编号
      huHexagram,         // 六十四卦对象
      huHexagramInfo,     // 六十四卦解析信息
      // 保留原有字段以兼容现有代码
      outerHuGua: firstGua,
      innerHuGua: secondGua,
      tiHuGua: firstGua,
      yongHuGua: secondGua,
      tiNature: firstNature,
      yongNature: secondNature
    };
  }

  /**
   * 生成完整的占卜结果
   * @param {Object} analysisData - 分析数据
   * @returns {Object} 完整的占卜结果
   */
  generateDivinationResult(analysisData) {
    const {
      question,
      primaryGua,
      primaryAnalysis,
      bianGua,
      huGua,
      tiYongAnalysis,
      wuxingAnalysis,
      huGuaAnalysis,
      options
    } = analysisData;

    // 生成变卦的六十四卦
    const bianOuterGua = [bianGua[5], bianGua[4], bianGua[3]]; // 变卦外卦（第6、5、4爻）
    const bianInnerGua = [bianGua[2], bianGua[1], bianGua[0]]; // 变卦内卦（第3、2、1爻）
    const bianHexagram = this.baguaSystem.createHexagram(
      this.baguaSystem.getBaguaNumber(bianOuterGua),
      this.baguaSystem.getBaguaNumber(bianInnerGua)
    );

    // 获取六十四卦的详细解析
    const primaryHexagramInfo = this.getHexagramInfo(primaryAnalysis.primaryHexagram.id);
    const bianHexagramInfo = this.getHexagramInfo(bianHexagram.id);
    const huHexagramInfo = this.getHexagramInfo(huGuaAnalysis.huHexagram.id);

    // 生成综合解读
    const interpretationData = this.generateInterpretation({
      primaryHexagramInfo,
      bianHexagramInfo,
      huHexagramInfo,
      wuxingAnalysis,
      tiYongAnalysis,
      movingLine: primaryAnalysis.movingLine
    });

    return {
      id: this.generateDivinationId(),
      question,
      method: options.method || 'time',
      timestamp: new Date(),

      // 三卦信息
      hexagrams: {
        ben: {
          ...primaryAnalysis.primaryHexagram,
          info: primaryHexagramInfo,
          lines: primaryGua
        },
        hu: {
          ...huGuaAnalysis.huHexagram,
          info: huHexagramInfo,
          lines: huGua
        },
        bian: {
          ...bianHexagram,
          info: bianHexagramInfo,
          lines: bianGua
        }
      },

      // 动爻信息
      movingLine: primaryAnalysis.movingLine,

      // 分析部分（符合数据库Schema结构）
      analysis: {
        wuxing: {
          ben: wuxingAnalysis.ti.element,
          hu: wuxingAnalysis.yong.element,
          bian: wuxingAnalysis.bian?.element || wuxingAnalysis.ti.element, // 如果没有变卦五行，用体卦
          relationships: {
            benToHu: wuxingAnalysis.relationship,
            benToBian: wuxingAnalysis.bian?.relationship || wuxingAnalysis.relationship,
            huToBian: wuxingAnalysis.bian?.relationship || wuxingAnalysis.relationship
          },
          fortune: wuxingAnalysis.fortune?.level || '中平',
          timing: wuxingAnalysis.timing || '时机平和'
        },
        compatibility: wuxingAnalysis.relationship?.strength === 'strong' ? 0.8 :
                     wuxingAnalysis.relationship?.strength === 'weak' ? 0.3 : 0.5,
        elements: {
          favorable: wuxingAnalysis.favorableElements || [],
          unfavorable: wuxingAnalysis.unfavorableElements || [],
          neutral: []
        }
      },

      // 解读部分（符合数据库Schema结构）
      interpretation: {
        summary: interpretationData.summary || '占卜解读待生成',
        detailed: this.generateDetailedInterpretation(interpretationData, primaryHexagramInfo, bianHexagramInfo),
        advice: interpretationData.basic?.current?.advice || '建议谨慎行事',
        timing: wuxingAnalysis.timing || '时机平和',
        precautions: '占卜结果仅供参考，最终决定需结合实际情况'
      },

      // 元数据
      metadata: {
        timeInfo: primaryAnalysis.currentTimeInfo,
        hour: primaryAnalysis.currentTimeInfo.hour,
        hourNumber: primaryAnalysis.hourNumber,
        hourName: primaryAnalysis.currentTimeInfo.hourName,
        outerGuaNumber: primaryAnalysis.outerGuaNumber,
        innerGuaNumber: primaryAnalysis.innerGuaNumber,
        calculationTime: new Date(),
        processingTime: 50,
        algorithmVersion: 'v2.0'
      }
    };
  }

  /**
   * 获取六十四卦的详细信息
   * @param {number} hexagramId - 六十四卦编号
   * @returns {Object} 卦象详细信息
   */
  getHexagramInfo(hexagramId) {
    return HEXAGRAM_DATA[hexagramId] || {
      name: `第${hexagramId}卦`,
      meaning: '卦象解析待完善',
      fortune: '中',
      advice: '需要进一步分析'
    };
  }

  /**
   * 生成详细解读
   * @param {Object} interpretationData - 解读数据
   * @param {Object} primaryHexagramInfo - 本卦信息
   * @param {Object} bianHexagramInfo - 变卦信息
   * @returns {string} 详细解读
   */
  generateDetailedInterpretation(interpretationData, primaryHexagramInfo, bianHexagramInfo) {
    const { basic, tiYong, movingLine } = interpretationData;

    let detailed = `【本卦解析：${basic.current.hexagram}】\n`;
    detailed += `当前状态：${basic.current.meaning}\n`;
    detailed += `运势：${basic.current.fortune}\n\n`;

    detailed += `【变卦预示：${basic.result.hexagram}】\n`;
    detailed += `发展趋势：${basic.result.meaning}\n`;
    detailed += `未来运势：${basic.result.fortune}\n\n`;

    detailed += `【互卦过程：${basic.process.hexagram}】\n`;
    detailed += `发展过程：${basic.process.meaning}\n\n`;

    detailed += `【体用关系分析】\n`;
    detailed += `体用关系：${tiYong.relationship}\n`;
    detailed += `五行作用：${tiYong.meaning}\n`;
    detailed += `综合运势：${tiYong.fortune}\n\n`;

    detailed += `【动爻分析】\n`;
    detailed += `动爻位置：第${movingLine.position}爻\n`;
    detailed += `动爻含义：${movingLine.meaning}\n`;
    detailed += `对卦象影响：${movingLine.influence}\n\n`;

    detailed += `【综合建议】\n`;
    detailed += `${basic.current.advice}\n`;

    return detailed;
  }

  /**
   * 生成占卜ID
   * @returns {string} 占卜ID
   */
  generateDivinationId() {
    return `div_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 生成综合解读
   * @param {Object} data - 解读数据
   * @returns {Object} 综合解读结果
   */
  generateInterpretation(data) {
    const {
      primaryHexagramInfo,
      bianHexagramInfo,
      huHexagramInfo,
      wuxingAnalysis,
      tiYongAnalysis,
      movingLine
    } = data;

    // 基础解读
    const basicInterpretation = {
      current: {
        hexagram: primaryHexagramInfo.name,
        meaning: primaryHexagramInfo.meaning,
        fortune: primaryHexagramInfo.fortune || '中平',
        advice: primaryHexagramInfo.advice || '需要进一步分析'
      },
      result: {
        hexagram: bianHexagramInfo.name,
        meaning: bianHexagramInfo.meaning,
        fortune: bianHexagramInfo.fortune || '中平',
        advice: bianHexagramInfo.advice || '需要进一步分析'
      },
      process: {
        hexagram: huHexagramInfo.name,
        meaning: huHexagramInfo.meaning,
        fortune: huHexagramInfo.fortune || '中平',
        advice: huHexagramInfo.advice || '需要进一步分析'
      }
    };

    // 体用关系解读
    const tiYongInterpretation = {
      relationship: wuxingAnalysis.relationship.relationship,
      fortune: wuxingAnalysis.fortune?.level || '中平',
      meaning: wuxingAnalysis.fortune?.meaning || '关系平和',
      description: wuxingAnalysis.fortune?.description || '体用关系平和，无明显的吉凶倾向'
    };

    // 动爻解读
    const movingLineInterpretation = {
      position: movingLine,
      meaning: this.getMovingLineMeaning(movingLine),
      influence: this.getMovingLineInfluence(movingLine, tiYongAnalysis.tiIsOuter)
    };

    return {
      basic: basicInterpretation,
      tiYong: tiYongInterpretation,
      movingLine: movingLineInterpretation,
      summary: this.generateSummary(basicInterpretation, tiYongInterpretation, movingLineInterpretation)
    };
  }

  /**
   * 获取动爻含义
   * @param {number} movingLine - 动爻位置
   * @returns {string} 动爻含义
   */
  getMovingLineMeaning(movingLine) {
    const meanings = {
      1: '初爻动，事情刚开始，需要谨慎',
      2: '二爻动，事情发展中期，需要坚持',
      3: '三爻动，事情转折点，需要变通',
      4: '四爻动，事情上升期，需要把握',
      5: '五爻动，事情高峰，需要谨慎',
      6: '上爻动，事情结束，需要总结'
    };
    return meanings[movingLine] || '动爻含义待分析';
  }

  /**
   * 获取动爻影响
   * @param {number} movingLine - 动爻位置
   * @param {boolean} tiIsOuter - 体卦是否为外卦
   * @returns {string} 动爻影响
   */
  getMovingLineInfluence(movingLine, tiIsOuter) {
    if (tiIsOuter) {
      return movingLine <= 3 ? '内卦变化，影响用卦' : '外卦变化，影响体卦';
    } else {
      return movingLine <= 3 ? '内卦变化，影响体卦' : '外卦变化，影响用卦';
    }
  }

  /**
   * 生成总结
   * @param {Object} basic - 基础解读
   * @param {Object} tiYong - 体用解读
   * @param {Object} movingLine - 动爻解读
   * @returns {string} 总结
   */
  generateSummary(basic, tiYong, movingLine) {
    return `当前状态：${basic.current.meaning}。结果走向：${basic.result.meaning}。体用关系：${tiYong.meaning}，${tiYong.fortune || '中平'}。${movingLine.meaning}。建议：${basic.current.advice}`;
  }

  /**
   * 获取时辰名称
   * @param {number} hourNumber - 时辰编号
   * @returns {string} 时辰名称
   */
  getHourName(hourNumber) {
    const HOUR_NAMES = {
      1: '子时',
      2: '丑时', 
      3: '寅时',
      4: '卯时',
      5: '辰时',
      6: '巳时',
      7: '午时',
      8: '未时',
      9: '申时',
      10: '酉时',
      11: '戌时',
      12: '亥时'
    };
    
    return HOUR_NAMES[hourNumber] || '子时';
  }

  /**
   * 时间起卦生成主卦
   * @param {Object} params - 时间参数
   * @returns {Array} 主卦数组
   */
  generatePrimaryHexagramTime(params = {}) {
    if (params.datetime) {
      // 使用指定时间
      const date = new Date(params.datetime);
      const timeInfo = this.getTimeFromDate(date);
      return this.generateHexagramFromTime(timeInfo);
    } else {
      // 使用当前时间
      return this.generatePrimaryHexagram();
    }
  }

  /**
   * 数字起卦生成主卦
   * @param {Object} params - 数字参数
   * @returns {Array} 主卦数组
   */
  generatePrimaryHexagramNumber(params) {
    const { numbers } = params;
    if (!numbers || numbers.length < 2) {
      throw new Error('数字起卦需要至少2个数字');
    }

    const primaryGua = [];

    // 使用数字生成爻
    for (let i = 0; i < 6; i++) {
      const numIndex = i % numbers.length;
      const number = numbers[numIndex];
      // 根据数字的奇偶性决定阴爻阳爻
      primaryGua[i] = number % 2 === 0 ? 0 : 1;
    }

    return primaryGua;
  }

  /**
   * 手动起卦生成主卦
   * @param {Object} params - 手动参数
   * @returns {Array} 主卦数组
   */
  generatePrimaryHexagramManual(params) {
    const { upperGua, lowerGua, movingLine } = params;

    if (!upperGua || !lowerGua || !movingLine) {
      throw new Error('手动起卦需要上卦、下卦和动爻参数');
    }

    // 将上卦和下卦转换为三爻数组
    const upperLines = this.baguaSystem.getBaguaLines(upperGua);
    const lowerLines = this.baguaSystem.getBaguaLines(lowerGua);

    // 构建六爻数组 [下卦1爻, 下卦2爻, 下卦3爻, 上卦1爻, 上卦2爻, 上卦3爻]
    const primaryGua = [
      lowerLines[0],
      lowerLines[1],
      lowerLines[2],
      upperLines[0],
      upperLines[1],
      upperLines[2]
    ];

    return primaryGua;
  }

  /**
   * 从日期时间获取时间信息
   * @param {Date} date - 日期对象
   * @returns {Object} 时间信息
   */
  getTimeFromDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    const millisecond = date.getMilliseconds();

    return {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      hourNumber: getHourNumber(hour)
    };
  }

  /**
   * 根据时间信息生成主卦
   * @param {Object} timeInfo - 时间信息
   * @returns {Array} 主卦数组
   */
  generateHexagramFromTime(timeInfo) {
    // 改进的种子算法：结合时间信息和真随机数
    //
    // 旧算法问题：种子 = year + month + day + hourNumber
    // - hourNumber 只有12个值（子丑寅卯...），每个时辰2小时
    // - 导致同一时辰内所有占卜结果完全相同
    //
    // 新算法：直接使用 Math.random() 生成真随机卦象
    // - 保证每次占卜都有不同结果
    // - 符合现代占卜应用的需求
    // - 传统梅花易数认为"起卦时机"本身就是天意，使用请求时的随机性符合这一理念

    const primaryGua = [];
    for (let i = 0; i < 6; i++) {
      primaryGua[i] = Math.random() > 0.5 ? 1 : 0;
    }

    return primaryGua;
  }

  /**
   * 种子随机数生成器
   * @param {number} seed - 种子
   * @returns {Function} 随机数生成函数
   */
  seededRandom(seed) {
    let m = 0x80000000; // 2**31
    let a = 1103515245;
    let c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return function() {
      state = (a * state + c) % m;
      return state / (m - 1);
    };
  }
}

module.exports = MeihuaDivinationCore;
