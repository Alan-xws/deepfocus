<template>
  <div class="timer-container" :class="{ 'long-break': isLongBreak }">
    <!-- 背景装饰元素 -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>
    <div class="bg-decoration bg-decoration-3"></div>

    <!-- 主圆环 + 时间（点击整圈切换暂停/继续） -->
    <div
      class="circle-wrapper"
      @click="togglePause"
      :class="{ hovered: hovered }"
      @mouseenter="hovered = true"
      @mouseleave="hovered = false"
    >
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
        <!-- 显示完成的番茄钟数量 -->
        <div class="pomodoro-count" v-if="completedPomodoros > 0">
          已完成 {{ completedPomodoros }} 个番茄钟
        </div>
      </div>

      <!-- 暂停时显示播放图标 -->
      <div class="play-pause-icon" v-if="isPaused && remaining > 0">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
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
        <div class="select-arrow">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      <button
        @click="resetTimer"
        class="reset-btn"
        :class="{ active: isResetHovered }"
        @mouseenter="isResetHovered = true"
        @mouseleave="isResetHovered = false"
      >
        重置
      </button>
      <button
        @click="toggleFullscreen"
        class="fullscreen-btn"
        title="全屏专注"
        :class="{ active: isFullscreenHovered }"
        @mouseenter="isFullscreenHovered = true"
        @mouseleave="isFullscreenHovered = false"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, watch } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useRecordsStore } from '@/stores/records'
import { useSettingsStore } from '@/stores/settings'

// ==================== 配置区域 ====================
// 使用设置store
const settingsStore = useSettingsStore()

// 初始化store
const tasksStore = useTasksStore()
const recordsStore = useRecordsStore()

// 加载设置
settingsStore.loadSettings()

// 响应式状态 ====================
const remaining = ref(settingsStore.getFocusTime * 60)
const isPaused = ref(true)
const isLongBreak = ref(false)
const completedPomodoros = ref(0)

// 交互状态
const hovered = ref(false)
const isResetHovered = ref(false)
const isFullscreenHovered = ref(false)

// 使用store中的任务列表和选中任务
const tasks = computed(() => tasksStore.taskList)
const selectedTask = ref(tasksStore.getDefaultTask())

// ==================== 圆环计算 ====================
const circumference = 2 * Math.PI * 150

const dashOffset = computed(() => {
  const total = isLongBreak.value
    ? (completedPomodoros.value % settingsStore.getLongBreakInterval === 0 &&
      completedPomodoros.value > 0
        ? settingsStore.getLongBreakTime
        : settingsStore.getShortBreakTime) * 60
    : settingsStore.getFocusTime * 60
  return circumference * (1 - (total - remaining.value) / total)
})

const progressColor = computed(() => {
  // 区分短暂休息和长时休息的颜色
  if (isLongBreak.value) {
    // 长时休息：检查是否是真正的长休息（每4个番茄钟）
    if (completedPomodoros.value % 4 === 0 && completedPomodoros.value > 0) {
      return '#8b5cf6' // 长时休息使用深紫色
    } else {
      return '#f97316' // 短暂休息使用橙色
    }
  }
  return '#0ea5e9' // 默认专注时的蓝色
})

const statusText = computed(() => {
  if (isLongBreak.value) {
    return completedPomodoros.value % 4 === 0 && completedPomodoros.value > 0
      ? '长时休息'
      : '短暂休息'
  }
  return selectedTask.value?.name ?? ''
})

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// ==================== 计时逻辑 ====================
let timer: number | null = null
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
    clearInterval(timer!)
    timer = null
  }
}

const completeCurrentSession = () => {
  clearInterval(timer!)
  timer = null

  // 如果是专注时段，保存记录
  if (!isLongBreak.value) {
    completedPomodoros.value++

    // 保存专注记录到store
    recordsStore.addRecord(selectedTask.value, settingsStore.getFocusTime * 60, 'focus')

    // 切换到休息
    isLongBreak.value = true
    remaining.value =
      completedPomodoros.value % settingsStore.getLongBreakInterval === 0 &&
      completedPomodoros.value > 0
        ? settingsStore.getLongBreakTime * 60
        : settingsStore.getShortBreakTime * 60
  } else {
    // 如果是休息结束，保存休息记录
    recordsStore.addRecord(
      selectedTask.value,
      remaining.value,
      isLongBreak.value ? 'long-break' : 'short-break',
    )

    // 切换到专注
    isLongBreak.value = false
    remaining.value = settingsStore.getFocusTime * 60
  }

  isPaused.value = false
  timer = setInterval(tick, 1000)
}

const resetTimer = () => {
  clearInterval(timer!)
  timer = null
  isPaused.value = true
  isLongBreak.value = false
  remaining.value = settingsStore.getFocusTime * 60
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

onUnmounted(() => clearInterval(timer!))

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

// 监听设置变化
watch(
  () => [
    settingsStore.getFocusTime,
    settingsStore.getShortBreakTime,
    settingsStore.getLongBreakTime,
    settingsStore.getLongBreakInterval,
  ],
  ([newFocus, newShort, newLong, newInterval]) => {
    // 只有在计时器暂停且在专注状态时才更新剩余时间
    if (isPaused.value && !isLongBreak.value && newFocus !== undefined) {
      remaining.value = newFocus * 60
    }
    if (isPaused.value && isLongBreak.value && newLong !== undefined) {
      remaining.value = newLong * 60
    }
    if (isPaused.value && !isLongBreak.value && newShort !== undefined) {
      remaining.value = newShort * 60
    }
    if (isPaused.value && isLongBreak.value && newInterval !== undefined) {
      completedPomodoros.value = 0
    }
  },
  { deep: true },
)
</script>

<style scoped>
/* ==================== 全局容器 ==================== */
.timer-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background-color 0.5s ease;
}

