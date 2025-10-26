<template>
  <StarryBackground :animated="true" :show-decorations="false">
    <div class="history-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-content">
          <MysticalButton
            variant="ghost"
            size="small"
            left-icon="fas fa-arrow-left"
            @click="goBack"
            class="back-button"
          >
            返回
          </MysticalButton>
          
          <h1 class="page-title">占卜历史</h1>
          
          <MysticalButton
            variant="ghost"
            size="small"
            left-icon="fas fa-search"
            @click="showSearchDialog = true"
            class="search-button"
          >
            搜索
          </MysticalButton>
        </div>
        
        <!-- 统计信息 -->
        <div class="stats-section" v-if="stats">
          <div class="stat-item">
            <span class="stat-number">{{ stats.totalDivinations }}</span>
            <span class="stat-label">总占卜次数</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.thisMonthCount }}</span>
            <span class="stat-label">本月占卜</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.favoriteCount }}</span>
            <span class="stat-label">收藏数量</span>
          </div>
        </div>
      </div>

      <!-- 筛选器 -->
      <div class="filter-section">
        <div class="filter-tabs">
          <div 
            v-for="filter in filters" 
            :key="filter.value"
            class="filter-tab"
            :class="{ active: currentFilter === filter.value }"
            @click="changeFilter(filter.value)"
          >
            <i :class="filter.icon"></i>
            <span>{{ filter.label }}</span>
          </div>
        </div>
      </div>

      <!-- 历史记录列表 -->
      <div class="history-list">
        <!-- 加载状态 -->
        <Loading
          v-if="loading && historyList.length === 0"
          type="stars"
          text="正在加载历史记录..."
        />

        <!-- 记录项 -->
        <div v-else-if="historyList.length > 0" class="records-container">
          <MysticalCard
            v-for="record in historyList"
            :key="record.id"
            variant="default"
            size="medium"
            :hoverable="true"
            :clickable="true"
            @click="viewRecord(record)"
            class="history-record"
          >
            <div class="record-content">
              <!-- 记录头部 -->
              <div class="record-header">
                <div class="record-info">
                  <h3 class="record-question">{{ record.question }}</h3>
                  <div class="record-meta">
                    <span class="record-category">
                      <i :class="getCategoryIcon(record.category)"></i>
                      {{ getCategoryName(record.category) }}
                    </span>
                    <span class="record-time">{{ formatRelativeTime(record.timestamp) }}</span>
                  </div>
                </div>
                
                <!-- 操作按钮 -->
                <div class="record-actions">
                  <MysticalButton
                    variant="ghost"
                    size="small"
                    :left-icon="record.isFavorite ? 'fas fa-heart' : 'far fa-heart'"
                    @click.stop="toggleFavorite(record)"
                    class="action-button"
                  />
                  <MysticalButton
                    variant="ghost"
                    size="small"
                    left-icon="fas fa-trash"
                    @click.stop="deleteRecord(record)"
                    class="action-button delete-button"
                  />
                </div>
              </div>
              
              <!-- 卦象信息 -->
              <div class="record-hexagram">
                <div class="hexagram-info">
                  <span class="hexagram-name">{{ record.hexagram.name }}</span>
                  <span class="hexagram-number">第{{ record.hexagram.number }}卦</span>
                </div>
                <div class="hexagram-preview">
                  <div 
                    v-for="i in 6" 
                    :key="i"
                    class="mini-line"
                    :class="{ broken: Math.random() > 0.5 }"
                  ></div>
                </div>
              </div>
              
              <!-- 简要解读 -->
              <div class="record-interpretation">
                <p class="interpretation-preview">{{ record.interpretation.overall }}</p>
              </div>
            </div>
          </MysticalCard>

          <!-- 加载更多 -->
          <div class="load-more-section" v-if="canLoadMore">
            <MysticalButton
              variant="outline"
              size="medium"
              :loading="loadingMore"
              left-icon="fas fa-plus"
              @click="loadMore"
            >
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </MysticalButton>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="empty-state">
          <MysticalCard variant="default" size="large">
            <div class="empty-content">
              <i class="fas fa-history empty-icon"></i>
              <h3 class="empty-title">暂无历史记录</h3>
              <p class="empty-message">您还没有进行过占卜，快去体验一下吧！</p>
              <MysticalButton
                variant="primary"
                size="medium"
                left-icon="fas fa-yin-yang"
                @click="startDivination"
              >
                开始占卜
              </MysticalButton>
            </div>
          </MysticalCard>
        </div>
      </div>

      <!-- 搜索对话框 -->
      <el-dialog
        v-model="showSearchDialog"
        title="搜索历史记录"
        width="90%"
        :max-width="400"
        center
      >
        <el-form @submit.prevent="performSearch">
          <el-form-item label="关键词">
            <el-input
              v-model="searchKeyword"
              placeholder="输入问题关键词..."
              clearable
              @keyup.enter="performSearch"
            />
          </el-form-item>
          <el-form-item label="类别">
            <el-select v-model="searchCategory" placeholder="选择类别" clearable>
              <el-option
                v-for="category in categories"
                :key="category.value"
                :label="category.label"
                :value="category.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <MysticalButton
              variant="secondary"
              @click="clearSearch"
            >
              清除
            </MysticalButton>
            <MysticalButton
              variant="primary"
              @click="performSearch"
            >
              搜索
            </MysticalButton>
          </div>
        </template>
      </el-dialog>
    </div>
  </StarryBackground>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useDivinationStore } from '@/stores/divination'
