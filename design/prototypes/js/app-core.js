/**
 * 梅花心易应用 - 核心应用类
 * 整合状态管理、路由、工具函数等，提供统一的应用接口
 */

class MeiHuaApp {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    // 初始化应用
    async init() {
        try {
            console.log('开始初始化应用...');

            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                console.log('等待DOM加载完成...');
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            console.log('DOM已加载完成');

            // 等待其他脚本加载完成
            let retryCount = 0;
            while ((!window.appState || !window.router || !window.Utils) && retryCount < 50) {
                console.log(`等待依赖加载... (${retryCount + 1}/50)`);
                await new Promise(resolve => setTimeout(resolve, 100));
                retryCount++;
            }

            if (!window.appState || !window.router || !window.Utils) {
                throw new Error('依赖模块加载失败');
            }

            // 初始化各个模块
            this.initializeModules();

            // 设置全局事件监听
            this.setupGlobalListeners();

            // 检查登录状态
            this.checkAuthStatus();

            this.isInitialized = true;
            console.log('MeiHua App initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.isInitialized = false;
        }
    }

    // 初始化模块
    initializeModules() {
        // 确保全局对象存在
        if (!window.appState) {
            console.error('AppState not found');
            throw new Error('AppState not found');
        }

        if (!window.router) {
            console.error('Router not found');
            throw new Error('Router not found');
        }

        if (!window.Utils) {
            console.error('Utils not found');
            throw new Error('Utils not found');
        }

        // 绑定到应用实例
        this.state = window.appState;
        this.router = window.router;
        this.utils = window.Utils;

        console.log('所有模块初始化完成');
    }

    // 设置全局事件监听
    setupGlobalListeners() {
        // 监听状态变化
        window.addEventListener('stateChange', (e) => {
            this.handleStateChange(e.detail);
        });

        // 监听页面可见性变化
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.handlePageVisible();
            }
        });

        // 监听网络状态变化
        window.addEventListener('online', () => {
            this.utils.showToast('网络连接已恢复', 'success');
        });

        window.addEventListener('offline', () => {
            this.utils.showToast('网络连接已断开', 'warning');
        });
    }

    // 检查认证状态
    checkAuthStatus() {
        const isLoggedIn = this.state.getState('user.isLoggedIn');
        const currentRoute = this.router.getCurrentRouteFromURL();
        
        // 需要登录的页面
        const authRequiredPages = [
            'home', 'question-input', 'divination-loading', 
            'divination-result', 'history', 'user-center', 'profile-setup'
        ];

        // 如果未登录且访问需要登录的页面，重定向到登录页
        if (!isLoggedIn && authRequiredPages.includes(currentRoute)) {
            this.router.navigate('login');
            return;
        }

        // 如果已登录且访问登录/注册页面，重定向到首页
        if (isLoggedIn && ['login', 'register'].includes(currentRoute)) {
            this.router.navigate('home');
            return;
        }
    }

    // 处理状态变化
    handleStateChange(detail) {
        const { path, value } = detail;
        
        // 登录状态变化
        if (path === 'user.isLoggedIn') {
            if (value) {
                this.handleUserLogin();
            } else {
                this.handleUserLogout();
            }
        }
        
        // 免费次数变化
        if (path === 'app.freeCount') {
            this.updateFreeCountDisplay();
        }
    }

    // 处理用户登录
    handleUserLogin() {
        console.log('User logged in');
        
        // 检查是否需要完善资料
        const nickname = this.state.getState('user.nickname');
        if (!nickname) {
            this.router.navigate('profile-setup');
        } else {
            this.router.navigate('home');
        }
    }

    // 处理用户登出
    handleUserLogout() {
        console.log('User logged out');
        this.router.navigate('index');
    }

    // 更新免费次数显示
    updateFreeCountDisplay() {
        const freeCount = this.state.getState('app.freeCount');
        const elements = document.querySelectorAll('[data-free-count]');
        
        elements.forEach(element => {
            element.textContent = freeCount;
        });
    }

    // 处理页面可见
    handlePageVisible() {
        // 检查是否需要刷新数据
        const lastUpdate = this.state.getState('app.lastUpdate');
        const now = Date.now();
        
        // 如果超过5分钟没有更新，刷新数据
        if (!lastUpdate || (now - lastUpdate) > 5 * 60 * 1000) {
            this.refreshAppData();
        }
    }

    // 刷新应用数据
    refreshAppData() {
        // 更新最后刷新时间
        this.state.setState('app.lastUpdate', Date.now());
        
        // 这里可以添加其他数据刷新逻辑
        console.log('App data refreshed');
    }

    // 用户注册
    async register(userData) {
        try {
            this.utils.showLoading('注册中...');
            
            // 模拟网络请求
            await this.utils.simulateNetworkDelay(1000, 2000);
            
            // 验证数据
            const validation = this.utils.validateForm(userData, {
                email: {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: '请输入有效的邮箱地址'
                },
                phone: {
                    pattern: /^1[3-9]\d{9}$/,
                    message: '请输入有效的手机号'
                },
                password: {
                    required: true,
                    minLength: 8,
                    message: '密码至少需要8位字符'
                }
            });

            if (!validation.isValid) {
                const firstError = Object.values(validation.errors)[0];
                throw new Error(firstError);
            }

            // 保存用户数据
            this.state.login({
                id: this.utils.generateId(),
                email: userData.email,
                phone: userData.phone,
                registerType: userData.registerType || 'email'
            });

            this.utils.hideLoading();
            this.utils.showToast('注册成功！', 'success');
            
            return true;
            
        } catch (error) {
            this.utils.hideLoading();
            this.utils.showToast(error.message, 'error');
            return false;
        }
    }

    // 用户登录
    async login(credentials) {
        try {
            this.utils.showLoading('登录中...');
            
            // 模拟网络请求
            await this.utils.simulateNetworkDelay(1000, 2000);
            
            // 简单验证（实际应用中应该调用后端API）
            if (!credentials.account || !credentials.password) {
                throw new Error('请输入账号和密码');
            }

            // 模拟登录成功
            this.state.login({
                id: this.utils.generateId(),
                email: credentials.account.includes('@') ? credentials.account : '',
                phone: credentials.account.includes('@') ? '' : credentials.account,
                nickname: '易学爱好者' // 模拟已有用户
            });

            this.utils.hideLoading();
            this.utils.showToast('登录成功！', 'success');
            
            return true;
            
        } catch (error) {
            this.utils.hideLoading();
            this.utils.showToast(error.message, 'error');
            return false;
        }
    }

    // 用户登出
    logout() {
        this.state.logout();
        this.utils.showToast('已退出登录', 'info');
    }

    // 开始占卜
    async startDivination(question, questionType) {
        try {
            // 检查免费次数
            if (!this.state.consumeDivination()) {
                this.utils.showToast('免费次数不足，请分享获得更多次数', 'warning');
                return false;
            }

            // 保存当前问题
            this.state.setState('session.currentQuestion', question);
            this.state.setState('session.questionType', questionType);

            // 跳转到占卜进行页面
            this.router.navigate('divination-loading');
            
            return true;
            
        } catch (error) {
            this.utils.showToast('占卜启动失败', 'error');
            return false;
        }
    }

    // 生成占卜结果
    async generateDivinationResult() {
        try {
            // 模拟AI计算过程
            await this.utils.simulateNetworkDelay(3000, 8000);
            
            const question = this.state.getState('session.currentQuestion');
            const questionType = this.state.getState('session.questionType');
            
            // 生成模拟结果
            const result = this.utils.generateMockDivinationResult(question);
            
            // 保存结果
            this.state.setState('session.currentResult', result);
            
            // 保存到历史记录
            this.state.saveDivinationRecord({
                question,
                questionType,
                hexagram: result.hexagram,
                interpretation: result.interpretation,
                result: result
            });

            return result;
            
        } catch (error) {
            console.error('Failed to generate divination result:', error);
            throw error;
        }
    }

    // 分享结果
    async shareResult(platform = 'default') {
        try {
            const result = this.state.getState('session.currentResult');
            if (!result) {
                throw new Error('没有可分享的结果');
            }

            const shareText = `我刚刚通过梅花心易进行了占卜，得到了很有启发的指引！卦象：${result.hexagram.name}，快来试试吧！`;
            
            // 模拟分享成功
            await this.utils.simulateNetworkDelay(500, 1000);
            
            // 增加免费次数
            this.state.addFreeCount(10);
            
            this.utils.showToast('分享成功！已获得10次免费占卜', 'success');
            
            return true;
            
        } catch (error) {
            this.utils.showToast(error.message, 'error');
            return false;
        }
    }

    // 获取应用统计信息
    getAppStats() {
        return {
            totalDivinations: this.state.getState('app.totalDivinations'),
            currentMonth: this.state.getState('app.currentMonth'),
            consecutiveDays: this.state.getState('app.consecutiveDays'),
            freeCount: this.state.getState('app.freeCount'),
            historyCount: this.state.getState('history')?.length || 0
        };
    }

    // 重置应用（用于演示）
    resetApp() {
        if (confirm('确定要重置应用数据吗？这将清除所有用户数据和历史记录。')) {
            this.state.reset();
            this.router.navigate('index');
            this.utils.showToast('应用数据已重置', 'info');
        }
    }
}

// 创建全局应用实例
window.app = new MeiHuaApp();

// 导出应用类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MeiHuaApp;
}
