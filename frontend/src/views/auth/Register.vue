<template>
	<StarryBackground :animated="true" :show-decorations="true">
		<div class="register-container">
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
				<h1 class="page-title">创建账户</h1>
				<p class="page-subtitle">开启您的智慧之旅</p>
			</div>

			<!-- 注册表单 -->
			<MysticalCard variant="default" size="large" class="register-form-card">
				<el-form
					ref="registerFormRef"
					:model="registerForm"
					:rules="registerRules"
					@submit.prevent="handleRegister"
					class="register-form"
				>
					<!-- 邮箱输入 -->
					<el-form-item prop="email">
						<el-input
							v-model="registerForm.email"
							type="email"
							placeholder="请输入邮箱地址"
							size="large"
							:prefix-icon="Message"
							clearable
						/>
					</el-form-item>

					<!-- 密码输入 -->
					<el-form-item prop="password">
						<el-input
							v-model="registerForm.password"
							:type="showPassword ? 'text' : 'password'"
							placeholder="请输入密码（6-128位，必须包含大写字母、小写字母和数字）"
							size="large"
							:prefix-icon="Lock"
							clearable
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
						<!-- 密码强度指示器 -->
						<div class="password-strength" v-if="registerForm.password">
							<div class="strength-bar">
								<div 
									class="strength-fill" 
									:class="passwordStrength.strength"
									:style="{ width: getStrengthWidth() }"
								></div>
							</div>
							<div class="strength-text">
								密码强度：{{ getStrengthText() }}
							</div>
						</div>
					</el-form-item>

					<!-- 确认密码 -->
					<el-form-item prop="confirmPassword">
						<el-input
							v-model="registerForm.confirmPassword"
							:type="showConfirmPassword ? 'text' : 'password'"
							placeholder="请再次输入密码"
							size="large"
							:prefix-icon="Lock"
							clearable
						>
							<template #suffix>
								<el-icon 
									class="password-toggle" 
									@click="showConfirmPassword = !showConfirmPassword"
								>
									<View v-if="showConfirmPassword" />
									<Hide v-else />
								</el-icon>
							</template>
						</el-input>
					</el-form-item>

					<!-- 用户协议 -->
					<el-form-item prop="agreeTerms">
						<el-checkbox v-model="registerForm.agreeTerms">
							我已阅读并同意
							<el-link type="primary" @click="showTerms = true">
								《用户协议》
							</el-link>
							和
							<el-link type="primary" @click="showPrivacy = true">
								《隐私政策》
							</el-link>
						</el-checkbox>
					</el-form-item>

					<!-- 注册按钮 -->
					<el-form-item>
						<MysticalButton
							variant="primary"
							size="large"
							:full-width="true"
							:loading="loading"
							left-icon="fas fa-user-plus"
							@click="handleRegister"
						>
							{{ loading ? '注册中...' : '立即注册' }}
						</MysticalButton>
					</el-form-item>

					<!-- 登录链接 -->
					<div class="login-link">
						<span>已有账户？</span>
						<el-link type="primary" @click="goToLogin">
							立即登录
						</el-link>
					</div>
				</el-form>
			</MysticalCard>

			<!-- 用户协议对话框 -->
			<el-dialog
				v-model="showTerms"
				title="用户协议"
				width="90%"
				:max-width="600"
				center
			>
				<div class="terms-content">
					<p>欢迎使用梅花心易占卜应用！</p>
					<p>在使用我们的服务之前，请仔细阅读以下用户协议...</p>
					<!-- 这里可以添加完整的用户协议内容 -->
				</div>
				<template #footer>
					<MysticalButton variant="primary" @click="showTerms = false">
						我已了解
					</MysticalButton>
				</template>
			</el-dialog>

			<!-- 隐私政策对话框 -->
			<el-dialog
				v-model="showPrivacy"
				title="隐私政策"
				width="90%"
				:max-width="600"
				center
			>
				<div class="privacy-content">
					<p>我们非常重视您的隐私保护...</p>
					<!-- 这里可以添加完整的隐私政策内容 -->
				</div>
				<template #footer>
					<MysticalButton variant="primary" @click="showPrivacy = false">
						我已了解
					</MysticalButton>
				</template>
			</el-dialog>
		</div>
	</StarryBackground>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock, View, Hide } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'
import { validateEmail, validatePassword } from '@/utils'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const registerFormRef = ref()
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const showTerms = ref(false)
const showPrivacy = ref(false)

// 注册表单（仅邮箱、密码、确认密码）
const registerForm = reactive({
	email: '',
	password: '',
	confirmPassword: '',
	agreeTerms: false
})

