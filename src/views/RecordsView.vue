<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordsStore } from '../stores/records'

// 初始化记录存储
const recordsStore = useRecordsStore()

// 转换records为兼容现有代码的格式
const records = computed(() => {
  // 按日期分组记录
  const dateGroups = new Map<string, number>()

  recordsStore.records.forEach((record) => {
    if (record.type !== 'focus' || !record.date) return

    const recordDate = new Date(record.date)
    if (isNaN(recordDate.getTime())) return

    const dateStr = recordDate.toISOString().split('T')[0]
    if (!dateStr) return

    // Ensure dateStr is a valid string
    const safeDateStr = dateStr as string
    const existingMinutes = dateGroups.get(safeDateStr) || 0
    dateGroups.set(safeDateStr, existingMinutes + Math.round(record.duration / 60))
  })

  // 转换为兼容现有格式的数组
  return Array.from(dateGroups.entries()).map(([date, minutes]) => ({
    date,
    minutes,
  }))
})

// 交互状态
const hoveredRecord = ref<number | null>(null)

// 时间范围切换状态
const timeRange = ref<'week' | 'month'>('week')

// 当前月份状态（用于月份查看）
const currentMonth = ref(new Date())

// 切换到上个月
const prevMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1,
  )
}

// 切换到下个月
const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1,
  )
}

// 切换到当前月份
const goToCurrentMonth = () => {
  currentMonth.value = new Date()
}

// 记录现在来自recordsStore，不再需要从localStorage加载

// 计算总专注时间
// const totalMinutes = computed(() => {
//   return records.value.reduce((sum, record) => sum + record.minutes, 0)
// })

// 计算平均每天专注时间
// const averageMinutes = computed(() => {
//   if (records.value.length === 0) return 0
//   return Math.round(totalMinutes.value / records.value.length)
// })

// 获取本周的起止日期
const getWeekRange = () => {
  const today = new Date()
  const dayOfWeek = today.getDay() || 7 // 将星期日从0改为7
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1) // 周一
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // 周日
  endOfWeek.setHours(23, 59, 59, 999)

  return { start: startOfWeek, end: endOfWeek }
}

// 获取本月的起止日期
const getMonthRange = () => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0)
  endOfMonth.setHours(23, 59, 59, 999)

  return { start: startOfMonth, end: endOfMonth }
}

// 计算指定时间范围内的记录
const getRangeRecords = (start: Date, end: Date) => {
  return recordsStore.records.filter((record) => {
    if (record.type !== 'focus') return false

    const recordDate = new Date(record.date)
    return recordDate >= start && recordDate <= end
  })
}

// 当前时间范围的统计数据
const rangeStats = computed(() => {
  const range = timeRange.value === 'week' ? getWeekRange() : getMonthRange()
  const rangeRecords = getRangeRecords(range.start, range.end)

  const totalMinutes = Math.round(
    rangeRecords.reduce((sum, record) => sum + record.duration, 0) / 60,
  )
  const daysWithFocus = new Set(
    rangeRecords.map((record) => new Date(record.date).toISOString().split('T')[0]),
  ).size
  const averageMinutes = daysWithFocus > 0 ? Math.round(totalMinutes / daysWithFocus) : 0

  return {
    totalMinutes,
    daysWithFocus,
    averageMinutes,
    recordCount: rangeRecords.length,
  }
})

// 格式化日期显示
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 计算每周专注趋势（最近7天）
const weeklyTrend = computed(() => {
  const today = new Date()
  const weekRecords = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0] || ''
    const dateStart = new Date(dateStr)
    const dateEnd = new Date(dateStr)
    dateEnd.setHours(23, 59, 59, 999)

    // 计算当天的专注时长（只计算focus类型）
    const dayMinutes = Math.round(
      recordsStore
        .getRecordsByDateRange(dateStart, dateEnd)
        .filter((record) => record.type === 'focus')
        .reduce((sum, record) => sum + record.duration, 0) / 60,
    )

    weekRecords.push({
      date: dateStr,
      day: date.toLocaleDateString('zh-CN', { weekday: 'short' }),
      minutes: dayMinutes,
    })
  }

  return weekRecords
})

// 根据专注时长获取显示类别（三阶段）
const getFocusLevel = (minutes: number) => {
  if (minutes === 0) return 'none'
  if (minutes <= 10) return 'low' // 0-10分钟
  if (minutes <= 30) return 'medium' // 11-30分钟
  return 'high' // 60分钟以上
}

