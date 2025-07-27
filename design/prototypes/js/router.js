/**
 * 梅花心易应用 - 路由系统
 * 负责页面导航、历史记录管理、权限控制等
 */

class Router {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.history = [];
        this.init();
    }

    init() {
        // 注册所有路由
        this.registerRoutes();
        
        // 监听浏览器前进后退
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.route) {
                this.navigateToRoute(e.state.route, false);
            }
        });
    }

    // 注册路由
    registerRoutes() {
        this.routes.set('index', {
            path: 'index.html',
            requireAuth: false,
            title: '梅花心易'
        });

        this.routes.set('register', {
            path: 'register.html',
            requireAuth: false,
            title: '注册 - 梅花心易'
        });

        this.routes.set('login', {
            path: 'login.html',
            requireAuth: false,
            title: '登录 - 梅花心易'
        });
        
        this.routes.set('profile-setup', {
            path: 'profile-setup.html',
            requireAuth: true,
            title: '完善资料 - 梅花心易'
        });
        
        this.routes.set('home', {
            path: 'home.html',
            requireAuth: true,
            title: '首页 - 梅花心易'
        });
        
        this.routes.set('question-input', {
            path: 'question-input.html',
            requireAuth: true,
            title: '问题输入 - 梅花心易'
        });
        
        this.routes.set('divination-loading', {
            path: 'divination-loading.html',
            requireAuth: true,
            title: '占卜进行中 - 梅花心易'
        });
        
        this.routes.set('divination-result', {
            path: 'divination-result.html',
            requireAuth: true,
            title: '占卜结果 - 梅花心易'
        });
        
        this.routes.set('history', {
            path: 'history.html',
            requireAuth: true,
            title: '历史记录 - 梅花心易'
        });
        
        this.routes.set('user-center', {
            path: 'user-center.html',
            requireAuth: true,
            title: '用户中心 - 梅花心易'
        });
    }

    // 导航到指定路由
    navigate(routeName, params = {}, addToHistory = true) {
        const route = this.routes.get(routeName);
        if (!route) {
            console.error(`Route "${routeName}" not found`);
            return false;
        }

        // 检查权限
        if (route.requireAuth && window.appState && !window.appState.getState('user.isLoggedIn')) {
            console.log('Authentication required, redirecting to login');
            this.navigate('login');
            return false;
        }

        // 检查是否为file://协议，如果是则使用简单跳转
        const isFileProtocol = window.location.protocol === 'file:';
        if (isFileProtocol) {
            console.log('File protocol detected, using direct navigation');
            window.location.href = route.path;
            return true;
        }

        // 保存当前路由到历史
        if (addToHistory && this.currentRoute) {
            this.history.push(this.currentRoute);
            // 限制历史记录长度
            if (this.history.length > 20) {
                this.history.shift();
            }
        }

        // 更新当前路由
        this.currentRoute = {
            name: routeName,
            route: route,
            params: params,
            timestamp: Date.now()
        };

        // 执行导航
        return this.navigateToRoute(this.currentRoute, addToHistory);
    }

    // 执行路由导航
    navigateToRoute(routeInfo, addToHistory = true) {
        try {
            // 检查是否为file://协议
            const isFileProtocol = window.location.protocol === 'file:';

            if (!isFileProtocol && addToHistory) {
                // 只在非file://协议下使用pushState
                const state = { route: routeInfo };
                history.pushState(state, routeInfo.route.title, routeInfo.route.path);
            }

            // 更新页面标题
            document.title = routeInfo.route.title;

            // 导航到新页面
            window.location.href = routeInfo.route.path;

            return true;
        } catch (error) {
            console.error('Navigation failed:', error);
            // 降级处理：直接跳转
            try {
                window.location.href = routeInfo.route.path;
                return true;
            } catch (fallbackError) {
                console.error('Fallback navigation also failed:', fallbackError);
                return false;
            }
        }
    }

    // 返回上一页
    goBack() {
        // 检查是否为file://协议
        const isFileProtocol = window.location.protocol === 'file:';

        if (isFileProtocol) {
            // file://协议下使用简单的历史返回
            if (window.history.length > 1) {
                window.history.back();
                return true;
            } else {
                // 没有历史记录时跳转到首页
                window.location.href = 'index.html';
                return false;
            }
        }

        if (this.history.length > 0) {
            const previousRoute = this.history.pop();
            this.navigateToRoute(previousRoute, false);
            return true;
        } else {
            // 如果没有历史记录，根据当前状态决定返回位置
            const isLoggedIn = window.appState && window.appState.getState('user.isLoggedIn');
            if (isLoggedIn) {
                this.navigate('home', {}, false);
            } else {
                this.navigate('index', {}, false);
            }
            return false;
        }
    }

    // 获取当前路由
    getCurrentRoute() {
        return this.currentRoute;
    }

    // 获取导航历史
    getHistory() {
        return [...this.history];
    }

    // 清空历史记录
    clearHistory() {
        this.history = [];
    }

    // 检查是否可以返回
    canGoBack() {
        return this.history.length > 0;
    }

    // 根据当前页面URL推断路由名称
    getCurrentRouteFromURL() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        
        for (const [name, route] of this.routes) {
            if (route.path === currentPath) {
                return name;
            }
        }
        
        return 'index';
    }

    // 初始化当前页面路由
    initCurrentRoute() {
        const routeName = this.getCurrentRouteFromURL();
        const route = this.routes.get(routeName);
        
        if (route) {
            this.currentRoute = {
                name: routeName,
                route: route,
                params: {},
                timestamp: Date.now()
            };
        }
    }
}

// 创建全局路由实例
window.router = new Router();

// 页面加载完成后初始化当前路由
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.router) {
            window.router.initCurrentRoute();
        }
    });
} else {
    // DOM已经加载完成
    if (window.router) {
        window.router.initCurrentRoute();
    }
}

// 导出路由类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Router;
}