import { useAppStore } from '@/stores/app'
import StarryBackground from '@/components/common/StarryBackground.vue'
import MysticalCard from '@/components/common/MysticalCard.vue'
import MysticalButton from '@/components/common/MysticalButton.vue'
import Loading from '@/components/common/Loading.vue'
import { formatRelativeTime } from '@/utils'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const divinationStore = useDivinationStore()
const appStore = useAppStore()

// 响应式数据
const loading = ref(true)
const loadingMore = ref(false)
const historyList = ref([])
const stats = ref(null)
const currentFilter = ref('all')
const currentPage = ref(1)
const showSearchDialog = ref(false)
const searchKeyword = ref('')
const searchCategory = ref('')

// 筛选器选项
const filters = ref([
  { value: 'all', label: '全部', icon: 'fas fa-list' },
  { value: 'favorite', label: '收藏', icon: 'fas fa-heart' },
  { value: 'recent', label: '最近', icon: 'fas fa-clock' }
])

// 类别选项
const categories = ref([
  { value: 'career', label: '事业发展' },
  { value: 'love', label: '感情婚姻' },
  { value: 'health', label: '健康状况' },
  { value: 'wealth', label: '财运投资' },
  { value: 'study', label: '学业考试' },
  { value: 'family', label: '家庭关系' },
  { value: 'decision', label: '决策选择' },
  { value: 'other', label: '其他问题' }
])

// 计算属性
const canLoadMore = computed(() => {
  return divinationStore.canLoadMoreHistory && !loading.value
})

// 方法
const goBack = () => {
  router.go(-1)
}

const getCategoryIcon = (category) => {
  const iconMap = {
    career: 'fas fa-briefcase',
    love: 'fas fa-heart',
    health: 'fas fa-heartbeat',
    wealth: 'fas fa-coins',
    study: 'fas fa-graduation-cap',
    family: 'fas fa-home',
    decision: 'fas fa-balance-scale',
    other: 'fas fa-question-circle'
  }
  return iconMap[category] || 'fas fa-question-circle'
}

const getCategoryName = (category) => {
  const categoryItem = categories.value.find(c => c.value === category)
  return categoryItem ? categoryItem.label : '其他'
}

