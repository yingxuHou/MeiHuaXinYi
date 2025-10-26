<template>
  <StarryBackground :animated="true" :show-decorations="false">
    <div class="user-center-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <MysticalButton
          variant="ghost"
          size="small"
          left-icon="fas fa-arrow-left"
          @click="goBack"
          class="back-button"
        >
          返回
        </MysticalButton>
        
        <h1 class="page-title">个人中心</h1>
        
        <MysticalButton
          variant="ghost"
          size="small"
          left-icon="fas fa-cog"
          @click="showSettings = true"
          class="settings-button"
        >
          设置
        </MysticalButton>
      </div>

      <!-- 用户信息卡片 -->
      <MysticalCard variant="primary" size="large" :glowing="true" class="user-info-card">
        <div class="user-profile">
          <!-- 头像区域 -->
          <div class="avatar-section">
            <div class="avatar-container">
              <img 
                v-if="userStore.userInfo.avatar" 
                :src="userStore.userInfo.avatar" 
                :alt="userStore.userInfo.nickname"
                class="user-avatar"
              />
              <div v-else class="default-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="avatar-edit" @click="editAvatar">
                <i class="fas fa-camera"></i>
              </div>
            </div>
          </div>
          
          <!-- 用户信息 -->
          <div class="user-details">
            <h2 class="user-name">{{ userStore.userInfo.nickname || '未设置昵称' }}</h2>
            <p class="user-email">{{ userStore.userInfo.email }}</p>
            <div class="user-meta">
              <span class="join-date">
                <i class="fas fa-calendar"></i>
                加入时间：{{ formatDate(userStore.userInfo.createdAt, 'YYYY-MM-DD') }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 用户统计 -->
        <div class="user-stats">
          <div class="stat-item">
            <span class="stat-number">{{ userStore.freeCount }}</span>
            <span class="stat-label">剩余次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalDivinations }}</span>
            <span class="stat-label">总占卜数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.favoriteCount }}</span>
            <span class="stat-label">收藏数量</span>
          </div>
        </div>
      </MysticalCard>

      <!-- 功能菜单 -->
      <div class="menu-section">
        <MysticalCard
          v-for="menuItem in menuItems"
          :key="menuItem.id"
          variant="default"
          size="medium"
          :hoverable="true"
          :clickable="true"
          @click="handleMenuClick(menuItem)"
          class="menu-item"
        >
          <div class="menu-content">
            <div class="menu-icon">
              <i :class="menuItem.icon"></i>
            </div>
            <div class="menu-info">
              <h3 class="menu-title">{{ menuItem.title }}</h3>
              <p class="menu-description">{{ menuItem.description }}</p>
            </div>
            <div class="menu-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </MysticalCard>
      </div>

      <!-- 快捷操作 -->
      <div class="quick-actions">
        <MysticalButton
          variant="primary"
          size="large"
          :full-width="true"
          left-icon="fas fa-yin-yang"
          @click="startDivination"
        >
          开始占卜
        </MysticalButton>
        
        <div class="action-row">
          <MysticalButton
            variant="outline"
            size="medium"
            left-icon="fas fa-history"
            @click="viewHistory"
          >
            历史记录
          </MysticalButton>
          
          <MysticalButton
            variant="outline"
            size="medium"
            left-icon="fas fa-heart"
            @click="viewFavorites"
          >
            我的收藏
          </MysticalButton>
        </div>
      </div>

      <!-- 设置对话框 -->
      <el-dialog
        v-model="showSettings"
        title="设置"
        width="90%"
        :max-width="400"
        center
      >
        <div class="settings-content">
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="setting-title">主题模式</h4>
              <p class="setting-description">切换应用主题</p>
            </div>
            <el-switch
              v-model="darkMode"
              active-text="深色"
              inactive-text="浅色"
              @change="toggleTheme"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="setting-title">动画效果</h4>
              <p class="setting-description">开启或关闭动画</p>
            </div>
            <el-switch
              v-model="animationEnabled"
              active-text="开启"
              inactive-text="关闭"
              @change="toggleAnimation"
            />
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h4 class="setting-title">消息通知</h4>
              <p class="setting-description">接收占卜提醒</p>
            </div>
            <el-switch
              v-model="notificationEnabled"
              active-text="开启"
              inactive-text="关闭"
              @change="toggleNotification"
            />
          </div>
        </div>
        
        <template #footer>
          <div class="dialog-footer">
            <MysticalButton
              variant="secondary"
              @click="showSettings = false"
            >
              取消
            </MysticalButton>
            <MysticalButton
              variant="primary"
              @click="saveSettings"
            >
              保存
            </MysticalButton>
          </div>
        </template>
      </el-dialog>

      <!-- 编辑资料对话框 -->
      <el-dialog
        v-model="showEditProfile"
        title="编辑资料"
        width="90%"
        :max-width="400"
        center
      >
        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-width="80px"
        >
          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="profileForm.nickname"
              placeholder="请输入昵称"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="profileForm.gender">
              <el-radio label="male">男</el-radio>
              <el-radio label="female">女</el-radio>
              <el-radio label="other">其他</el-radio>
            </el-radio-group>
          </el-form-item>
          
          <el-form-item label="生日" prop="birthDate">
            <el-date-picker
              v-model="profileForm.birthDate"
              type="date"
              placeholder="选择生日"
              style="width: 100%"
              :disabled-date="disabledDate"
            />
          </el-form-item>
          
          <el-form-item label="手机" prop="phone">
            <el-input
              v-model="profileForm.phone"
              placeholder="请输入11位手机号，如：138****8000"
              maxlength="13"
              @input="formatPhoneInput"
              @blur="cleanPhoneInputMethod"
            />
            <div class="field-tip" v-if="profileForm.phone">
              <i class="fas fa-info-circle"></i>
              <span>格式化显示：{{ formatPhoneDisplay(profileForm.phone) }}</span>
            </div>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <MysticalButton
              variant="secondary"
              @click="showEditProfile = false"
            >
              取消
            </MysticalButton>
            <MysticalButton
              variant="primary"
              :loading="updating"
              @click="updateProfile"
            >
              保存
            </MysticalButton>
          </div>
        </template>
      </el-dialog>

      <!-- 退出登录确认 -->
      <el-dialog
        v-model="showLogoutConfirm"
        title="退出登录"
        width="90%"
        :max-width="300"
        center
      >
        <p>确定要退出登录吗？</p>
        <template #footer>
          <div class="dialog-footer">
            <MysticalButton
              variant="secondary"
              @click="showLogoutConfirm = false"
            >
              取消
            </MysticalButton>
            <MysticalButton
              variant="danger"
              @click="confirmLogout"
            >
              退出
            </MysticalButton>
          </div>
        </template>
      </el-dialog>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'
