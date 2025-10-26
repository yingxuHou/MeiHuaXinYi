<template>
  <StarryBackground :animated="true" :show-decorations="true">
    <div class="login-container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <MysticalButton
          variant="ghost"
          size="small"
          left-icon="fas fa-arrow-left"
          @click="goBack"
        >
          返回
        </MysticalButton>
      </div>

      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-container">
          <div class="logo-ring"></div>
          <div class="logo-circle">
            <i class="fas fa-yin-yang logo-icon"></i>
          </div>
        </div>
        <h1 class="page-title">登录账户</h1>
        <p class="page-subtitle">欢迎回到梅花心易</p>
      </div>

      <!-- 登录表单 -->
      <MysticalCard variant="default" size="large" class="login-form-card">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          @submit.prevent="handleLogin"
          class="login-form"
        >
          <!-- 邮箱输入 -->
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              type="email"
              placeholder="请输入邮箱地址"
              size="large"
              :prefix-icon="Message"
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              clearable
              @keyup.enter="handleLogin"
            >
              <template #suffix>
                <el-icon 
                  class="password-toggle" 
                  @click="showPassword = !showPassword"
                >
                  <View v-if="showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 记住登录和忘记密码 -->
          <div class="form-options">
            <el-checkbox v-model="loginForm.rememberMe">
              记住登录状态
            </el-checkbox>
            <el-link type="primary" @click="showForgotPassword = true">
              忘记密码？
            </el-link>
          </div>

          <!-- 登录按钮 -->
          <el-form-item>
            <MysticalButton
              variant="primary"
              size="large"
              :full-width="true"
              :loading="loading"
              left-icon="fas fa-sign-in-alt"
              @click="handleLogin"
            >
              {{ loading ? '登录中...' : '登录' }}
            </MysticalButton>
          </el-form-item>

          <!-- 分割线 -->
          <div class="divider">
            <span>或</span>
          </div>

          <!-- 第三方登录 -->
          <div class="social-login">
            <MysticalButton
              variant="outline"
              size="medium"
              :full-width="true"
              left-icon="fab fa-wechat"
              @click="handleSocialLogin('wechat')"
            >
              微信登录
            </MysticalButton>
          </div>

          <!-- 注册链接 -->
          <div class="register-link">
            <span>还没有账户？</span>
            <el-link type="primary" @click="goToRegister">
              立即注册
            </el-link>
          </div>
        </el-form>
      </MysticalCard>

      <!-- 忘记密码对话框 -->
      <el-dialog
        v-model="showForgotPassword"
        title="重置密码"
        width="90%"
        :max-width="400"
        center
      >
        <el-form
          ref="forgotFormRef"
          :model="forgotForm"
          :rules="forgotRules"
          @submit.prevent="handleForgotPassword"
        >
          <el-form-item prop="email">
            <el-input
              v-model="forgotForm.email"
              type="email"
              placeholder="请输入注册邮箱"
              size="large"
              :prefix-icon="Message"
              clearable
            />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <MysticalButton
              variant="secondary"
              @click="showForgotPassword = false"
            >
              取消
            </MysticalButton>
            <MysticalButton
              variant="primary"
              :loading="forgotLoading"
              @click="handleForgotPassword"
            >
              发送重置邮件
            </MysticalButton>
          </div>
        </template>
      </el-dialog>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'
import { validateEmail } from '@/utils'

// 路由和状态管理
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const loginFormRef = ref()
const forgotFormRef = ref()
const loading = ref(false)
const forgotLoading = ref(false)
const showPassword = ref(false)
const showForgotPassword = ref(false)

// 登录表单
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 忘记密码表单
const forgotForm = reactive({
  email: ''
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (!validateEmail(value)) {
        callback(new Error('请输入有效的邮箱地址'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 方法
const goBack = () => {
  router.go(-1)
}

const goToRegister = () => {
  router.push('/register')
}

const handleLogin = async () => {
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    loading.value = true

    const result = await userStore.login({
      email: loginForm.email,
      password: loginForm.password,
      rememberMe: loginForm.rememberMe
    })

    if (result.success) {
      ElMessage.success('登录成功')
      
      // 跳转到指定页面或首页
      const redirectPath = route.query.redirect || '/'
      router.push(redirectPath)
    }
  } catch (error) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (platform) => {
  ElMessage.info(`${platform}登录功能开发中...`)
}

const handleForgotPassword = async () => {
  try {
    const valid = await forgotFormRef.value.validate()
    if (!valid) return

    forgotLoading.value = true

    // TODO: 调用重置密码API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('重置邮件已发送，请查收邮箱')
    showForgotPassword.value = false
    forgotForm.email = ''
  } catch (error) {
    ElMessage.error(error.message || '发送失败')
  } finally {
    forgotLoading.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('login')
  
  // 如果已经登录，直接跳转
  if (userStore.isLoggedIn) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 1rem;
}

.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.logo-ring {
  position: absolute;
  inset: 0;
  width: 80px;
  height: 80px;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 50%;
  animation: pulse-ring 2s infinite;
}

.logo-circle {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 6s ease-in-out infinite;
  box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3);
}

.logo-icon {
  font-size: 2rem;
  color: #1e3a8a;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.login-form-card {
  width: 100%;
  max-width: 400px;
}

.login-form {
  width: 100%;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.password-toggle {
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #fbbf24;
}

.divider {
  text-align: center;
  margin: 1.5rem 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider span {
  background: rgba(255, 255, 255, 0.1);
  padding: 0 1rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

.social-login {
  margin-bottom: 1.5rem;
}

.register-link {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
}

.register-link span {
  margin-right: 0.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .login-container {
    padding: 1rem 0.5rem;
  }

  .back-button {
    top: 1rem;
    left: 0.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .logo-circle,
  .logo-ring {
    width: 70px;
    height: 70px;
  }

  .logo-icon {
    font-size: 1.75rem;
  }

  .form-options {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>
