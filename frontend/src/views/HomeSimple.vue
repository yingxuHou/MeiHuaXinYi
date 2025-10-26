<template>
  <div class="simple-home">
    <div class="container">
      <h1>梅花心易</h1>
      <p>古老的占卜智慧，现代的技术呈现</p>
      
      <div class="actions">
        <button @click="handleStartDivination" class="btn-primary">
          开始占卜
        </button>
        
        <button @click="handleGoToLogin" class="btn-secondary">
          登录
        </button>
        
        <button @click="handleGoToRegister" class="btn-secondary">
          注册
        </button>
        
        <button @click="handleTestClick" class="btn-test">
          测试点击
        </button>
      </div>
      
      <div class="debug-info">
        <h3>调试信息</h3>
        <p>点击次数: {{ clickCount }}</p>
        <p>最后点击: {{ lastClick }}</p>
        <p>用户状态: {{ userStatus }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const clickCount = ref(0)
const lastClick = ref('无')
const userStatus = ref('未登录')

const handleStartDivination = () => {
  clickCount.value++
  lastClick.value = '开始占卜'
  console.log('开始占卜按钮被点击')
  alert('开始占卜功能')
  // router.push('/divination/question')
}

const handleGoToLogin = () => {
  clickCount.value++
  lastClick.value = '登录'
  console.log('登录按钮被点击')
  alert('登录功能')
  // router.push('/login')
}

const handleGoToRegister = () => {
  clickCount.value++
  lastClick.value = '注册'
  console.log('注册按钮被点击')
  alert('注册功能')
  // router.push('/register')
}

const handleTestClick = () => {
  clickCount.value++
  lastClick.value = '测试'
  console.log('测试按钮被点击，点击次数:', clickCount.value)
  alert(`测试成功！这是第 ${clickCount.value} 次点击`)
}
</script>

<style scoped>
.simple-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
}

p {
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.btn-primary, .btn-secondary, .btn-test {
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f8f9fa;
  color: #333;
  border: 2px solid #dee2e6;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.btn-test {
  background: #28a745;
  color: white;
}

.btn-test:hover {
  background: #218838;
  transform: translateY(-2px);
}

.debug-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  text-align: left;
}

.debug-info h3 {
  margin-top: 0;
  color: #333;
}

.debug-info p {
  margin: 5px 0;
  color: #666;
  font-family: monospace;
}
</style>
