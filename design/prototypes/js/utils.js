/**
 * 梅花心易应用 - 工具函数库
 * 提供通用的工具函数、验证函数、UI组件等
 */

// 工具函数类
class Utils {
    // 显示Toast提示
    static showToast(message, type = 'info', duration = 3000) {
        // 移除已存在的toast
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        // 创建toast元素
        const toast = document.createElement('div');
        toast.className = `toast-message fixed top-20 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white text-sm z-50 transition-all duration-300`;
        
        // 根据类型设置样式
        switch (type) {
            case 'success':
                toast.classList.add('bg-green-500');
                break;
            case 'error':
                toast.classList.add('bg-red-500');
                break;
            case 'warning':
                toast.classList.add('bg-yellow-500');
                break;
            default:
                toast.classList.add('bg-gray-800');
        }

        toast.textContent = message;
        document.body.appendChild(toast);

        // 显示动画
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        }, 10);

        // 自动隐藏
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, -100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, duration);
    }

    // 显示加载状态
    static showLoading(message = '加载中...') {
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        loading.innerHTML = `
            <div class="bg-white rounded-2xl p-6 flex flex-col items-center space-y-4">
                <div class="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                <span class="text-gray-700">${message}</span>
            </div>
        `;
        document.body.appendChild(loading);
    }

    // 隐藏加载状态
    static hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            loading.remove();
        }
    }

    // 表单验证
    static validateForm(formData, rules) {
        const errors = {};

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const rule = rules[field];

            // 必填验证
            if (rule.required && (!value || value.trim() === '')) {
                errors[field] = rule.message || `${field}不能为空`;
                return;
            }

            // 如果值为空且不是必填，跳过其他验证
            if (!value || value.trim() === '') return;

            // 长度验证
            if (rule.minLength && value.length < rule.minLength) {
                errors[field] = `${field}至少需要${rule.minLength}个字符`;
                return;
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                errors[field] = `${field}不能超过${rule.maxLength}个字符`;
                return;
            }

            // 正则验证
            if (rule.pattern && !rule.pattern.test(value)) {
                errors[field] = rule.message || `${field}格式不正确`;
                return;
            }

            // 自定义验证
            if (rule.validator && typeof rule.validator === 'function') {
                const result = rule.validator(value);
                if (result !== true) {
                    errors[field] = result;
                    return;
                }
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // 邮箱验证
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // 手机号验证
    static isValidPhone(phone) {
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    // 密码强度检查
    static checkPasswordStrength(password) {
        if (!password) return { strength: 0, text: '请输入密码' };

        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            symbols: /[^A-Za-z0-9]/.test(password)
        };

        Object.values(checks).forEach(check => {
            if (check) score++;
        });

        if (score < 2) return { strength: 1, text: '弱', color: 'red' };
        if (score < 4) return { strength: 2, text: '中', color: 'yellow' };
        return { strength: 3, text: '强', color: 'green' };
    }

    // 格式化日期
    static formatDate(date, format = 'YYYY-MM-DD') {
        if (!date) return '';
        
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes);
    }

    // 相对时间格式化
    static formatRelativeTime(date) {
        if (!date) return '';

        const now = new Date();
        const target = new Date(date);
        const diff = now - target;

        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;

        if (diff < minute) return '刚刚';
        if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
        if (diff < day) return `${Math.floor(diff / hour)}小时前`;
        if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

        return this.formatDate(target, 'MM-DD');
    }

    // 生成随机ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 防抖函数
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // 模拟网络请求延迟
    static async simulateNetworkDelay(min = 1000, max = 3000) {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    // 生成模拟占卜结果
    static generateMockDivinationResult(question) {
        const hexagrams = [
            { name: '天火同人', type: '同人', element: '火天', fortune: '中吉' },
            { name: '水雷屯', type: '屯', element: '水雷', fortune: '小凶' },
            { name: '天地否', type: '否', element: '天地', fortune: '大吉' },
            { name: '山水蒙', type: '蒙', element: '山水', fortune: '平' },
            { name: '地天泰', type: '泰', element: '地天', fortune: '大吉' },
            { name: '天山遁', type: '遁', element: '天山', fortune: '小吉' }
        ];

        const hexagram = hexagrams[Math.floor(Math.random() * hexagrams.length)];
        
        const interpretations = [
            '此卦象显示，您当前面临的选择具有积极的发展潜力。建议保持开放心态，主动寻求新的机会。',
            '卦象提醒您需要谨慎行事，当前时机尚未成熟，建议耐心等待更好的时机。',
            '这是一个非常有利的卦象，表明您的决定将带来积极的结果，可以大胆前进。',
            '卦象显示当前情况比较复杂，需要您仔细分析各种因素，做出明智的选择。'
        ];

        const interpretation = interpretations[Math.floor(Math.random() * interpretations.length)];

        return {
            hexagram,
            interpretation,
            advice: '建议您结合实际情况，理性分析，做出最适合自己的决定。',
            timing: '建议在本月下旬做出最终决定，下个月初开始行动。',
            timestamp: new Date().toISOString()
        };
    }

    // 复制到剪贴板
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // 降级处理
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
            return false;
        }
    }
}

// 将工具类挂载到全局
window.Utils = Utils;

// 导出工具类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
