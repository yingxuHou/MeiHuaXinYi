<template>
  <StarryBackground :animated="true" :show-decorations="true">
    <div class="profile-setup-container">
      <!-- 进度指示器 -->
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}% 完成</div>
      </div>

      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-container">
          <div class="logo-ring"></div>
          <div class="logo-circle">
            <i class="fas fa-user-plus logo-icon"></i>
          </div>
        </div>
        <h1 class="page-title">完善资料</h1>
        <p class="page-subtitle">让我们更好地为您服务</p>
      </div>

      <!-- 资料表单 -->
      <MysticalCard variant="default" size="large" class="profile-form-card">
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          @submit.prevent="handleSubmit"
          class="profile-form"
          label-position="top"
        >
          <!-- 昵称输入 -->
          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="profileForm.nickname"
              placeholder="请输入您的昵称"
              size="large"
              :prefix-icon="User"
              clearable
              maxlength="20"
              show-word-limit
            />
            <div class="field-tip">
              <i class="fas fa-info-circle"></i>
              <span>昵称将用于个性化显示</span>
            </div>
          </el-form-item>

          <!-- 性别选择 -->
          <el-form-item label="性别" prop="gender">
            <div class="gender-options">
              <div 
                v-for="option in genderOptions" 
                :key="option.value"
                class="gender-option"
                :class="{ active: profileForm.gender === option.value }"
                @click="profileForm.gender = option.value"
              >
                <div class="option-icon">
                  <i :class="option.icon"></i>
                </div>
                <span class="option-label">{{ option.label }}</span>
              </div>
            </div>
          </el-form-item>

          <!-- 生日选择 -->
          <el-form-item label="生日" prop="birthDate">
            <el-date-picker
              v-model="profileForm.birthDate"
              type="date"
              placeholder="选择您的生日"
              size="large"
              style="width: 100%"
              :disabled-date="disabledDate"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
            <div class="field-tip">
              <i class="fas fa-info-circle"></i>
              <span>生日信息有助于提供更准确的占卜结果</span>
            </div>
          </el-form-item>

          <!-- 手机号输入（可选） -->
          <el-form-item label="手机号（可选）" prop="phone">
            <el-input
              v-model="profileForm.phone"
              placeholder="请输入手机号"
              size="large"
              :prefix-icon="Phone"
              clearable
              maxlength="11"
            />
            <div class="field-tip">
              <i class="fas fa-info-circle"></i>
              <span>用于接收重要通知，可稍后补充</span>
            </div>
          </el-form-item>

          <!-- 兴趣标签 -->
          <el-form-item label="感兴趣的占卜类型">
            <div class="interest-tags">
              <div 
                v-for="tag in interestTags" 
                :key="tag.value"
                class="interest-tag"
                :class="{ active: profileForm.interests.includes(tag.value) }"
                @click="toggleInterest(tag.value)"
              >
                <i :class="tag.icon"></i>
                <span>{{ tag.label }}</span>
              </div>
            </div>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item>
            <MysticalButton
              variant="primary"
              size="large"
              :full-width="true"
              :loading="loading"
              left-icon="fas fa-check"
              @click="handleSubmit"
            >
              {{ loading ? '保存中...' : '完成设置' }}
            </MysticalButton>
          </el-form-item>

          <!-- 跳过按钮 -->
          <div class="skip-section">
            <MysticalButton
              variant="ghost"
              size="medium"
              @click="skipSetup"
            >
              暂时跳过
            </MysticalButton>
          </div>
        </el-form>
      </MysticalCard>

      <!-- 温馨提示 -->
      <MysticalCard variant="dark" size="small" class="tip-card">
        <div class="tip-content">
          <i class="fas fa-lightbulb tip-icon"></i>
          <div class="tip-text">
            <h4>温馨提示</h4>
            <p>完善的个人资料有助于我们为您提供更精准的占卜服务和个性化体验。</p>
          </div>
        </div>
      </MysticalCard>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Phone } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'
import { validatePhone } from '@/utils'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const profileFormRef = ref()
const loading = ref(false)

// 资料表单
const profileForm = reactive({
  nickname: '',
  gender: '',
  birthDate: '',
  phone: '',
  interests: []
})

// 性别选项
const genderOptions = ref([
  { value: 'male', label: '男', icon: 'fas fa-mars' },
  { value: 'female', label: '女', icon: 'fas fa-venus' },
  { value: 'other', label: '其他', icon: 'fas fa-genderless' }
])

