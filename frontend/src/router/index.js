import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 路由懒加载
const Home = () => import('@/views/Home.vue')
const ComponentTest = () => import('@/views/ComponentTest.vue')
const ApiTest = () => import('@/views/ApiTest.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const ProfileSetup = () => import('@/views/auth/ProfileSetup.vue')
const QuestionInput = () => import('@/views/divination/QuestionInput.vue')
const DivinationLoading = () => import('@/views/divination/DivinationLoading.vue')
const DivinationResult = () => import('@/views/divination/DivinationResult.vue')
const History = () => import('@/views/divination/History.vue')
const UserCenter = () => import('@/views/user/UserCenter.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '梅花心易 - 首页',
      requiresAuth: false
    }
  },
  {
    path: '/test',
    name: 'component-test',
    component: ComponentTest,
    meta: {
      title: '组件测试',
      requiresAuth: false
    }
  },
  {
    path: '/api-test',
    name: 'api-test',
    component: ApiTest,
    meta: {
      title: 'API集成测试',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录 - 梅花心易',
      requiresAuth: false,
      hideForAuth: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册 - 梅花心易',
      requiresAuth: false,
      hideForAuth: true
    }
  },
  {
    path: '/profile-setup',
    name: 'ProfileSetup',
    component: ProfileSetup,
    meta: {
      title: '完善资料 - 梅花心易',
      requiresAuth: true
    }
  },
  {
    path: '/divination',
    name: 'Divination',
    children: [
      {
        path: 'question',
        name: 'QuestionInput',
        component: QuestionInput,
        meta: {
          title: '问题输入 - 梅花心易',
          requiresAuth: true
        }
      },
      {
        path: 'loading',
        name: 'DivinationLoading',
        component: DivinationLoading,
        meta: {
          title: '占卜中 - 梅花心易',
          requiresAuth: true
        }
      },
      {
        path: 'result/:id?',
        name: 'DivinationResult',
        component: DivinationResult,
        meta: {
          title: '占卜结果 - 梅花心易',
          requiresAuth: true
        }
      },
      {
        path: 'history',
        name: 'History',
        component: History,
        meta: {
          title: '历史记录 - 梅花心易',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    children: [
      {
        path: 'center',
        name: 'UserCenter',
        component: UserCenter,
        meta: {
          title: '用户中心 - 梅花心易',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 未登录用户重定向到登录页
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // 已登录用户访问登录/注册页面时重定向到首页
  if (to.meta.hideForAuth && userStore.isLoggedIn) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

export default router
