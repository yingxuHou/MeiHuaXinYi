<template>
  <StarryBackground 
    :animated="true" 
    :show-decorations="true" 
    :show-star-trails="true"
    :show-glow-aura="true"
    class="oriental-starry-background-enhanced"
  >
    <div class="test-container">
      <h1 class="test-title">东方美学组件测试</h1>
      
      <!-- 头像组件测试 -->
      <div class="test-section">
        <h2>OrientalAvatar 组件</h2>
        <div class="avatar-test-grid">
          <OrientalAvatar
            :show-compass="true"
            :show-user-info="true"
            user-name="易学爱好者"
            user-status="今日运势：大吉"
            size="small"
          />
          <OrientalAvatar
            :show-compass="true"
            :show-user-info="true"
            user-name="易学爱好者"
            user-status="今日运势：大吉"
            size="medium"
          />
          <OrientalAvatar
            :show-compass="true"
            :show-user-info="true"
            user-name="易学爱好者"
            user-status="今日运势：大吉"
            size="large"
          />
        </div>
      </div>

      <!-- 进度条组件测试 -->
      <div class="test-section">
        <h2>OrientalProgress 组件</h2>
        <div class="progress-test-grid">
          <OrientalProgress
            :current-value="7"
            :max-value="10"
            label="免费占卜次数"
            :show-moon-icon="true"
            variant="amber"
            size="medium"
          />
          <OrientalProgress
            :current-value="3"
            :max-value="5"
            label="今日运势"
            :show-moon-icon="true"
            variant="gold"
            size="large"
          />
          <OrientalProgress
            :current-value="8"
            :max-value="10"
            label="修行进度"
            :show-moon-icon="true"
            variant="purple"
            size="small"
          />
        </div>
      </div>

      <!-- 推荐卡片组件测试 -->
      <div class="test-section">
        <h2>推荐卡片样式</h2>
        <div class="card-test-grid">
          <div class="oriental-glass-card">
            <h3>感情运势占卜</h3>
            <p>了解近期感情发展趋势</p>
            <span class="badge">热门</span>
          </div>
          <div class="oriental-glass-card">
            <h3>事业发展指引</h3>
            <p>职场决策的智慧建议</p>
            <span class="badge">推荐</span>
          </div>
          <div class="oriental-glass-card">
            <h3>财运分析</h3>
            <p>财富机遇与风险预测</p>
            <span class="badge">精选</span>
          </div>
        </div>
      </div>

      <!-- 按钮测试 -->
      <div class="test-section">
        <h2>东方美学按钮</h2>
        <div class="button-test-grid">
          <button class="btn-oriental-primary">
            <i class="fas fa-star"></i>
            <span>开始占卜</span>
            <i class="fas fa-chevron-right"></i>
          </button>
          <button class="btn-oriental-secondary">
            <i class="fas fa-history"></i>
            <span>历史记录</span>
          </button>
        </div>
      </div>

      <!-- 卡片测试 -->
      <div class="test-section">
        <h2>东方美学卡片</h2>
        <div class="card-style-test">
          <div class="oriental-glass-card">
            <h3>玻璃拟态卡片</h3>
            <p>轻拟物化设计，柔和光影晕染</p>
          </div>
          <div class="oriental-purple-card">
            <h3>紫色渐变卡片</h3>
            <p>深蓝色星空紫主色调，鎏金细节点缀</p>
          </div>
        </div>
      </div>
    </div>
  </StarryBackground>
</template>

<script setup>
import StarryBackground from '@/components/common/StarryBackground.vue'
import OrientalAvatar from '@/components/common/OrientalAvatar.vue'
import OrientalProgress from '@/components/common/OrientalProgress.vue'
// import OrientalRecommendCard from '@/components/common/OrientalRecommendCard.vue'
</script>

<style scoped>
.test-container {
  min-height: 100vh;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-title {
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--gold-primary), var(--warm-yellow));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.test-section {
  margin-bottom: 3rem;
  background: var(--glass-light);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-medium);
  border-radius: 16px;
  padding: 2rem;
}

.test-section h2 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
  background: linear-gradient(135deg, var(--gold-primary), var(--warm-yellow));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.avatar-test-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.progress-test-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 600px;
  margin: 0 auto;
}

.card-test-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.button-test-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.card-style-test {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.card-style-test > div {
  padding: 1.5rem;
  border-radius: 16px;
  text-align: center;
}

.card-style-test h3 {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.card-style-test p {
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    padding: 16px;
  }
  
  .test-section {
    padding: 1.5rem;
  }
  
  .avatar-test-grid {
    gap: 1rem;
  }
  
  .button-test-grid {
    gap: 1rem;
  }
  
  .card-style-test {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .test-title {
    font-size: 1.5rem;
  }
  
  .test-section h2 {
    font-size: 1.25rem;
  }
  
  .avatar-test-grid {
    flex-direction: column;
  }
}
</style>
