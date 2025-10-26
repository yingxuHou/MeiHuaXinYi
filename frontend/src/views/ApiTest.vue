<template>
  <div class="api-test-page">
    <div class="container">
      <h1 class="title">🧪 API集成测试</h1>
      <p class="subtitle">测试前后端API连接状态</p>

      <!-- 测试控制面板 -->
      <div class="test-panel">
        <el-button 
          type="primary" 
          @click="runAllTests"
          :loading="testing"
          size="large"
        >
          {{ testing ? '测试中...' : '🚀 运行所有测试' }}
        </el-button>
        
        <el-button 
          @click="clearResults"
          :disabled="testing"
        >
          🗑️ 清空结果
        </el-button>
      </div>

      <!-- 测试结果 -->
      <div class="test-results" v-if="testResults">
        <div class="result-summary">
          <h3>📊 测试总结</h3>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="label">总测试数:</span>
              <span class="value">{{ totalTests }}</span>
            </div>
            <div class="stat-item">
              <span class="label">通过:</span>
              <span class="value success">{{ passedTests }}</span>
            </div>
            <div class="stat-item">
              <span class="label">失败:</span>
              <span class="value error">{{ failedTests }}</span>
            </div>
            <div class="stat-item">
              <span class="label">成功率:</span>
              <span class="value" :class="successRate >= 80 ? 'success' : 'warning'">
                {{ successRate }}%
              </span>
            </div>
          </div>
        </div>

        <!-- 详细测试结果 -->
        <div class="detailed-results">
          <h3>📋 详细结果</h3>
          
          <!-- 连接测试 -->
          <div class="test-item">
            <div class="test-header">
              <span class="test-name">🔗 API连接测试</span>
              <span class="test-status" :class="getStatusClass('connection')">
                {{ getStatusText('connection') }}
              </span>
            </div>
            <div v-if="testResults.connection" class="test-content">
              <pre>{{ JSON.stringify(testResults.connection, null, 2) }}</pre>
            </div>
          </div>

          <!-- 时间起卦测试 -->
          <div class="test-item">
            <div class="test-header">
              <span class="test-name">⏰ 时间起卦测试</span>
              <span class="test-status" :class="getStatusClass('timeDivination')">
                {{ getStatusText('timeDivination') }}
              </span>
            </div>
            <div v-if="testResults.timeDivination" class="test-content">
              <pre>{{ JSON.stringify(testResults.timeDivination, null, 2) }}</pre>
            </div>
          </div>

          <!-- 数字起卦测试 -->
          <div class="test-item">
            <div class="test-header">
              <span class="test-name">🔢 数字起卦测试</span>
              <span class="test-status" :class="getStatusClass('numberDivination')">
                {{ getStatusText('numberDivination') }}
              </span>
            </div>
            <div v-if="testResults.numberDivination" class="test-content">
              <pre>{{ JSON.stringify(testResults.numberDivination, null, 2) }}</pre>
            </div>
          </div>

          <!-- 手动起卦测试 -->
          <div class="test-item">
            <div class="test-header">
              <span class="test-name">✋ 手动起卦测试</span>
              <span class="test-status" :class="getStatusClass('manualDivination')">
                {{ getStatusText('manualDivination') }}
              </span>
            </div>
            <div v-if="testResults.manualDivination" class="test-content">
              <pre>{{ JSON.stringify(testResults.manualDivination, null, 2) }}</pre>
            </div>
          </div>

          <!-- 历史查询测试 -->
          <div class="test-item">
            <div class="test-header">
              <span class="test-name">📚 历史查询测试</span>
              <span class="test-status" :class="getStatusClass('history')">
                {{ getStatusText('history') }}
              </span>
            </div>
            <div v-if="testResults.history" class="test-content">
              <pre>{{ JSON.stringify(testResults.history, null, 2) }}</pre>
            </div>
          </div>

          <!-- 统计查询测试 -->
          <div class="test-item">
            <div class="test-header">
              <span class="test-name">📊 统计查询测试</span>
              <span class="test-status" :class="getStatusClass('stats')">
                {{ getStatusText('stats') }}
              </span>
            </div>
            <div v-if="testResults.stats" class="test-content">
              <pre>{{ JSON.stringify(testResults.stats, null, 2) }}</pre>
            </div>
          </div>
        </div>

        <!-- 错误信息 -->
        <div v-if="testResults.errors && testResults.errors.length > 0" class="error-section">
          <h3>❌ 错误信息</h3>
          <div v-for="error in testResults.errors" :key="error.test" class="error-item">
            <strong>{{ error.test }}:</strong> {{ error.error }}
          </div>
        </div>
      </div>

      <!-- 快速操作 -->
      <div class="quick-actions">
        <h3>🎯 快速测试</h3>
        <div class="action-buttons">
          <el-button @click="testConnection" :loading="testing">连接测试</el-button>
          <el-button @click="testTimeDivination" :loading="testing">时间起卦</el-button>
          <el-button @click="testNumberDivination" :loading="testing">数字起卦</el-button>
          <el-button @click="testManualDivination" :loading="testing">手动起卦</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { runAPITests, testConnection as apiTestConnection, performTimeDivination, performNumberDivination, performManualDivination } from '@/api/divination-simple'

