# Markdown 渲染功能测试指南

## 功能说明

现在 AI 解读的内容会以渲染后的 Markdown 格式显示，而不是显示原始的 `###` 和 `**` 等语法符号。

## 已完成的修改

### 1. 创建了 Markdown 渲染工具
- 文件：`frontend/src/utils/markdown.js`
- 功能：安全地将 Markdown 文本转换为 HTML
- 使用库：
  - `marked` - Markdown 解析器
  - `dompurify` - HTML 安全清理

### 2. 修改了 AI 解读显示组件
- 文件：`frontend/src/views/divination/DivinationResult.vue`
- 改动：
  - 导入 `renderMarkdown` 函数
  - 使用 `v-html` 指令渲染 Markdown 内容
  - 添加了完整的 Markdown 样式

### 3. 支持的 Markdown 功能

- ✅ 标题 (H1-H6)
- ✅ 粗体文本 (**文本**)
- ✅ 斜体文本 (*文本*)
- ✅ 列表（有序和无序）
- ✅ 代码块（行内和块级）
- ✅ 引用
- ✅ 链接
- ✅ 分隔线
- ✅ 安全过滤（防止 XSS 攻击）

## 测试步骤

1. **启动开发服务器**
   ```bash
   cd frontend
   npm run dev
   ```

2. **进行占卜测试**
   - 访问首页
   - 输入一个问题
   - 完成占卜流程

3. **生成 AI 解读**
   - 在占卜结果页面点击"生成AI解读"按钮
   - 等待 AI 生成解读内容

4. **验证 Markdown 渲染**
   - AI 解读应该显示为格式化的内容
   - 标题应该显示为大字体、粗体
   - 粗体文本应该以金色显示
   - 列表应该有合适的缩进和样式
   - 所有 Markdown 语法符号不应该显示出来

## 样式特性

### 标题
- H1: 1.5rem, 粗体
- H2: 1.3rem, 粗体
- H3: 1.15rem, 粗体

### 文本样式
- **粗体**：金色高亮 (#fbbf24)
- *斜体*：倾斜字体
- 代码：黄色背景，等宽字体

### 列表
- 左缩进 1.5rem
- 行间距 0.5rem

### 引用
- 左侧金色边框
- 斜体字体
- 内边距

## 安全特性

使用 DOMPurify 过滤掉不安全的 HTML 标签和属性，只允许安全的 Markdown 元素：
- 允许的标签：p, br, strong, em, u, s, h1-h6, ul, ol, li, blockquote, code, pre, a, img, hr
- 允许的属性：href, title, alt, src, class
- 防止 XSS 攻击

## 故障排查

如果看不到变化：

1. **清除浏览器缓存**
   - Chrome: Ctrl+Shift+Del -> 清除缓存
   - 或使用硬刷新：Ctrl+F5

2. **重启开发服务器**
   ```bash
   # 停止当前服务器 (Ctrl+C)
   # 重新启动
   npm run dev
   ```

3. **检查依赖是否正确安装**
   ```bash
   npm list marked dompurify
   ```

4. **查看浏览器控制台**
   - 打开开发者工具 (F12)
   - 查看是否有错误消息

## 预期效果

### 之前的显示：
```
### 主要卦象
这是**重要**的内容
- 第一点
- 第二点
```

### 现在的显示：
- **主要卦象** (作为大标题，粗体)
- 这是**重要**的内容 (粗体部分显示为金色)
- • 第一点 (列表项)
- • 第二点 (列表项)