// 表单验证规则
const registerRules = {
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
			{ validator: (rule, value, callback) => {
				if (!value) return callback(new Error('请输入密码'))
				// 长度检查
				if (value.length < 6 || value.length > 128) {
					return callback(new Error('密码长度必须在6-128个字符之间'))
				}
				// 与后端一致：必须包含小写、大写、数字
				const backendRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
				if (!backendRule.test(value)) {
					return callback(new Error('密码必须包含至少一个小写字母、一个大写字母和一个数字'))
				}
				callback()
			}, trigger: 'blur' }
		],
	confirmPassword: [
		{ required: true, message: '请再次输入密码', trigger: 'blur' },
		{ validator: (rule, value, callback) => {
			if (value !== registerForm.password) {
				callback(new Error('两次输入的密码不一致'))
			} else {
				callback()
			}
		}, trigger: 'blur' }
	],
	agreeTerms: [
		{ validator: (rule, value, callback) => {
			if (!value) {
				callback(new Error('请同意用户协议和隐私政策'))
			} else {
				callback()
			}
		}, trigger: 'change' }
	]
}

// 密码强度
const passwordStrength = computed(() => {
	return validatePassword(registerForm.password)
})

const getStrengthWidth = () => {
	const strength = passwordStrength.value.strength
	switch (strength) {
		case 'weak': return '33%'
		case 'medium': return '66%'
		case 'strong': return '100%'
		default: return '0%'
	}
}

const getStrengthText = () => {
	const strength = passwordStrength.value.strength
	switch (strength) {
		case 'weak': return '弱'
		case 'medium': return '中'
		case 'strong': return '强'
		default: return '弱'
	}
}

// 方法
const goBack = () => { router.go(-1) }
const goToLogin = () => { router.push('/login') }

const handleRegister = async () => {
	try {
		const valid = await registerFormRef.value.validate()
		if (!valid) return

		if (!registerForm.agreeTerms) {
			ElMessage.warning('请先同意用户协议和隐私政策')
			return
		}

		loading.value = true

		const result = await userStore.register({
			email: registerForm.email,
			password: registerForm.password
		})

		if (result.success) {
			ElMessage.success('注册成功！')
			if (result.data?.isFirstLogin) {
				router.push('/profile-setup')
			} else {
				router.push('/')
			}
		}
	} catch (error) {
		// 如果有详细的验证错误信息，优先显示
		let errorMessage = error.message || '注册失败'
		
		// 如果是验证错误，尝试提取更详细的错误信息
		if (error.details && Array.isArray(error.details) && error.details.length > 0) {
			// 找到密码相关的错误
			const passwordError = error.details.find(d => d.param === 'password' || d.path === 'password')
			if (passwordError) {
				errorMessage = passwordError.msg || passwordError.message || errorMessage
			} else {
				// 显示第一个错误
				const firstError = error.details[0]
				errorMessage = firstError.msg || firstError.message || errorMessage
			}
		}
		
		ElMessage.error(errorMessage)
		console.error('注册失败:', error)
	} finally {
		loading.value = false
	}
}

// 组件挂载时初始化
onMounted(() => {
	appStore.setCurrentRoute('register')
	if (userStore.isLoggedIn) {
		router.push('/')
	}
})

// 组件卸载时清理（无定时器，此处保留结构）
onUnmounted(() => {})
</script>

<style scoped>
/* 保持原有样式不变 */
.register-container {
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

.back-button { position: absolute; top: 2rem; left: 1rem; }
.logo-section { text-align: center; margin-bottom: 2rem; }
.logo-container { position: relative; display: inline-block; margin-bottom: 1.5rem; }
.logo-ring { position: absolute; inset: 0; width: 80px; height: 80px; background: rgba(251, 191, 36, 0.2); border-radius: 50%; animation: pulse-ring 2s infinite; }
.logo-circle { position: relative; width: 80px; height: 80px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: float 6s ease-in-out infinite; box-shadow: 0 8px 32px rgba(251, 191, 36, 0.3); }
.logo-icon { font-size: 2rem; color: #1e3a8a; }
.page-title { font-size: 2rem; font-weight: bold; color: #ffffff; margin-bottom: 0.5rem; }
.page-subtitle { font-size: 1rem; color: rgba(255, 255, 255, 0.7); margin: 0; }
.register-form-card { width: 100%; max-width: 400px; }
.register-form { width: 100%; }
.password-toggle { cursor: pointer; color: rgba(255, 255, 255, 0.6); transition: color 0.3s ease; }
.password-toggle:hover { color: #fbbf24; }
.password-strength { margin-top: 0.5rem; }
.strength-bar { height: 4px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden; margin-bottom: 0.25rem; }
.strength-fill { height: 100%; transition: all 0.3s ease; border-radius: 2px; }
.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #10b981; }
.strength-text { font-size: 0.75rem; color: rgba(255, 255, 255, 0.6); }
.login-link { text-align: center; color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; }
.login-link span { margin-right: 0.5rem; }

/* 响应式调整 */
@media (max-width: 768px) {
	.register-container { padding: 1rem 0.5rem; }
	.back-button { top: 1rem; left: 0.5rem; }
	.page-title { font-size: 1.75rem; }
	.logo-circle, .logo-ring { width: 70px; height: 70px; }
	.logo-icon { font-size: 1.75rem; }
}
</style>