const testing = ref(false)
const testResults = ref(null)

// 计算属性
const totalTests = computed(() => 6)
const passedTests = computed(() => {
  if (!testResults.value) return 0
  return totalTests.value - (testResults.value.errors?.length || 0)
})
const failedTests = computed(() => {
  if (!testResults.value) return 0
  return testResults.value.errors?.length || 0
})
const successRate = computed(() => {
  if (!testResults.value) return 0
  return Math.round((passedTests.value / totalTests.value) * 100)
})

// 运行所有测试
const runAllTests = async () => {
  testing.value = true
  try {
    ElMessage.info('开始运行API测试套件...')
    const results = await runAPITests()
    testResults.value = results
    
    if (results.errors.length === 0) {
      ElMessage.success('所有API测试通过！')
    } else {
      ElMessage.warning(`${passedTests.value}/${totalTests.value} 个测试通过`)
    }
  } catch (error) {
    ElMessage.error(`测试失败: ${error.message}`)
    console.error('API测试失败:', error)
  } finally {
    testing.value = false
  }
}

// 清空结果
const clearResults = () => {
  testResults.value = null
  ElMessage.info('测试结果已清空')
}

// 单独测试方法
const testConnection = async () => {
  testing.value = true
  try {
    const result = await apiTestConnection()
    ElMessage.success('API连接测试通过')
    console.log('连接测试结果:', result)
  } catch (error) {
    ElMessage.error(`连接测试失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

const testTimeDivination = async () => {
  testing.value = true
  try {
    const result = await performTimeDivination('前端测试 - 时间起卦')
    ElMessage.success('时间起卦测试通过')
    console.log('时间起卦结果:', result)
  } catch (error) {
    ElMessage.error(`时间起卦测试失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

const testNumberDivination = async () => {
  testing.value = true
  try {
    const result = await performNumberDivination('前端测试 - 数字起卦', [777, 888])
    ElMessage.success('数字起卦测试通过')
    console.log('数字起卦结果:', result)
  } catch (error) {
    ElMessage.error(`数字起卦测试失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

const testManualDivination = async () => {
  testing.value = true
  try {
    const result = await performManualDivination('前端测试 - 手动起卦', 2, 5, 6)
    ElMessage.success('手动起卦测试通过')
    console.log('手动起卦结果:', result)
  } catch (error) {
    ElMessage.error(`手动起卦测试失败: ${error.message}`)
  } finally {
    testing.value = false
  }
}

// 辅助方法
const getStatusClass = (testName) => {
  if (!testResults.value) return ''
  const hasError = testResults.value.errors?.some(error => error.test === testName)
  return hasError ? 'error' : 'success'
}

const getStatusText = (testName) => {
  if (!testResults.value) return '未测试'
  const hasError = testResults.value.errors?.some(error => error.test === testName)
  return hasError ? '❌ 失败' : '✅ 通过'
}
</script>

<style scoped>
.api-test-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.test-panel {
  text-align: center;
  margin-bottom: 30px;
}

.test-panel .el-button {
  margin: 0 10px;
}

.test-results {
  margin-top: 30px;
}

.result-summary {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-item .label {
  display: block;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-item .value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.value.success {
  color: #67c23a;
}

.value.error {
  color: #f56c6c;
}

.value.warning {
  color: #e6a23c;
}

.detailed-results h3 {
  margin-bottom: 20px;
  color: #333;
}

.test-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.test-name {
  font-weight: bold;
  color: #333;
}

.test-status.success {
  color: #67c23a;
  font-weight: bold;
}

.test-status.error {
  color: #f56c6c;
  font-weight: bold;
}

.test-content {
  padding: 15px 20px;
  background: #fff;
}

.test-content pre {
  background: #f5f5f5;
  padding: 15px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 0.9rem;
  line-height: 1.4;
}

.error-section {
  margin-top: 20px;
  padding: 20px;
  background: #fef0f0;
  border-radius: 10px;
  border-left: 4px solid #f56c6c;
}

.error-item {
  margin-bottom: 10px;
  color: #f56c6c;
}

.quick-actions {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 15px;
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 10px;
  }
  
  .test-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