/* ==================== 背景装饰元素 ==================== */
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
  left: 15%;
  width: 300px;
  height: 300px;
  opacity: 0.5;
  animation: float 15s ease-in-out infinite;
}

.bg-decoration-2 {
  bottom: 20%;
  right: 10%;
  width: 250px;
  height: 250px;
  opacity: 0.4;
  animation: float 18s ease-in-out infinite reverse;
}

.bg-decoration-3 {
  top: 60%;
  left: 30%;
  width: 200px;
  height: 200px;
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
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

/* 长休息时调整背景装饰 */
.long-break .bg-decoration-1,
.long-break .bg-decoration-2,
.long-break .bg-decoration-3 {
  background: radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, transparent 70%);
}

/* 浅色主题适配 */
:global(.light-theme) .timer-container {
  background: var(--bg-primary); /* 使用主题变量确保正确显示白色背景 */
}

:global(.light-theme) .time-display {
  color: var(--text-primary);
}

:global(.light-theme) .progress-ring__bg {
  stroke: rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .controls {
  background: rgba(255, 255, 255, 0.9);
  border-color: var(--border-color);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .custom-select {
  background: rgba(248, 250, 252, 0.9);
  color: var(--text-primary);
  border-color: rgba(59, 130, 246, 0.4);
}

:global(.light-theme) .custom-select:hover {
  background: rgba(248, 250, 252, 1);
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
}

:global(.light-theme) .select-arrow {
  color: var(--text-secondary);
}

:global(.light-theme) .reset-btn,
:global(.light-theme) .fullscreen-btn {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
}

:global(.light-theme) .reset-btn:hover,
:global(.light-theme) .fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* ==================== 你原来的所有样式（完全保留） ==================== */
.circle-wrapper {
  position: relative;
  width: 320px;
  height: 320px;
  cursor: pointer;
  z-index: 10;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  border-radius: 50%;
}

.circle-wrapper:hover,
.circle-wrapper.hovered {
  transform: scale(1.02);
}

.circle-wrapper:active {
  transform: scale(0.98);
}

.progress-ring__bg {
  stroke: rgba(255, 255, 255, 0.1);
  transition: stroke 0.3s ease;
}

.progress-ring__progress {
  transform: rotate(-90deg);
  transform-origin: center;
  transition:
    stroke-dashoffset 0.8s ease,
    stroke 0.3s ease;
}

.time-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: var(--text-primary);
  z-index: 10;
}

.time {
  font-size: 72px;
  font-weight: 600;
  letter-spacing: -2px;
  transition: font-size 0.3s ease;
}

.status {
  margin-top: 16px;
  font-size: 18px;
  opacity: 0.8;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: opacity 0.3s ease;
}

.pomodoro-count {
  margin-top: 12px;
  font-size: 14px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.play-pause-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.7;
  z-index: 10;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.play-pause-icon:hover {
  opacity: 0.9;
  transform: translate(-50%, -50%) scale(1.1);
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
  transition: all 0.3s ease;
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.custom-select:hover {
  background: rgba(30, 41, 59, 1);
  border-color: #60a5fa;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.25);
  transform: translateY(-1px);
}

.custom-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.custom-select:hover + .select-arrow {
  color: #60a5fa;
  transform: translateY(-50%) rotate(180deg);
}

.reset-btn,
.fullscreen-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  height: 48px;
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.reset-btn::before,
.fullscreen-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.reset-btn:hover::before,
.fullscreen-btn:hover::before,
.reset-btn.active::before,
.fullscreen-btn.active::before {
  left: 100%;
}

.reset-btn {
  padding: 0 28px;
  font-size: 15px;
  font-weight: 500;
}

.fullscreen-btn {
  width: 48px;
}

.reset-btn:hover,
.fullscreen-btn:hover,
.reset-btn.active,
.fullscreen-btn.active {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 255, 255, 0.2);
}

.reset-btn:active,
.fullscreen-btn:active {
  transform: translateY(0);
}

/* ==================== 响应式设计 ==================== */
@media (max-width: 768px) {
  .circle-wrapper {
    width: 280px;
    height: 280px;
  }

  .progress-ring {
    width: 280px;
    height: 280px;
  }

  .time {
    font-size: 60px;
  }

  .status {
    font-size: 16px;
  }

  .controls {
    padding: 14px 24px;
    gap: 24px;
    bottom: 30px;
  }

  .task-selector {
    width: 150px;
  }

  .custom-select {
    padding: 12px 36px 12px 16px;
    font-size: 14px;
  }

  .reset-btn {
    padding: 0 24px;
    font-size: 14px;
    height: 44px;
  }

  .fullscreen-btn {
    width: 44px;
    height: 44px;
  }

  .bg-decoration-1 {
    width: 200px;
    height: 200px;
  }

  .bg-decoration-2 {
    width: 180px;
    height: 180px;
  }

  .bg-decoration-3 {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 480px) {
  .circle-wrapper {
    width: 240px;
    height: 240px;
  }

  .progress-ring {
    width: 240px;
    height: 240px;
  }

  .time {
    font-size: 52px;
  }

  .status {
    font-size: 14px;
  }

  .pomodoro-count {
    font-size: 12px;
  }

  .play-pause-icon svg {
    width: 60px;
    height: 60px;
  }

  .controls {
    padding: 12px 20px;
    gap: 16px;
    bottom: 20px;
  }

  .task-selector {
    width: 130px;
  }

  .custom-select {
    padding: 10px 32px 10px 12px;
    font-size: 13px;
  }

  .reset-btn {
    padding: 0 20px;
    font-size: 13px;
    height: 40px;
  }

  .fullscreen-btn {
    width: 40px;
    height: 40px;
  }
}
</style>