const loadHistory = async (page = 1, reset = false) => {
  try {
    if (reset) {
      loading.value = true
      currentPage.value = 1
    } else {
      loadingMore.value = true
    }

    const params = {
      page,
      pageSize: 10,
      category: searchCategory.value,
      keyword: searchKeyword.value
    }

    const response = await divinationStore.getHistory(params.page, params.pageSize)
    
    if (response.success) {
      if (reset) {
        historyList.value = response.data.items
      } else {
        historyList.value.push(...response.data.items)
      }
      currentPage.value = page
    }
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadStats = async () => {
  try {
    // TODO: 替换为实际API调用
    // const response = await divinationAPI.getStatistics()
    
    // 模拟统计数据
    stats.value = {
      totalDivinations: 42,
      thisMonthCount: 8,
      favoriteCount: 5
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

const changeFilter = (filterValue) => {
  currentFilter.value = filterValue
  // TODO: 根据筛选器重新加载数据
  loadHistory(1, true)
}

const loadMore = () => {
  loadHistory(currentPage.value + 1, false)
}

const viewRecord = (record) => {
  router.push(`/divination/result/${record.id}`)
}

const toggleFavorite = async (record) => {
  try {
    await divinationStore.toggleFavorite(record.id)
    record.isFavorite = !record.isFavorite
    
    ElMessage.success(record.isFavorite ? '已添加到收藏' : '已取消收藏')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteRecord = async (record) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这条占卜记录吗？删除后无法恢复。',
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await divinationStore.deleteHistoryItem(record.id)
    
    // 从列表中移除
    const index = historyList.value.findIndex(item => item.id === record.id)
    if (index > -1) {
      historyList.value.splice(index, 1)
    }
    
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const performSearch = () => {
  showSearchDialog.value = false
  loadHistory(1, true)
}

const clearSearch = () => {
  searchKeyword.value = ''
  searchCategory.value = ''
  showSearchDialog.value = false
  loadHistory(1, true)
}

const startDivination = () => {
  router.push('/divination/question')
}

// 组件挂载时初始化
onMounted(() => {
  appStore.setCurrentRoute('history')
  
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 加载数据
  loadHistory(1, true)
  loadStats()
})
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.stats-section {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  color: #fbbf24;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.filter-section {
  margin-bottom: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.filter-tab.active {
  background: rgba(251, 191, 36, 0.2);
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
}

.filter-tab i {
  font-size: 0.875rem;
}

.history-list {
  min-height: 400px;
}

.records-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-record {
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-record:hover {
  transform: translateY(-2px);
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.record-info {
  flex: 1;
  min-width: 0;
}

.record-question {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.record-category {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.record-category i {
  color: #fbbf24;
}

.record-actions {
  display: flex;
  gap: 0.25rem;
}

.action-button {
  padding: 0.25rem;
  min-width: auto;
  width: 32px;
  height: 32px;
}

.delete-button:hover {
  color: #ef4444;
}

.record-hexagram {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.hexagram-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hexagram-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #fbbf24;
}

.hexagram-number {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
}

.hexagram-preview {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.mini-line {
  width: 20px;
  height: 2px;
  background: #fbbf24;
  border-radius: 1px;
}

.mini-line.broken {
  background: linear-gradient(to right, 
    #fbbf24 0%, #fbbf24 45%, 
    transparent 45%, transparent 55%, 
    #fbbf24 55%, #fbbf24 100%);
}

.record-interpretation {
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.interpretation-preview {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.load-more-section {
  text-align: center;
  margin-top: 2rem;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.empty-message {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .history-container {
    padding: 0.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .stats-section {
    padding: 0.75rem;
  }

  .stat-number {
    font-size: 1.25rem;
  }

  .record-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .record-actions {
    align-self: flex-end;
  }

  .record-meta {
    flex-direction: column;
    gap: 0.25rem;
  }

  .hexagram-preview {
    transform: scale(0.8);
  }
}
</style>