// 生成日历网格数据
const calendarGrid = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  // 获取当月第一天
  const firstDay = new Date(year, month, 1)
  // 获取当月最后一天
  const lastDay = new Date(year, month + 1, 0)

  // 获取当月第一天是星期几（0-6，0是星期日）
  const firstDayOfWeek = firstDay.getDay()
  // 获取当月总天数
  const daysInMonth = lastDay.getDate()

  const grid = []
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  // 添加星期标题
  weekDays.forEach((day) => {
    grid.push({
      type: 'weekday',
      label: day,
      date: null,
      minutes: 0,
    })
  })

  // 添加上月的占位日期
  for (let i = 0; i < firstDayOfWeek; i++) {
    grid.push({
      type: 'empty',
      label: '',
      date: null,
      minutes: 0,
    })
  }

  // 添加当月日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0] || ''
    const dateStart = new Date(dateStr)
    const dateEnd = new Date(dateStr)
    dateEnd.setHours(23, 59, 59, 999)

    // 计算当天的专注时长（只计算focus类型）
    const dayMinutes = Math.round(
      recordsStore
        .getRecordsByDateRange(dateStart, dateEnd)
        .filter((record) => record.type === 'focus')
        .reduce((sum, record) => sum + record.duration, 0) / 60,
    )

    grid.push({
      type: 'date',
      label: String(day),
      date: dateStr,
      minutes: dayMinutes,
      level: getFocusLevel(dayMinutes),
    })
  }

  return grid
})

// 获取当前月份显示名称
const currentMonthName = computed(() => {
  return currentMonth.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
  })
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

        <!-- 时间范围切换 -->
        <div class="time-range-selector animate-in-delay">
          <button
            class="range-btn"
            :class="{ active: timeRange === 'week' }"
            @click="timeRange = 'week'"
          >
            本周
          </button>
          <button
            class="range-btn"
            :class="{ active: timeRange === 'month' }"
            @click="timeRange = 'month'"
          >
            本月
          </button>
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-cards animate-in-delay">
        <div class="stat-card">
          <div class="stat-value">{{ timeRange === 'week' ? '本周' : '本月' }}</div>
          <div class="stat-label">时间范围</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rangeStats.totalMinutes }}</div>
          <div class="stat-label">专注分钟</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rangeStats.daysWithFocus }}</div>
          <div class="stat-label">专注天数</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ rangeStats.averageMinutes }}</div>
          <div class="stat-label">日均分钟</div>
        </div>
      </div>

      <!-- 周/月趋势切换显示 -->
      <div v-if="timeRange === 'week'" class="trend-section animate-in-delay">
        <h3>本周趋势</h3>
        <div class="trend-chart">
          <div v-for="item in weeklyTrend" :key="item.date" class="trend-bar">
            <div class="bar" :style="{ height: `${Math.max(10, item.minutes * 0.5)}px` }"></div>
            <div class="bar-label">{{ item.day }}</div>
          </div>
        </div>
      </div>

      <!-- 月份日历视图 -->
      <div v-else-if="timeRange === 'month'" class="calendar-section animate-in-delay">
        <div class="calendar-header">
          <button class="month-nav-btn" @click="prevMonth">&lt;</button>
          <h3>{{ currentMonthName }}</h3>
          <div class="month-actions">
            <button class="today-btn" @click="goToCurrentMonth">今天</button>
            <button class="month-nav-btn" @click="nextMonth">&gt;</button>
          </div>
        </div>

        <div class="calendar-grid">
          <div
            v-for="(item, index) in calendarGrid"
            :key="index"
            class="calendar-cell"
            :class="[item.type, item.type === 'date' && item.level]"
          >
            <div v-if="item.type === 'date'" class="date-content">
              <span class="date-number">{{ item.label }}</span>
              <span v-if="item.minutes > 0" class="date-minutes">{{ item.minutes }}分钟</span>
            </div>
            <span v-else-if="item.type === 'weekday'" class="weekday-label">{{ item.label }}</span>
          </div>
        </div>

        <!-- 图例说明 -->
        <div class="calendar-legend">
          <div class="legend-item">
            <span class="legend-color none"></span>
            <span>无专注记录</span>
          </div>
          <div class="legend-item">
            <span class="legend-color low"></span>
            <span>0-10分钟</span>
          </div>
          <div class="legend-item">
            <span class="legend-color medium"></span>
            <span>11-30分钟</span>
          </div>
          <div class="legend-item">
            <span class="legend-color high"></span>
            <span>60分钟以上</span>
          </div>
        </div>
      </div>

      <!-- 任务统计部分 -->
      <div class="tasks-stats animate-in-delay">
        <h3>任务专注统计</h3>

        <div v-if="Object.keys(recordsStore.taskFocusDuration).length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <p>暂无任务记录</p>
          <p class="empty-hint">创建任务并完成专注后，这里将显示不同任务的专注时间</p>
        </div>

        <div v-else class="tasks-stats-list">
          <!-- 按专注时长排序 -->
          <div
            v-for="(task, index) in Object.entries(recordsStore.taskFocusDuration)
              .sort((a, b) => b[1].duration - a[1].duration)
              .map(([taskId, taskData]) => ({ id: parseInt(taskId), ...taskData }))"
            :key="task.id"
            class="task-stat-item"
            :class="{ hovered: hoveredRecord === index + 1000 }"
            @mouseenter="hoveredRecord = index + 1000"
            @mouseleave="hoveredRecord = null"
          >
            <div class="task-name">{{ task.name }}</div>
            <div class="task-minutes">{{ Math.round(task.duration / 60) }} 分钟</div>
          </div>
        </div>
      </div>

      <!-- 记录列表 -->
      <div class="records-list animate-in-delay">
        <div v-if="recordsStore.records.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <p>暂无记录</p>
          <p class="empty-hint">完成你的第一个番茄钟后，这里将显示你的专注记录</p>
        </div>

        <ul v-else class="records">
          <li
            v-for="(r, index) in records.slice().reverse()"
            :key="r.date"
            class="record-item"
            :class="{ hovered: hoveredRecord === index }"
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
  0%,
  100% {
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

/* 时间范围选择器 */
.time-range-selector {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  inline-size: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.range-btn {
  padding: 10px 24px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
}

.range-btn:hover {
  opacity: 1;
}

.range-btn.active {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  opacity: 1;
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
  transition: all 0.3s ease;
}

.stat-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
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

/* 日历视图 */
.calendar-section {
  margin-bottom: 32px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.calendar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  flex: 1;
  text-align: center;
}

.month-nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.month-nav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.month-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.today-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.calendar-cell {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  min-width: 30px;
  min-height: 30px;
}

.calendar-cell.weekday {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  aspect-ratio: auto;
  height: 32px;
}

.calendar-cell.empty {
  background: transparent;
}

.calendar-cell.date {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

.calendar-cell.date:hover {
  transform: scale(1.05);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 专注时长三阶段颜色 */
.calendar-cell.date.none {
  background: rgba(255, 255, 255, 0.05);
}

.calendar-cell.date.low {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-color: rgba(16, 185, 129, 0.3);
}

.calendar-cell.date.medium {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  border-color: rgba(245, 158, 11, 0.3);
}

.calendar-cell.date.high {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1));
  border-color: rgba(14, 165, 233, 0.3);
}

.date-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  height: 100%;
  padding: 2px;
}

.date-number {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 1px;
}

.date-minutes {
  font-size: 9px;
  opacity: 0.7;
  line-height: 1.2;
}

/* 图例 */
.calendar-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  opacity: 0.8;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.legend-color.none {
  background: rgba(255, 255, 255, 0.05);
}

.legend-color.low {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
  border-color: rgba(16, 185, 129, 0.3);
}

.legend-color.medium {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
  border-color: rgba(245, 158, 11, 0.3);
}

.legend-color.high {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.1));
  border-color: rgba(14, 165, 233, 0.3);
}

