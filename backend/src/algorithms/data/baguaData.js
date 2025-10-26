/**
 * 梅花心易八卦数据定义
 * 基于先天八卦数字对应关系
 */

// 八卦基础数据
const BAGUA_DATA = {
  1: { 
    name: '乾', 
    symbol: '☰', 
    element: '金', 
    nature: '天',
    number: 1,
    lines: [1, 1, 1] // 三阳爻
  },
  2: { 
    name: '兑', 
    symbol: '☱', 
    element: '金', 
    nature: '泽',
    number: 2,
    lines: [0, 1, 1] // 上阴、中阳、下阳
  },
  3: { 
    name: '离', 
    symbol: '☲', 
    element: '火', 
    nature: '火',
    number: 3,
    lines: [1, 0, 1] // 上阳、中阴、下阳
  },
  4: { 
    name: '震', 
    symbol: '☳', 
    element: '木', 
    nature: '雷',
    number: 4,
    lines: [0, 0, 1] // 上阴、中阴、下阳
  },
  5: { 
    name: '巽', 
    symbol: '☴', 
    element: '木', 
    nature: '风',
    number: 5,
    lines: [1, 1, 0] // 上阳、中阳、下阴
  },
  6: { 
    name: '坎', 
    symbol: '☵', 
    element: '水', 
    nature: '水',
    number: 6,
    lines: [0, 1, 0] // 上阴、中阳、下阴
  },
  7: { 
    name: '艮', 
    symbol: '☶', 
    element: '土', 
    nature: '山',
    number: 7,
    lines: [1, 0, 0] // 上阳、中阴、下阴
  },
  8: { 
    name: '坤', 
    symbol: '☷', 
    element: '土', 
    nature: '地',
    number: 8,
    lines: [0, 0, 0] // 三阴爻
  }
};

// 时辰对应表
const HOUR_TO_NUMBER = {
  23: 1, 0: 1, 1: 1,    // 子时 (23时-1时)
  2: 2, 3: 2,           // 丑时 (1时-3时)
  4: 3, 5: 3,           // 寅时 (3时-5时)
  6: 4, 7: 4,           // 卯时 (5时-7时)
  8: 5, 9: 5,           // 辰时 (7时-9时)
  10: 6, 11: 6,         // 巳时 (9时-11时)
  12: 7, 13: 7,         // 午时 (11时-13时)
  14: 8, 15: 8,         // 未时 (13时-15时)
  16: 9, 17: 9,         // 申时 (15时-17时)
  18: 10, 19: 10,       // 酉时 (17时-19时)
  20: 11, 21: 11,       // 戌时 (19时-21时)
  22: 12, 23: 12        // 亥时 (21时-23时)
};

// 五行相生相克关系
const FIVE_ELEMENTS = {
  // 相生关系
  generation: {
    '金': '水',
    '水': '木', 
    '木': '火',
    '火': '土',
    '土': '金'
  },
  // 相克关系
  destruction: {
    '金': '木',
    '木': '土',
    '土': '水', 
    '水': '火',
    '火': '金'
  }
};

// 体用卦象分析结果
const TI_YONG_ANALYSIS = {
  // 好卦
  good: {
    '用生体': { level: '大吉', meaning: '生我，助我', description: '用卦生体卦，表示外在环境或他人会帮助自己，事情容易成功' },
    '体用比和': { level: '中吉', meaning: '同我', description: '体卦与用卦五行相同，表示和谐统一，事情顺利' },
    '体克用': { level: '吉', meaning: '我克，需要付出，但有掌握权，结果好', description: '体卦克用卦，表示需要努力但能掌控局面，最终结果良好' }
  },
  // 凶卦
  bad: {
    '体生用': { level: '小凶', meaning: '耗能量，泄气，自身不足还要给，主损失，耗损', description: '体卦生用卦，表示自己付出多但收获少，容易损耗' },
    '用克体': { level: '大凶', meaning: '周围人事阻我，挡我，困难困苦', description: '用卦克体卦，表示外在环境或他人对自己不利，困难重重' }
  }
};

module.exports = {
  BAGUA_DATA,
  HOUR_TO_NUMBER,
  FIVE_ELEMENTS,
  TI_YONG_ANALYSIS
};

