# 占卜动画功能实现说明

## 功能概述

已成功实现从输入问题界面到展示结果界面的完整占卜动画效果，包括：

### 1. 掷钱币动画 (`DivinationAnimation.vue`)
- **六次掷钱币动画**：每次掷币都有真实的3D翻转效果
- **实时阴阳显示**：每次掷币后立即显示结果（阳⚊或阴⚋）
- **进度指示器**：显示当前掷币进度和完成状态
- **星空背景**：营造神秘占卜氛围

### 2. 卦象生成动画
- **主卦生成**：根据六次掷币结果生成主卦
- **互卦计算**：按照梅花易数规则计算互卦
- **变卦生成**：计算动爻并生成变卦，动爻会高亮显示
- **渐进式动画**：卦象线条依次出现，增强视觉效果

### 3. 集成到占卜流程
- **DivinationLoading.vue**：集成动画组件，替换原有加载界面
- **DivinationResult.vue**：增强结果展示，支持主卦、互卦、变卦的完整显示
- **事件处理**：动画完成后自动调用占卜API并跳转到结果页面

## 文件结构

```
frontend/src/
├── components/divination/
│   └── DivinationAnimation.vue    # 占卜动画组件
├── views/divination/
│   ├── DivinationLoading.vue      # 更新的加载页面
│   └── DivinationResult.vue       # 增强的结果页面
└── divination-animation-demo.html # 独立演示页面
```

## 核心特性

### 动画效果
- **3D钱币翻转**：使用CSS 3D变换实现真实的掷币效果
- **阴阳符号显示**：阳爻(⚊)和阴爻(⚋)的清晰展示
- **卦象线条动画**：线条从左到右依次出现
- **动爻高亮**：变卦中的动爻会有特殊的红色发光效果

### 交互体验
- **实时反馈**：每次掷币后立即显示结果
- **进度跟踪**：进度点显示当前掷币状态
- **平滑过渡**：所有动画都有平滑的过渡效果
- **响应式设计**：支持移动端和桌面端

### 技术实现
- **Vue 3 Composition API**：使用现代Vue语法
- **CSS动画**：关键帧动画和过渡效果
- **事件系统**：组件间的事件通信
- **状态管理**：与Pinia store的集成

## 使用方法

### 1. 在组件中使用
```vue
<template>
  <DivinationAnimation 
    :duration="8000"
    @complete="handleAnimationComplete"
    @progress="handleAnimationProgress"
  />
</template>

<script setup>
const handleAnimationComplete = (hexagramData) => {
  console.log('占卜完成:', hexagramData)
  // 处理占卜结果
}

const handleAnimationProgress = (progressData) => {
  console.log('动画进度:', progressData)
  // 更新进度显示
}
</script>
```

### 2. 查看演示
打开 `frontend/divination-animation-demo.html` 查看完整的动画演示效果。

## 动画流程

1. **准备阶段**：显示"准备掷钱币..."
2. **掷币阶段**：6次掷币，每次间隔2秒
3. **卦象生成**：
   - 主卦生成（0.5秒后）
   - 互卦生成（2秒后）
   - 变卦生成（3.5秒后）
4. **完成阶段**：显示"占卜完成"

## 自定义配置

### 动画时长
```vue
<DivinationAnimation :duration="10000" />
```

### 事件处理
```javascript
// 动画完成事件
@complete="(hexagramData) => {
  // hexagramData包含：
  // - primaryHexagram: 主卦数组
  // - mutualHexagram: 互卦数组  
  // - changeHexagram: 变卦数组
  // - movingLine: 动爻位置
}"

// 进度更新事件
@progress="(progressData) => {
  // progressData包含：
  // - step: 当前步骤
  // - total: 总步骤数
  // - result: 掷币结果
  // - progress: 进度百分比
}"
```

## 样式定制

动画组件使用CSS变量，可以通过覆盖变量来自定义样式：

```css
.divination-animation-container {
  --coin-size: 60px;
  --coin-color-yang: #fbbf24;
  --coin-color-yin: #1e3a8a;
  --line-width: 80px;
  --line-height: 8px;
}
```

## 注意事项

1. **性能优化**：动画使用了硬件加速，确保流畅运行
2. **兼容性**：支持现代浏览器，移动端优化
3. **可访问性**：支持键盘导航和屏幕阅读器
4. **错误处理**：包含完整的错误处理机制

## 后续优化建议

1. **音效支持**：添加掷币音效和背景音乐
2. **更多动画**：增加太极图旋转等传统元素
3. **个性化**：支持用户自定义动画风格
4. **性能监控**：添加动画性能监控和优化
