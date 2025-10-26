# 梅花心易占卜算法系统

## 概述

本系统实现了完整的梅花心易占卜算法，基于传统梅花易数理论，提供准确的卦象计算和解读功能。

## 核心特性

- ✅ **随机起卦**: 后台随机生成六个0或1数字表示阴阳爻
- ✅ **三卦分析**: 本卦、互卦、变卦的完整计算
- ✅ **体用关系**: 根据动爻位置自动确定体用关系
- ✅ **五行生克**: 完整的五行相生相克关系分析
- ✅ **六十四卦**: 传统六十四卦的详细解析
- ✅ **综合解读**: 智能的占卜结果解读和建议

## 算法流程

### 1. 起卦方式
- 随机生成六个数字（0或1）
- 长实线（阳爻）= 1
- 断虚线（阴爻）= 0
- 数组第n位代表第n爻（数组[0]是第1爻，数组[5]是第6爻）
- 随机数从第6爻开始填充到第1爻

### 2. 占卜步骤

#### 步骤①：生成主卦
```javascript
// 随机生成六个数字，从第6爻开始填充到第1爻
const primaryGua = [第1爻, 第2爻, 第3爻, 第4爻, 第5爻, 第6爻];
```

#### 步骤②：计算动爻
```javascript
// 公式：(主卦上卦数字t_1 + 下卦数字t_2 + 求卦时辰) / 6
const movingLine = (outerGuaNumber + innerGuaNumber + hourNumber) % 6 || 6;
```

#### 步骤③：生成变卦
```javascript
// 根据动爻n，将主卦数组第n个数字阴阳转换
const bianGua = [...primaryGua];
bianGua[movingLine - 1] = bianGua[movingLine - 1] === 1 ? 0 : 1;
```

#### 步骤④：生成互卦
```javascript
// 根据234345顺序取出互卦（第2、3、4、3、4、5爻）
const huGua = [
  primaryGua[1], // 第2爻
  primaryGua[2], // 第3爻
  primaryGua[3], // 第4爻
  primaryGua[2], // 第3爻
  primaryGua[3], // 第4爻
  primaryGua[4]  // 第5爻
];
```

#### 步骤⑤：确定体用关系
- 如果动爻在内卦（第1、2、3爻）：内卦为用，外卦为体
- 如果动爻在外卦（第4、5、6爻）：外卦为用，内卦为体

#### 步骤⑥：五行分析
- 根据体用关系的五行属性分析生克关系
- 判断吉凶：用生体（大吉）、体用比和（中吉）、体克用（吉）、体生用（小凶）、用克体（大凶）

#### 步骤⑦：互卦解析
- 根据主卦的体用关系确定互卦的解析顺序
- 分析从主卦到变卦的过程

## 使用方法

### 基本用法

```javascript
const { algorithmManager } = require('./algorithms');

// 执行占卜
const result = await algorithmManager.performDivination('我的事业如何？', {
  hour: 12 // 可选，默认使用当前时间
});

console.log(result);
```

### 高级用法

```javascript
const { 
  MeihuaDivinationCore,
  BaguaSystem,
  FiveElementsSystem 
} = require('./algorithms');

// 创建实例
const divinationCore = new MeihuaDivinationCore();
const baguaSystem = new BaguaSystem();
const fiveElementsSystem = new FiveElementsSystem();

// 单独使用各个组件
const primaryGua = divinationCore.generatePrimaryHexagram();
const baguaInfo = baguaSystem.getBaguaProperties(1);
const relationship = fiveElementsSystem.getElementRelationship('金', '水');
```

## 数据结构

### 占卜结果结构

```javascript
{
  id: "div_1234567890_abc123",
  question: "我的事业如何？",
  timestamp: "2025-01-26T12:00:00.000Z",
  
  // 三卦信息
  hexagrams: {
    ben: {
      id: 1,
      name: "乾为天",
      upperGua: { name: "乾", element: "金", nature: "天" },
      lowerGua: { name: "乾", element: "金", nature: "天" },
      lines: [1, 1, 1, 1, 1, 1],
      info: { meaning: "带着头盔往前冲", fortune: "吉", advice: "积极进取，但要谨慎行事" }
    },
    hu: { /* 互卦信息 */ },
    bian: { /* 变卦信息 */ }
  },
  
  // 动爻信息
  movingLine: 3,
  
  // 体用分析
  tiYong: {
    ti: { gua: [1,1,1], properties: {...}, element: "金" },
    yong: { gua: [0,0,0], properties: {...}, element: "土" },
    analysis: {
      relationship: { type: "generation", relationship: "用生体", meaning: "生我，助我" },
      fortune: { level: "大吉", meaning: "生我，助我", description: "..." }
    }
  },
  
  // 五行分析
  wuxing: { /* 五行分析结果 */ },
  
  // 互卦分析
  huGuaAnalysis: { /* 互卦分析结果 */ },
  
  // 综合解读
  interpretation: {
    basic: {
      current: { meaning: "当前状态描述", advice: "建议" },
      result: { meaning: "结果走向", advice: "建议" },
      process: { meaning: "过程分析", advice: "建议" }
    },
    tiYong: { relationship: "用生体", fortune: "大吉", meaning: "生我，助我" },
    movingLine: { position: 3, meaning: "三爻动，事情转折点，需要变通" },
    summary: "综合总结"
  }
}
```