// 兴趣标签
const interestTags = ref([
  { value: 'career', label: '事业发展', icon: 'fas fa-briefcase' },
  { value: 'love', label: '感情婚姻', icon: 'fas fa-heart' },
  { value: 'health', label: '健康状况', icon: 'fas fa-heartbeat' },
  { value: 'wealth', label: '财运投资', icon: 'fas fa-coins' },
  { value: 'study', label: '学业考试', icon: 'fas fa-graduation-cap' },
  { value: 'family', label: '家庭关系', icon: 'fas fa-home' }
])

// 表单验证规则
const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthDate: [
    { required: true, message: '请选择生日', trigger: 'change' }
  ],
  phone: [
    { validator: (rule, value, callback) => {
      if (!value) {
        callback() // 可选字段
        return
      }

      if (!validatePhone(value)) {
        const { getPhoneValidationError } = require('@/utils')
        const error = getPhoneValidationError(value)
        callback(new Error(error || '请输入有效的11位手机号，如：138****8000'))
      } else {
        callback()
      }
    }, trigger: 'blur' }
  ]
}

// 计算属性
const progress = computed(() => {
  let completed = 0
  const total = 4 // 必填字段数量
  
  if (profileForm.nickname) completed++
  if (profileForm.gender) completed++
  if (profileForm.birthDate) completed++
  if (profileForm.interests.length > 0) completed++
  
  return (completed / total) * 100
})

// 方法
const disabledDate = (time) => {
  // 禁用未来日期和过于久远的日期
  const now = new Date()
  const minDate = new Date(now.getFullYear() - 100, 0, 1)
  return time.getTime() > now.getTime() || time.getTime() < minDate.getTime()
}

const toggleInterest = (value) => {
  const index = profileForm.interests.indexOf(value)
  if (index > -1) {
    profileForm.interests.splice(index, 1)
  } else {
    profileForm.interests.push(value)
  }
}

const handleSubmit = async () => {
  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    loading.value = true

    // 准备提交数据
    const profileData = {
      nickname: profileForm.nickname,
      gender: profileForm.gender,
      birthDate: profileForm.birthDate,
      phone: profileForm.phone,
      interests: profileForm.interests
    }

    const result = await userStore.updateProfile(profileData)

    if (result.success) {
      ElMessage.success('资料设置完成！')
      
      // 跳转到首页
      router.push('/')
    }
  } catch (error) {
    ElMessage.error(error.message || '保存失败，请重试')
  } finally {
    loading.value = false
  }
}

const skipSetup = () => {
  ElMessage.info('您可以稍后在个人中心完善资料')
  router.push('/')
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('profile-setup')
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 如果已经完善过资料，跳转到首页
  if (userStore.hasCompletedProfile) {
    router.push('/')
    return
  }

  // 预填充已有信息
  if (userStore.userInfo.nickname) {
    profileForm.nickname = userStore.userInfo.nickname
  }
  if (userStore.userInfo.gender) {
    profileForm.gender = userStore.userInfo.gender
  }
  if (userStore.userInfo.birthDate) {
    profileForm.birthDate = userStore.userInfo.birthDate
  }
  if (userStore.userInfo.phone) {
    profileForm.phone = userStore.userInfo.phone
  }
})
</script>

<style scoped>
.profile-setup-container {
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
}

.progress-section {
  width: 100%;
  margin-bottom: 2rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
  border-radius: 3px;
  transition: width 0.3s ease;
  box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
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

.profile-form-card {
  width: 100%;
  max-width: 400px;
  margin-bottom: 1.5rem;
}

.profile-form {
  width: 100%;
}

.field-tip {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.field-tip i {
  color: #6366f1;
}

.gender-options {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.gender-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  max-width: 80px;
}

.gender-option:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.gender-option.active {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  color: #fbbf24;
}

.option-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.gender-option.active .option-icon {
  background: rgba(251, 191, 36, 0.3);
}

.option-icon i {
  font-size: 1rem;
}

.option-label {
  font-size: 0.875rem;
  font-weight: 500;
}

.interest-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.interest-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.interest-tag:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.interest-tag.active {
  background: rgba(251, 191, 36, 0.2);
  border-color: #fbbf24;
  color: #fbbf24;
}

.interest-tag i {
  font-size: 0.875rem;
}

.skip-section {
  text-align: center;
  margin-top: 1rem;
}

.tip-card {
  width: 100%;
  max-width: 400px;
}

.tip-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.tip-icon {
  font-size: 1.25rem;
  color: #fbbf24;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.tip-text h4 {
  font-size: 1rem;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
}

.tip-text p {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .profile-setup-container {
    padding: 1rem 0.5rem;
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

  .gender-options {
    gap: 0.5rem;
  }

  .gender-option {
    padding: 0.75rem;
    max-width: 70px;
  }

  .interest-tags {
    gap: 0.5rem;
  }

  .interest-tag {
    padding: 0.375rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