/* 记录列表 */
.records-list {
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
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

/* 任务统计部分 */
.tasks-stats {
  margin-bottom: 32px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.tasks-stats h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 600;
}

.tasks-stats-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 3px solid transparent;
}

.task-stat-item:hover,
.task-stat-item.hovered {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
  border-left-color: #3b82f6;
}

.task-stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent);
  transition: left 0.5s;
}

.task-stat-item:hover::before,
.task-stat-item.hovered::before {
  left: 100%;
}

.task-name {
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 12px;
}

.task-minutes {
  font-weight: 600;
  color: #3b82f6;
  min-width: 80px;
  text-align: right;
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
@media (max-width: 1024px) {
  .records-container {
    max-width: 700px;
  }
}

@media (max-width: 768px) {
  .records-container {
    padding: 30px 15px;
    max-width: 100%;
  }

  .page-header h2 {
    font-size: 28px;
  }

  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px 12px;
    min-height: 90px;
  }

  .stat-value {
    font-size: 24px;
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

  /* 日历响应式 */
  .calendar-section {
    padding: 16px;
  }

  .calendar-grid {
    gap: 4px;
  }

  .calendar-cell {
    min-width: 28px;
    min-height: 28px;
  }

  .date-number {
    font-size: 12px;
  }

  .date-minutes {
    font-size: 8px;
  }

  .calendar-legend {
    gap: 12px;
  }

  .legend-item {
    font-size: 11px;
  }

  .month-nav-btn {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }

  .today-btn {
    padding: 4px 10px;
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .records-container {
    padding: 20px 10px;
  }

  .page-header h2 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .time-range-selector {
    margin-top: 16px;
  }

  .range-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .trend-section,
  .calendar-section,
  .records-list {
    padding: 16px 12px;
  }

  .trend-chart {
    height: 100px;
  }

  .trend-bar {
    margin: 0 2px;
  }

  .empty-state {
    padding: 40px 10px;
  }

  .empty-icon {
    font-size: 36px;
  }

  /* 日历响应式优化 */
  .calendar-cell {
    min-width: 24px;
    min-height: 24px;
  }

  .date-content {
    padding: 1px;
  }

  .date-number {
    font-size: 11px;
  }

  .date-minutes {
    font-size: 7px;
    display: none; /* 在非常小的屏幕上隐藏分钟数 */
  }

  .calendar-legend {
    gap: 8px;
    flex-direction: column;
    align-items: center;
  }

  .legend-item {
    font-size: 10px;
  }

  .calendar-header {
    gap: 8px;
  }

  .calendar-header h3 {
    font-size: 18px;
  }

  .month-nav-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .today-btn {
    padding: 3px 8px;
    font-size: 10px;
  }
}
</style>
