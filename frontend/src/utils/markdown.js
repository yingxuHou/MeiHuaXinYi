/**
 * Markdown 渲染工具
 * 使用 marked 和 DOMPurify 安全地渲染 markdown 内容
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * 配置 marked 选项
 */
marked.setOptions({
  breaks: true, // 转换单个换行符为 <br>
  gfm: true, // 启用 GitHub Flavored Markdown
  headerIds: false, // 不使用标题 ID
  mangle: false // 不混淆邮箱地址
})

/**
 * 将 markdown 文本转换为安全的 HTML
 * @param {string} markdown - markdown 文本
 * @returns {string} 安全的 HTML
 */
export function renderMarkdown(markdown) {
  if (!markdown) return ''
  
  try {
    // 转换 markdown 为 HTML
    const html = marked.parse(markdown)
    
    // 使用 DOMPurify 清理 HTML，防止 XSS 攻击
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'hr'
      ],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class'],
      ALLOW_DATA_ATTR: false
    })
    
    return cleanHtml
  } catch (error) {
    console.error('Markdown 渲染失败:', error)
    // 如果渲染失败，返回原始文本
    return markdown
  }
}

/**
 * 检查字符串是否包含 markdown 语法
 * @param {string} text - 要检查的文本
 * @returns {boolean} 是否包含 markdown
 */
export function hasMarkdown(text) {
  if (!text) return false
  
  const markdownPatterns = [
    /^#{1,6}\s/, // 标题
    /\*\*.*?\*\*/, // 粗体
    /\*.*?\*/, // 斜体
    /_.*?_/, // 斜体
    /__.*?__/, // 粗体
    /`.*?`/, // 行内代码
    /```[\s\S]*?```/, // 代码块
    /\[.*?\]\(.*?\)/, // 链接
    /^\s*[-*+]\s/, // 列表
    /^\s*\d+\.\s/, // 有序列表
    /^>\s/, // 引用
    /^---$/, // 分隔线
  ]
  
  return markdownPatterns.some(pattern => pattern.test(text))
}