## 八卦数据

### 先天八卦对应关系

| 编号 | 卦名 | 符号 | 五行 | 自然 | 三爻 |
|------|------|------|------|------|------|
| 1 | 乾 | ☰ | 金 | 天 | [1,1,1] |
| 2 | 兑 | ☱ | 金 | 泽 | [0,1,1] |
| 3 | 离 | ☲ | 火 | 火 | [1,0,1] |
| 4 | 震 | ☳ | 木 | 雷 | [0,0,1] |
| 5 | 巽 | ☴ | 木 | 风 | [1,1,0] |
| 6 | 坎 | ☵ | 水 | 水 | [0,1,0] |
| 7 | 艮 | ☶ | 土 | 山 | [1,0,0] |
| 8 | 坤 | ☷ | 土 | 地 | [0,0,0] |

### 时辰对应表

| 时辰 | 时间 | 编号 |
|------|------|------|
| 子时 | 23时-1时 | 1 |
| 丑时 | 1时-3时 | 2 |
| 寅时 | 3时-5时 | 3 |
| 卯时 | 5时-7时 | 4 |
| 辰时 | 7时-9时 | 5 |
| 巳时 | 9时-11时 | 6 |
| 午时 | 11时-13时 | 7 |
| 未时 | 13时-15时 | 8 |
| 申时 | 15时-17时 | 9 |
| 酉时 | 17时-19时 | 10 |
| 戌时 | 19时-21时 | 11 |
| 亥时 | 21时-23时 | 12 |

## 五行生克关系

### 相生关系
- 金生水：金属的温润流泽使水得以生长
- 水生木：水的滋润使树木生长
- 木生火：木材的温暖能引发火焰
- 火生土：火焚烧木材后形成灰烬，灰即土
- 土生金：土壤中蕴藏着金属

### 相克关系
- 金克木：金属工具可以砍伐树木
- 木克土：树木的根系可以破坏土壤
- 土克水：土壤可以吸收水分
- 水克火：水可以扑灭火焰
- 火克金：高温的火焰可以熔化金属

## 体用卦象分析

### 好卦
1. **大吉**：用生体 - 生我，助我
2. **中吉**：体用比和 - 同我
3. **吉**：体克用 - 我克，需要付出，但有掌握权，结果好

### 凶卦
1. **小凶**：体生用 - 耗能量，泄气，自身不足还要给，主损失，耗损
2. **大凶**：用克体 - 周围人事阻我，挡我，困难困苦

## 测试

运行测试：

```bash
# 运行算法测试
node src/algorithms/test/algorithmTest.js

# 运行演示
node src/algorithms/demo/divinationDemo.js
```

## 文件结构

```
algorithms/
├── index.js                    # 主入口文件
├── core/                       # 核心算法模块
│   ├── meihuaDivinationCore.js # 占卜核心算法
│   ├── baguaSystem.js          # 八卦系统
│   └── fiveElementsSystem.js   # 五行系统
├── data/                       # 数据定义
│   ├── baguaData.js           # 八卦数据
│   └── hexagramData.js        # 六十四卦数据
├── validators/                 # 验证器
│   └── divinationValidator.js  # 占卜验证器
├── test/                       # 测试文件
│   └── algorithmTest.js        # 算法测试
├── demo/                       # 演示文件
│   └── divinationDemo.js       # 占卜演示
└── README.md                   # 说明文档
```

## 注意事项

1. **算法准确性**: 本算法严格按照传统梅花易数理论实现，确保占卜结果的准确性
2. **输入验证**: 所有输入都会经过严格验证，确保数据的有效性
3. **错误处理**: 完善的错误处理机制，提供详细的错误信息
4. **扩展性**: 模块化设计，便于后续功能扩展

## 版本信息

- **版本**: 1.0.0
- **作者**: 梅花心易项目团队
- **更新日期**: 2025年1月26日
- **兼容性**: Node.js 14+

## 许可证

本项目采用 MIT 许可证。
