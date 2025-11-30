<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface Record {
  date: string
  minutes: number
}

const records = ref<Record[]>([])

// 交互状态
const hoveredRecord = ref<number | null>(null)

onMounted(() => {
  const raw = localStorage.getItem('deepfocus-records')
  if (raw) {
    try {
      records.value = JSON.parse(raw)
    } catch (e) {
      console.error('Failed to parse records:', e)
      records.value = []
    }
  }
})

// 计算总专注时间
const totalMinutes = computed(() => {
  return records.value.reduce((sum, record) => sum + record.minutes, 0)
})

// 计算平均每天专注时间
const averageMinutes = computed(() => {
  if (records.value.length === 0) return 0
  return Math.round(totalMinutes.value / records.value.length)
})

// 格式化日期显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 计算每周专注趋势（最近7天）
const weeklyTrend = computed(() => {
  const today = new Date()
  const weekRecords = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const record = records.value.find(r => r.date === dateStr)
    weekRecords.push({
      date: dateStr,
      day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
      minutes: record ? record.minutes : 0
    })
  }
  
  return weekRecords
})
</script>

<template>
  <div class="page records-page">
    <!-- 背景装饰元素 -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>
    
    <div class="records-container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2 class="animate-in">专注记录</h2>
        <p class="subtitle animate-in-delay">追踪你的专注时光</p>
      </div>
      
      <!-- 统计卡片 -->
      <div class="stats-cards animate-in-delay">
        <div class="stat-card">
          <div class="stat-value">{{ totalMinutes }}</div>
          <div class="stat-label">总专注分钟</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ records.length }}</div>
          <div class="stat-label">记录天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ averageMinutes }}</div>
          <div class="stat-label">日均分钟</div>
        </div>
      </div>
      
      <!-- 周趋势图 -->
      <div class="trend-section animate-in-delay">
        <h3>本周趋势</h3>
        <div class="trend-chart">
          <div 
            v-for="item in weeklyTrend" 
            :key="item.date"
            class="trend-bar"
          >
            <div 
              class="bar" 
              :style="{ height: `${Math.max(10, item.minutes * 0.5)}px` }"
            ></div>
            <div class="bar-label">{{ item.day }}</div>
          </div>
        </div>
      </div>
      
      <!-- 记录列表 -->
      <div class="records-list animate-in-delay">
        <div v-if="records.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>暂无记录</p>
          <p class="empty-hint">完成你的第一个番茄钟后，这里将显示你的专注记录</p>
        </div>
        
        <ul v-else class="records">
          <li 
            v-for="(r, index) in records.slice().reverse()" 
            :key="r.date"
            class="record-item"
            :class="{ 'hovered': hoveredRecord === index }"
            @mouseenter="hoveredRecord = index"
            @mouseleave="hoveredRecord = null"
          >
            <div class="record-date">{{ formatDate(r.date) }}</div>
            <div class="record-minutes">{{ r.minutes }} 分钟</div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped>
.records-page {
  position: relative;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  overflow: hidden;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(40px);
  z-index: 0;
}

.bg-decoration-1 {
  top: 10%;
  right: 15%;
  width: 300px;
  height: 300px;
  opacity: 0.5;
  animation: float 15s ease-in-out infinite;
}

.bg-decoration-2 {
  bottom: 20%;
  left: 10%;
  width: 250px;
  height: 250px;
  opacity: 0.4;
  animation: float 18s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

.records-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  z-index: 1;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -1px;
}

.subtitle {
  margin-top: 8px;
  font-size: 16px;
  opacity: 0.7;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #0ea5e9);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.2);
  border-color: rgba(14, 165, 233, 0.3);
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 趋势图 */
.trend-section {
  margin-bottom: 40px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.trend-section h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
}

.trend-chart {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 150px;
  padding-bottom: 20px;
}

.trend-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 5px;
  position: relative;
}

.bar {
  width: 80%;
  background: linear-gradient(180deg, #3b82f6, #0ea5e9);
  border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  min-height: 10px;
  box-shadow: 0 4px 10px rgba(14, 165, 233, 0.3);
}

.bar-label {
  margin-top: 8px;
  font-size: 12px;
  opacity: 0.7;
}

/* 记录列表 */
.records-list {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  opacity: 0.7;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 8px 0;
  font-size: 16px;
}

.empty-hint {
  font-size: 14px !important;
  opacity: 0.6;
}

/* 记录项 */
.records {
  list-style: none;
  padding: 0;
  margin: 0;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin: 8px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 3px solid transparent;
}

.record-item:hover,
.record-item.hovered {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
  border-left-color: #0ea5e9;
}

.record-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.2), transparent);
  transition: left 0.5s;
}

.record-item:hover::before,
.record-item.hovered::before {
  left: 100%;
}

.record-date {
  font-weight: 500;
}

.record-minutes {
  font-weight: 600;
  color: #0ea5e9;
}

/* 动画 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fadeInUp 0.6s ease forwards;
}

.animate-in-delay {
  opacity: 0;
  animation: fadeInUp 0.6s ease 0.2s forwards;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .records-container {
    padding: 30px 15px;
  }
  
  .page-header h2 {
    font-size: 28px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .trend-chart {
    height: 120px;
  }
  
  .bar-label {
    font-size: 10px;
  }
  
  .record-item {
    padding: 14px 16px;
  }
  
  .record-date {
    font-size: 14px;
  }
  
  .record-minutes {
    font-size: 14px;
  }
  
  .bg-decoration-1 {
    width: 200px;
    height: 200px;
  }
  
  .bg-decoration-2 {
    width: 180px;
    height: 180px;
  }
}

@media (max-width: 480px) {
  .records-container {
    padding: 20px 10px;
  }
  
  .page-header h2 {
    font-size: 24px;
  }
  
  .stat-card {
    padding: 20px 16px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .trend-section,
  .records-list {
    padding: 20px 16px;
  }
  
  .trend-chart {
    height: 100px;
  }
  
  .trend-bar {
    margin: 0 3px;
  }
  
  .empty-state {
    padding: 40px 10px;
  }
  
  .empty-icon {
    font-size: 36px;
  }
}
</style>