import { formatDate, validatePhone, cleanPhoneInput, formatPhoneDisplay, getPhoneValidationError } from '@/utils'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const appStore = useAppStore()

// 响应式数据
const profileFormRef = ref()
const showSettings = ref(false)
const showEditProfile = ref(false)
const showLogoutConfirm = ref(false)
const updating = ref(false)
const darkMode = ref(true)
const animationEnabled = ref(true)
const notificationEnabled = ref(true)

// 统计数据
const stats = ref({
  totalDivinations: 0,
  favoriteCount: 0
})

// 编辑资料表单
const profileForm = reactive({
  nickname: '',
  gender: '',
  birthDate: '',
  phone: ''
})

// 表单验证规则
const profileRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在2-20个字符', trigger: 'blur' }
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

// 菜单项
const menuItems = ref([
  {
    id: 1,
    title: '编辑资料',
    description: '完善个人信息',
    icon: 'fas fa-user-edit',
    action: 'editProfile'
  },
  {
    id: 2,
    title: '修改密码',
    description: '更改登录密码',
    icon: 'fas fa-key',
    action: 'changePassword'
  },
  {
    id: 3,
    title: '隐私设置',
    description: '管理隐私选项',
    icon: 'fas fa-shield-alt',
    action: 'privacy'
  },
  {
    id: 4,
    title: '帮助中心',
    description: '使用帮助和FAQ',
    icon: 'fas fa-question-circle',
    action: 'help'
  },
  {
    id: 5,
    title: '关于我们',
    description: '了解梅花心易',
    icon: 'fas fa-info-circle',
    action: 'about'
  },
  {
    id: 6,
    title: '退出登录',
    description: '安全退出账户',
    icon: 'fas fa-sign-out-alt',
    action: 'logout'
  }
])

// 方法
const goBack = () => {
  router.go(-1)
}

const editAvatar = () => {
  ElMessage.info('头像上传功能开发中...')
}

const handleMenuClick = (menuItem) => {
  switch (menuItem.action) {
    case 'editProfile':
      openEditProfile()
      break
    case 'changePassword':
      ElMessage.info('修改密码功能开发中...')
      break
    case 'privacy':
      ElMessage.info('隐私设置功能开发中...')
      break
    case 'help':
      ElMessage.info('帮助中心功能开发中...')
      break
    case 'about':
      ElMessage.info('关于我们功能开发中...')
      break
    case 'logout':
      showLogoutConfirm.value = true
      break
  }
}

