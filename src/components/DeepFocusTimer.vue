<template>
  <div class="timer-container" :class="{ 'long-break': isLongBreak }">
    <!-- 水面涟漪呼吸：只有在计时运行时才显示（你要求的） -->
    <div v-if="!isPaused" class="ripple ripple-1"></div>
    <div v-if="!isPaused" class="ripple ripple-2"></div>
    <div v-if="!isPaused" class="ripple ripple-3"></div>
    <div v-if="!isPaused" class="ripple ripple-4"></div>

    <!-- 主圆环 + 时间（点击整圈切换暂停/继续） -->
    <div class="circle-wrapper" @click="togglePause">
      <svg class="progress-ring" width="320" height="320" viewBox="0 0 320 320">
        <circle class="progress-ring__bg" cx="160" cy="160" r="150" stroke-width="12" fill="none" />
        <circle
          class="progress-ring__progress"
          cx="160"
          cy="160"
          r="150"
          stroke-width="12"
          fill="none"
          stroke-linecap="round"
          :stroke="progressColor"
          :style="{ strokeDasharray: circumference, strokeDashoffset: dashOffset }"
        />
      </svg>

      <div class="time-display">
        <div class="time">{{ formatTime(remaining) }}</div>
        <div class="status">{{ statusText }}</div>
      </div>

      <!-- 暂停时显示播放图标 -->
      <div class="play-pause-icon" v-if="isPaused && remaining > 0">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z" />
        </svg>
      </div>
    </div>

    <!-- 底部控制区 -->
    <div class="controls">
      <div class="task-selector">
        <select v-model="selectedTask" class="custom-select">
          <option v-for="t in tasks" :key="t.id" :value="t">
            {{ t.name }}
          </option>
        </select>
        <div class="select-arrow">Down Arrow</div>
      </div>
      <button @click="resetTimer" class="reset-btn">重置</button>
      <button @click="toggleFullscreen" class="fullscreen-btn" title="全屏专注">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path
            d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// ==================== 配置区域 ====================
const FOCUS_MINUTES = 25
const SHORT_BREAK = 5
const LONG_BREAK = 10

// ==================== 响应式状态 ====================
const remaining = ref(FOCUS_MINUTES * 60)
const isPaused = ref(true)
const isLongBreak = ref(false)
const completedPomodoros = ref(0)

const tasks = ref([
  { id: 1, name: '默认任务' },
  { id: 2, name: '学习编程' },
  { id: 3, name: '健身' },
  { id: 4, name: '阅读' },
])
const selectedTask = ref(tasks.value[0])

// ==================== 圆环计算 ====================
const circumference = 2 * Math.PI * 150

const dashOffset = computed(() => {
  const total = isLongBreak.value
    ? (completedPomodoros.value % 4 === 0 && completedPomodoros.value > 0
        ? LONG_BREAK
        : SHORT_BREAK) * 60
    : FOCUS_MINUTES * 60
  return circumference * (1 - (total - remaining.value) / total)
})

const progressColor = computed(() => (isLongBreak.value ? '#60a5fa' : '#0ea5e9'))

const statusText = computed(() => {
  if (isLongBreak.value) {
    return completedPomodoros.value % 4 === 0 && completedPomodoros.value > 0
      ? '长时休息'
      : '短暂休息'
  }
  return selectedTask.value.name
})

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ==================== 计时逻辑 ====================
let timer: any = null
const tick = () => {
  if (remaining.value <= 0) {
    completeCurrentSession()
    return
  }
  remaining.value--
}

const togglePause = () => {
  isPaused.value = !isPaused.value
  if (!isPaused.value) {
    timer = setInterval(tick, 1000)
  } else {
    clearInterval(timer)
    timer = null
  }
}

const completeCurrentSession = () => {
  clearInterval(timer)
  timer = null
  if (!isLongBreak.value) completedPomodoros.value++

  if (!isLongBreak.value) {
    isLongBreak.value = true
    remaining.value =
      completedPomodoros.value % 4 === 0 && completedPomodoros.value > 0
        ? LONG_BREAK * 60
        : SHORT_BREAK * 60
  } else {
    isLongBreak.value = false
    remaining.value = FOCUS_MINUTES * 60
  }
  isPaused.value = false
  timer = setInterval(tick, 1000)
}

