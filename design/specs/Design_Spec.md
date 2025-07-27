# 梅花心易占卜应用 - 设计规范文档

## 1. 设计概述

### 1.1 设计理念
梅花心易占卜应用采用"现代简约 + 传统易学"的设计理念，将传统易学文化与现代移动端UI设计完美融合，营造神秘而专业的占卜体验。

### 1.2 设计目标
- **专业性**：体现梅花易数的专业性和权威性
- **易用性**：简洁直观的操作流程，降低用户学习成本
- **神秘感**：通过视觉设计营造占卜的仪式感和神秘氛围
- **现代感**：符合年轻用户审美的现代化界面设计

## 2. 视觉设计系统

### 2.1 色彩系统

#### 主色调
- **主色（Primary）**: `#1e3a8a` - 深蓝色
  - 用途：主要按钮、导航栏、重要文字
  - 寓意：深邃、智慧、专业
  
- **辅助色（Secondary）**: `#fbbf24` - 金色
  - 用途：强调元素、卦象、装饰元素
  - 寓意：尊贵、神秘、传统

#### 扩展色彩
- **神秘紫（Mystic）**: `#312e81` - 用于渐变背景
- **深色（Dark）**: `#0f172a` - 用于深色主题
- **成功色**: `#10b981` - 用于正面反馈
- **警告色**: `#f59e0b` - 用于提醒信息
- **错误色**: `#ef4444` - 用于错误状态

#### 中性色
- **文字主色**: `#1f2937` - 主要文字内容
- **文字次色**: `#6b7280` - 次要文字内容
- **边框色**: `#e5e7eb` - 分割线、边框
- **背景色**: `#f9fafb` - 页面背景

### 2.2 字体系统

#### 字体层级
```css
/* 标题字体 */
.text-title-large { font-size: 24px; font-weight: 700; line-height: 32px; }
.text-title-medium { font-size: 20px; font-weight: 600; line-height: 28px; }
.text-title-small { font-size: 18px; font-weight: 600; line-height: 24px; }

/* 正文字体 */
.text-body-large { font-size: 16px; font-weight: 400; line-height: 24px; }
.text-body-medium { font-size: 14px; font-weight: 400; line-height: 20px; }
.text-body-small { font-size: 12px; font-weight: 400; line-height: 16px; }

/* 标签字体 */
.text-label-large { font-size: 14px; font-weight: 500; line-height: 20px; }
.text-label-medium { font-size: 12px; font-weight: 500; line-height: 16px; }
.text-label-small { font-size: 10px; font-weight: 500; line-height: 14px; }
```

### 2.3 图标系统

#### 图标库
- **主要图标库**: FontAwesome 6.4.0
- **图标风格**: 线性图标为主，填充图标为辅
- **图标尺寸**: 16px, 20px, 24px, 32px

#### 核心图标
- **太极图**: `fas fa-yin-yang` - 应用核心标识
- **占卜**: `fas fa-magic` - 占卜功能
- **历史**: `fas fa-history` - 历史记录
- **用户**: `fas fa-user` - 用户中心
- **设置**: `fas fa-cog` - 设置功能

## 3. 组件设计规范

### 3.1 按钮组件

#### 主要按钮（Primary Button）
```css
.btn-primary {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: #1e3a8a;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}
```

#### 次要按钮（Secondary Button）
```css
.btn-secondary {
  background: rgba(30, 58, 138, 0.1);
  color: #1e3a8a;
  border: 1px solid #1e3a8a;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
}
```

### 3.2 卡片组件

#### 标准卡片
```css
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}
```

#### 渐变卡片
```css
.card-gradient {
  background: linear-gradient(135deg, #1e3a8a, #312e81);
  border-radius: 16px;
  padding: 20px;
  color: white;
}
```

### 3.3 输入框组件

#### 标准输入框
```css
.input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 16px;
  background: #ffffff;
}

.input:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.1);
  outline: none;
}
```

## 4. 布局系统

### 4.1 网格系统
- **容器最大宽度**: 375px（iPhone标准宽度）
- **内边距**: 24px（左右各24px）
- **组件间距**: 16px, 24px, 32px

### 4.2 间距系统
```css
/* 间距变量 */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

## 5. 交互设计规范

### 5.1 动画效果

#### 页面转场
- **持续时间**: 300ms
- **缓动函数**: ease-out
- **效果**: 滑动、淡入淡出

#### 按钮交互
```css
.btn-hover {
  transition: all 0.3s ease;
  transform: translateY(0);
}

.btn-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}
```

#### 卡片悬停
```css
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

### 5.2 反馈机制

#### 加载状态
- **占卜进行中**: 太极图旋转动画
- **数据加载**: 骨架屏或加载指示器
- **操作反馈**: Toast提示消息

#### 状态指示
- **成功**: 绿色图标 + 提示文字
- **错误**: 红色图标 + 错误信息
- **警告**: 黄色图标 + 警告文字

## 6. 移动端适配

### 6.1 响应式设计
- **主要断点**: 375px（iPhone SE）, 414px（iPhone Pro Max）
- **最小支持宽度**: 320px
- **最大内容宽度**: 414px

### 6.2 触摸交互
- **最小触摸区域**: 44px × 44px
- **手势支持**: 点击、滑动、长按
- **触摸反馈**: 视觉反馈 + 触觉反馈（如支持）

## 7. 可访问性设计

### 7.1 颜色对比度
- **正文文字**: 对比度 ≥ 4.5:1
- **大号文字**: 对比度 ≥ 3:1
- **图标元素**: 对比度 ≥ 3:1

### 7.2 字体大小
- **最小字体**: 12px
- **正文字体**: 14px-16px
- **支持系统字体缩放**

## 8. 品牌元素

### 8.1 Logo设计
- **主要元素**: 太极图 + 文字组合
- **颜色**: 金色太极图 + 深蓝色文字
- **最小使用尺寸**: 24px

### 8.2 装饰元素
- **易学符号**: 八卦、太极、星象等
- **使用场景**: 背景装饰、加载动画、分割元素
- **透明度**: 5%-20%，避免干扰主要内容

## 9. 设计资源

### 9.1 图片资源
- **来源**: Unsplash, Pexels
- **风格**: 简约、现代、神秘
- **格式**: WebP优先，PNG/JPG备选
- **尺寸**: 2x分辨率适配高清屏幕

### 9.2 图标资源
- **主要来源**: FontAwesome
- **自定义图标**: SVG格式
- **命名规范**: icon-[功能]-[状态]

## 10. 开发规范

### 10.1 CSS命名
- **方法论**: BEM（Block Element Modifier）
- **前缀**: mh-（梅花心易缩写）
- **示例**: `.mh-button`, `.mh-card__header`, `.mh-input--focused`

### 10.2 组件结构
```html
<!-- 标准组件结构 -->
<div class="mh-component">
  <div class="mh-component__header">
    <h3 class="mh-component__title">标题</h3>
  </div>
  <div class="mh-component__body">
    内容区域
  </div>
  <div class="mh-component__footer">
    操作区域
  </div>
</div>
```

## 11. 质量标准

### 11.1 性能要求
- **首屏加载时间**: < 2秒
- **页面切换**: < 300ms
- **图片优化**: 压缩率 > 70%

### 11.2 兼容性要求
- **iOS**: Safari 12+
- **Android**: Chrome 70+
- **屏幕尺寸**: 320px - 414px

---

**文档版本**: v1.0  
**最后更新**: 2025-01-26  
**维护者**: UI/UX设计团队
