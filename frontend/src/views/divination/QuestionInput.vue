<template>
  <StarryBackground :animated="true" :show-decorations="true">
    <div class="question-input-container">
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

      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">请输入您的问题</h1>
        <p class="page-subtitle">诚心发问，智慧自现</p>
      </div>

      <!-- 问题输入表单 -->
      <MysticalCard variant="default" size="large" class="question-form-card">
        <el-form
          ref="questionFormRef"
          :model="questionForm"
          :rules="questionRules"
          @submit.prevent="handleSubmit"
          class="question-form"
        >
          <!-- 问题类别选择 -->
          <el-form-item label="问题类别" prop="category">
            <el-select
              v-model="questionForm.category"
              placeholder="请选择问题类别"
              size="large"
              style="width: 100%"
            >
              <el-option
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              >
                <div class="category-option">
                  <i :class="category.icon"></i>
                  <span>{{ category.label }}</span>
                </div>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 问题输入 -->
          <el-form-item label="您的问题" prop="question">
            <el-input
              v-model="questionForm.question"
              type="textarea"
              :rows="6"
              placeholder="请详细描述您想要占卜的问题..."
              size="large"
              :maxlength="200"
              show-word-limit
              clearable
            />
          </el-form-item>

          <!-- 问题示例 -->
          <div class="question-examples">
            <h4 class="examples-title">问题示例：</h4>
            <div class="examples-list">
              <div 
                v-for="example in examples" 
                :key="example.id"
                class="example-item"
                @click="useExample(example.text)"
              >
                <i :class="example.icon"></i>
                <span>{{ example.text }}</span>
              </div>
            </div>
          </div>

          <!-- 占卜须知 -->
          <div class="divination-notice">
            <h4 class="notice-title">
              <i class="fas fa-info-circle"></i>
              占卜须知
            </h4>
            <ul class="notice-list">
              <li>请以诚心发问，问题越具体，解读越准确</li>
              <li>避免询问他人隐私或不当内容</li>
              <li>同一问题建议间隔24小时后再次占卜</li>
              <li>占卜结果仅供参考，请理性对待</li>
            </ul>
          </div>

          <!-- 提交按钮 -->
          <el-form-item>
            <MysticalButton
              variant="primary"
              size="large"
              :full-width="true"
              :loading="loading"
              :disabled="!canSubmit"
              left-icon="fas fa-yin-yang"
              @click="handleSubmit"
            >
              {{ buttonText }}
            </MysticalButton>
          </el-form-item>

          <!-- 免费次数提示 -->
          <div class="free-count-tip" v-if="userStore.freeCount > 0">
            <i class="fas fa-gift"></i>
            <span>您还有 {{ userStore.freeCount }} 次免费占卜机会</span>
          </div>
        </el-form>
      </MysticalCard>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useDivinationStore } from '@/stores/divination'
import { useAppStore } from '@/stores/app'
import { divinationAPI } from '@/api/divination'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const divinationStore = useDivinationStore()
const appStore = useAppStore()

// 响应式数据
const questionFormRef = ref()
const loading = ref(false)

// 问题表单
const questionForm = reactive({
  category: 'other', // 设置默认分类为"其他问题"
  question: ''
})

// 问题类别
const categories = ref([
  { value: 'career', label: '事业发展', icon: 'fas fa-briefcase' },
  { value: 'love', label: '感情婚姻', icon: 'fas fa-heart' },
  { value: 'health', label: '健康状况', icon: 'fas fa-heartbeat' },
  { value: 'wealth', label: '财运投资', icon: 'fas fa-coins' },
  { value: 'study', label: '学业考试', icon: 'fas fa-graduation-cap' },
  { value: 'family', label: '家庭关系', icon: 'fas fa-home' },
  { value: 'decision', label: '决策选择', icon: 'fas fa-balance-scale' },
  { value: 'other', label: '其他问题', icon: 'fas fa-question-circle' }
])

// 问题示例
const examples = ref([
  { id: 1, text: '我最近的工作发展如何？', icon: 'fas fa-briefcase' },
  { id: 2, text: '这段感情的未来走向？', icon: 'fas fa-heart' },
  { id: 3, text: '我的健康状况需要注意什么？', icon: 'fas fa-heartbeat' },
  { id: 4, text: '近期的投资理财运势？', icon: 'fas fa-coins' },
  { id: 5, text: '即将到来的考试结果如何？', icon: 'fas fa-graduation-cap' }
])