const openEditProfile = () => {
  // 填充当前用户信息
  profileForm.nickname = userStore.userInfo.nickname || ''
  profileForm.gender = userStore.userInfo.gender || ''
  profileForm.birthDate = userStore.userInfo.birthDate || ''
  profileForm.phone = userStore.userInfo.phone || ''
  
  showEditProfile.value = true
}

const updateProfile = async () => {
  try {
    const valid = await profileFormRef.value.validate()
    if (!valid) return

    updating.value = true

    const result = await userStore.updateProfile({
      nickname: profileForm.nickname,
      gender: profileForm.gender,
      birthDate: profileForm.birthDate,
      phone: profileForm.phone
    })

    if (result.success) {
      ElMessage.success('资料更新成功')
      showEditProfile.value = false
    }
  } catch (error) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    updating.value = false
  }
}

const disabledDate = (time) => {
  // 禁用未来日期
  return time.getTime() > Date.now()
}

// 手机号格式化方法
const formatPhoneInput = (value) => {
  // 实时格式化显示（保持原始输入）
  // 这里不修改实际值，只是为了用户体验
}

const cleanPhoneInputMethod = () => {
  // 失焦时清理手机号输入
  if (profileForm.phone) {
    profileForm.phone = cleanPhoneInput(profileForm.phone)
  }
}

const startDivination = () => {
  if (userStore.freeCount <= 0) {
    ElMessage.warning('今日免费次数已用完')
    return
  }
  router.push('/divination/question')
}

const viewHistory = () => {
  router.push('/divination/history')
}

const viewFavorites = () => {
  router.push('/divination/history?filter=favorite')
}

const toggleTheme = (value) => {
  appStore.setTheme(value ? 'dark' : 'light')
  ElMessage.success(`已切换到${value ? '深色' : '浅色'}主题`)
}

const toggleAnimation = (value) => {
  ElMessage.success(`动画效果已${value ? '开启' : '关闭'}`)
}

const toggleNotification = (value) => {
  ElMessage.success(`消息通知已${value ? '开启' : '关闭'}`)
}

const saveSettings = () => {
  ElMessage.success('设置已保存')
  showSettings.value = false
}

const confirmLogout = () => {
  userStore.logout()
  ElMessage.success('已退出登录')
  router.push('/')
}

const loadStats = async () => {
  try {
    // TODO: 替换为实际API调用
    // const response = await divinationAPI.getStatistics()
    
    // 模拟统计数据
    stats.value = {
      totalDivinations: 42,
      favoriteCount: 5
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('user-center')
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 加载统计数据
  loadStats()
})
</script>

<style scoped>
.user-center-container {
  min-height: 100vh;
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.user-info-card {
  margin-bottom: 2rem;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar-section {
  position: relative;
}

.avatar-container {
  position: relative;
  width: 80px;
  height: 80px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #1e3a8a;
}

.default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #312e81);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #1e3a8a;
}

.default-avatar i {
  font-size: 2rem;
  color: #fbbf24;
}

.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24px;
  height: 24px;
  background: #fbbf24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 2px solid #1e3a8a;
}

.avatar-edit i {
  font-size: 0.75rem;
  color: #1e3a8a;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 0.25rem 0;
}

.user-email {
  font-size: 0.875rem;
  color: rgba(30, 58, 138, 0.7);
  margin: 0 0 0.5rem 0;
}

.user-meta {
  font-size: 0.75rem;
  color: rgba(30, 58, 138, 0.6);
}

.join-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.user-stats {
  display: flex;
  justify-content: space-around;
  padding-top: 1rem;
  border-top: 1px solid rgba(30, 58, 138, 0.2);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1e3a8a;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(30, 58, 138, 0.7);
}

.menu-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.menu-item {
  cursor: pointer;
}

.menu-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-icon i {
  font-size: 1rem;
  color: #1e3a8a;
}

.menu-info {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.menu-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.menu-arrow {
  color: rgba(255, 255, 255, 0.5);
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-row {
  display: flex;
  gap: 1rem;
}

.action-row > * {
  flex: 1;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
}

.setting-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .user-center-container {
    padding: 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .user-profile {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-details {
    text-align: center;
  }

  .action-row {
    flex-direction: column;
  }

  .setting-item {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
}
</style>
