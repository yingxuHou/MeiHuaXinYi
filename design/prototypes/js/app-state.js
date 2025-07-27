/**
 * 梅花心易应用 - 全局状态管理系统
 * 负责管理用户状态、应用数据、页面路由等
 */

class AppState {
    constructor() {
        this.init();
    }

    // 初始化应用状态
    init() {
        // 检查是否有保存的状态
        const savedState = localStorage.getItem('meihua_app_state');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.state = { ...this.getDefaultState(), ...state };
            } catch (e) {
                console.error('Failed to parse saved state:', e);
                this.state = this.getDefaultState();
            }
        } else {
            this.state = this.getDefaultState();
        }
        
        // 监听页面卸载，保存状态
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                this.saveState();
            });
        }
    }

    // 获取默认状态
    getDefaultState() {
        return {
            // 用户信息
            user: {
                isLoggedIn: false,
                id: null,
                nickname: '',
                email: '',
                phone: '',
                gender: '',
                birthDate: '',
                industry: '',
                avatar: '',
                registerType: '',
                createdAt: null
            },
            
            // 应用数据
            app: {
                freeCount: 10, // 免费次数
                totalDivinations: 0, // 总占卜次数
                currentMonth: 0, // 本月占卜次数
                consecutiveDays: 0, // 连续使用天数
                lastLoginDate: null,
                theme: 'default',
                notifications: true
            },
            
            // 当前会话
            session: {
                currentQuestion: '',
                questionType: '',
                currentResult: null,
                navigationHistory: []
            },
            
            // 占卜历史记录
            history: []
        };
    }

    // 保存状态到localStorage
    saveState() {
        try {
            localStorage.setItem('meihua_app_state', JSON.stringify(this.state));
        } catch (e) {
            console.error('Failed to save state:', e);
        }
    }

    // 获取状态
    getState(path = null) {
        if (!path) return this.state;
        
        const keys = path.split('.');
        let value = this.state;
        for (const key of keys) {
            value = value[key];
            if (value === undefined) return null;
        }
        return value;
    }

    // 更新状态
    setState(path, value) {
        const keys = path.split('.');
        let target = this.state;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
        }
        
        target[keys[keys.length - 1]] = value;
        this.saveState();
        
        // 触发状态变化事件
        this.notifyStateChange(path, value);
    }

    // 状态变化通知
    notifyStateChange(path, value) {
        const event = new CustomEvent('stateChange', {
            detail: { path, value, state: this.state }
        });
        window.dispatchEvent(event);
    }

    // 用户登录
    login(userData) {
        this.setState('user.isLoggedIn', true);
        this.setState('user.id', userData.id || Date.now());
        this.setState('user.nickname', userData.nickname || '');
        this.setState('user.email', userData.email || '');
        this.setState('user.phone', userData.phone || '');
        this.setState('app.lastLoginDate', new Date().toISOString());
        
        // 新用户给予免费次数
        if (!this.getState('user.createdAt')) {
            this.setState('user.createdAt', new Date().toISOString());
            this.setState('app.freeCount', 10);
        }
    }

    // 用户登出
    logout() {
        this.setState('user.isLoggedIn', false);
        this.setState('session', {
            currentQuestion: '',
            questionType: '',
            currentResult: null,
            navigationHistory: []
        });
    }

    // 完善用户资料
    updateProfile(profileData) {
        Object.keys(profileData).forEach(key => {
            this.setState(`user.${key}`, profileData[key]);
        });
    }

    // 消耗占卜次数
    consumeDivination() {
        const currentCount = this.getState('app.freeCount');
        if (currentCount > 0) {
            this.setState('app.freeCount', currentCount - 1);
            this.setState('app.totalDivinations', this.getState('app.totalDivinations') + 1);
            this.setState('app.currentMonth', this.getState('app.currentMonth') + 1);
            return true;
        }
        return false;
    }

    // 增加免费次数
    addFreeCount(count = 10) {
        const currentCount = this.getState('app.freeCount');
        this.setState('app.freeCount', currentCount + count);
    }

    // 保存占卜记录
    saveDivinationRecord(record) {
        const history = this.getState('history') || [];
        const newRecord = {
            id: Date.now(),
            question: record.question,
            questionType: record.questionType,
            hexagram: record.hexagram,
            interpretation: record.interpretation,
            result: record.result,
            timestamp: new Date().toISOString()
        };
        
        history.unshift(newRecord); // 添加到开头
        
        // 限制历史记录数量
        if (history.length > 100) {
            history.splice(100);
        }
        
        this.setState('history', history);
        return newRecord;
    }

    // 获取占卜历史
    getDivinationHistory(filter = null) {
        const history = this.getState('history') || [];
        
        if (!filter) return history;
        
        return history.filter(record => {
            if (filter.type && record.questionType !== filter.type) return false;
            if (filter.dateRange) {
                const recordDate = new Date(record.timestamp);
                const { start, end } = filter.dateRange;
                if (start && recordDate < start) return false;
                if (end && recordDate > end) return false;
            }
            return true;
        });
    }

    // 检查是否需要显示免费次数弹窗
    shouldShowFreeCountModal() {
        const freeCount = this.getState('app.freeCount');
        const lastShown = localStorage.getItem('meihua_last_modal_shown');
        const today = new Date().toDateString();
        
        // 如果今天已经显示过，就不再显示
        if (lastShown === today) return false;
        
        // 如果次数充足且是新的一天，显示提醒
        if (freeCount >= 8) {
            localStorage.setItem('meihua_last_modal_shown', today);
            return true;
        }
        
        return false;
    }

    // 重置应用状态（用于测试）
    reset() {
        localStorage.removeItem('meihua_app_state');
        localStorage.removeItem('meihua_last_modal_shown');
        this.state = this.getDefaultState();
        this.saveState();
    }
}

// 创建全局状态实例
window.appState = new AppState();

// 导出状态管理类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppState;
}