// 表单验证规则
const questionRules = {
  category: [
    { required: true, message: '请选择问题类别', trigger: 'change' }
  ],
  question: [
    { required: true, message: '请输入您的问题', trigger: 'blur' },
    { min: 5, message: '问题长度至少5个字符', trigger: 'blur' },
    { max: 200, message: '问题长度不能超过200个字符', trigger: 'blur' }
  ]
}

// 计算属性
const canSubmit = computed(() => {
  return questionForm.category &&
         questionForm.question &&
         questionForm.question.length >= 5 &&
         userStore.freeCount > 0
})

const buttonText = computed(() => {
  if (loading.value) return '验证中...'
  if (!questionForm.question) return '请输入您的问题'
  if (questionForm.question.length < 5) return `请输入至少5个字符 (当前${questionForm.question.length}字符)`
  if (!questionForm.category) return '请选择问题分类'
  if (userStore.freeCount <= 0) return '免费次数已用完'
  return '开始占卜'
})

// 方法
const goBack = () => {
  router.go(-1)
}

const useExample = (exampleText) => {
  questionForm.question = exampleText
}

const handleSubmit = async () => {
  try {
    // 表单验证
    const valid = await questionFormRef.value.validate()
    if (!valid) return

    // 检查免费次数
    if (userStore.freeCount <= 0) {
      ElMessage.warning('今日免费次数已用完')
      return
    }

    loading.value = true

    // 验证问题内容
    const validationResult = await divinationAPI.validateQuestion(questionForm.question)
    
    if (!validationResult.data.isValid) {
      const suggestions = validationResult.data.suggestions || []
      const warnings = validationResult.data.warnings || []
      
      if (warnings.length > 0) {
        ElMessage.error(warnings[0])
        return
      }
      
      if (suggestions.length > 0) {
        ElMessage.warning(suggestions[0])
        return
      }
    }

    // 设置当前问题
    divinationStore.setCurrentQuestion(questionForm.question)

    // 使用免费次数
    userStore.useFreeCount()

    // 跳转到占卜加载页面
    router.push('/divination/loading')

  } catch (error) {
    ElMessage.error(error.message || '提交失败，请重试')
  } finally {
    loading.value = false
  }
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('question-input')

  // 调试信息
  console.log('🔮 占卜页面初始化:', {
    isLoggedIn: userStore.isLoggedIn,
    freeCount: userStore.freeCount,
    userInfo: userStore.userInfo,
    token: userStore.token ? '已设置' : '未设置'
  })

  // 检查登录状态
  if (!userStore.isLoggedIn) {
    console.warn('❌ 用户未登录，跳转到登录页面')
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  // 检查免费次数
  if (userStore.freeCount <= 0) {
    console.warn('❌ 免费次数不足:', userStore.freeCount)
    ElMessage.warning('今日免费次数已用完')
    router.push('/')
    return
  }

  console.log('✅ 占卜页面初始化完成')
})
</script>

<style scoped>
.question-input-container {
  min-height: 100vh;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.back-button {
  position: absolute;
  top: 2rem;
  left: 1rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  margin-top: 3rem;
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

.question-form-card {
  width: 100%;
  max-width: 600px;
}

.question-form {
  width: 100%;
}

.category-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-option i {
  color: #fbbf24;
  width: 16px;
}

.question-examples {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.examples-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 0.75rem;
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.example-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
}

.example-item:hover {
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  transform: translateX(4px);
}

.example-item i {
  color: #fbbf24;
  width: 16px;
  font-size: 0.75rem;
}

.divination-notice {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.notice-title {
  font-size: 1rem;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notice-list li {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
  padding-left: 1rem;
  position: relative;
}

.notice-list li::before {
  content: '•';
  color: #6366f1;
  position: absolute;
  left: 0;
}

.free-count-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.free-count-tip i {
  color: #22c55e;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .question-input-container {
    padding: 1rem 0.5rem;
  }

  .back-button {
    top: 1rem;
    left: 0.5rem;
  }

  .page-header {
    margin-top: 2rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .examples-list {
    gap: 0.375rem;
  }

  .example-item {
    font-size: 0.8rem;
    padding: 0.375rem;
  }

  .notice-list li {
    font-size: 0.8rem;
  }
}
</style>