const resetTimer = () => {
  clearInterval(timer)
  timer = null
  isPaused.value = true
  isLongBreak.value = false
  remaining.value = FOCUS_MINUTES * 60
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

onUnmounted(() => clearInterval(timer))

watch(selectedTask, () => {
  if (!isLongBreak.value) {
    // statusText 会自动更新
  }
})

watch(
  () => document.fullscreenElement,
  (isFull) => {
    document.body.style.cursor = isFull ? 'none' : 'default'
  },
)
</script>

<style scoped>
/* ==================== 全局容器 ==================== */
.timer-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: #0f172a;
  overflow: hidden;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* ==================== 终极水面涟漪呼吸（4层，运行时才显示） ==================== */
.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(14, 165, 233, 0.18);
  transform: translate(-50%, -50%);
  pointer-events: none;
  animation: ripple 9s infinite ease-out;
  opacity: 0;
}

/* 四层波纹，间隔均匀，永不重复 */
.ripple-1 {
  animation-delay: 0s;
  background: rgba(14, 165, 233, 0.22);
}
.ripple-2 {
  animation-delay: 2.25s;
  background: rgba(14, 165, 233, 0.16);
}
.ripple-3 {
  animation-delay: 4.5s;
  background: rgba(14, 165, 233, 0.12);
}
.ripple-4 {
  animation-delay: 6.75s;
  background: rgba(14, 165, 233, 0.09);
}

/* 丝滑扩散动画（扩散更远、更清晰） */
@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
  }
  15% {
    opacity: 0.9;
  }
  100% {
    width: 3000px;
    height: 3000px;
    opacity: 0;
  }
}

/* 长休息时自动变成柔和浅蓝波纹 */
.long-break .ripple {
  background: rgba(96, 165, 250, 0.18) !important;
}
.long-break .ripple-1 {
  background: rgba(96, 165, 250, 0.22) !important;
}
.long-break .ripple-2 {
  background: rgba(96, 165, 250, 0.16) !important;
}
.long-break .ripple-3 {
  background: rgba(96, 165, 250, 0.12) !important;
}
.long-break .ripple-4 {
  background: rgba(96, 165, 250, 0.09) !important;
}

/* ==================== 你原来的所有样式（完全保留） ==================== */
.circle-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  cursor: pointer;
  z-index: 10;
}
.progress-ring__bg {
  stroke: rgba(255, 255, 255, 0.1);
}
.progress-ring__progress {
  transform: rotate(-90deg);
  transform-origin: center;
  transition: stroke-dashoffset 0.8s ease;
}
.time-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  z-index: 10;
}
.time {
  font-size: 72px;
  font-weight: 600;
  letter-spacing: -2px;
}
.status {
  margin-top: 16px;
  font-size: 18px;
  opacity: 0.8;
  letter-spacing: 2px;
  text-transform: uppercase;
}
.play-pause-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.7;
  z-index: 10;
}

.controls {
  position: absolute;
  bottom: 40px;
  display: flex;
  gap: 32px;
  align-items: center;
  z-index: 10;
  background: rgba(15, 23, 42, 0.6);
  padding: 16px 32px;
  border-radius: 30px;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.task-selector {
  position: relative;
  width: 180px;
}
.custom-select {
  appearance: none;
  width: 100%;
  padding: 14px 40px 14px 20px;
  background: rgba(30, 41, 59, 0.9);
  color: #fff;
  font-size: 16px;
  border: 1px solid rgba(100, 150, 255, 0.4);
  border-radius: 16px;
  outline: none;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s;
}
.custom-select:hover {
  background: rgba(30, 41, 59, 1);
  border-color: #60a5fa;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.25);
}
.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #94a3b8;
  font-size: 12px;
}

.reset-btn,
.fullscreen-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  height: 48px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.reset-btn {
  padding: 0 28px;
  font-size: 15px;
}
.fullscreen-btn {
  width: 48px;
}
.reset-btn:hover,
.fullscreen-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}
</style>
