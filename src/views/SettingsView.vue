<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 响应式数据 - 时间设置
const focusTime = ref<number>(25)
const shortBreakTime = ref<number>(5)
const longBreakTime = ref<number>(15)
const longBreakInterval = ref<number>(4)

// 响应式数据 - 任务设置
const tasks = ref<Array<{ id: string; text: string }>>([])
const newTaskText = ref<string>('')

// 响应式数据 - 主题设置
const theme = ref<'light' | 'dark'>('dark')

// 交互状态
const currentTab = ref<'time' | 'tasks' | 'appearance'>('time')
const showSavedMessage = ref<boolean>(false)

// 计算属性
const canAddTask = computed(() => newTaskText.value.trim().length > 0)

// 生命周期钩子
onMounted(() => {
  loadSettings()
})

// 加载设置
const loadSettings = () => {
  try {
    // 加载时间设置
    const savedFocusTime = localStorage.getItem('deepfocus-focus-time')
    const savedShortBreak = localStorage.getItem('deepfocus-short-break')
    const savedLongBreak = localStorage.getItem('deepfocus-long-break')
    const savedInterval = localStorage.getItem('deepfocus-interval')

    if (savedFocusTime) focusTime.value = parseInt(savedFocusTime)
    if (savedShortBreak) shortBreakTime.value = parseInt(savedShortBreak)
    if (savedLongBreak) longBreakTime.value = parseInt(savedLongBreak)
    if (savedInterval) longBreakInterval.value = parseInt(savedInterval)

    // 加载任务设置
    const savedTasks = localStorage.getItem('deepfocus-tasks')
    if (savedTasks) {
      tasks.value = JSON.parse(savedTasks)
    }

    // 加载主题设置
    const savedTheme = localStorage.getItem('deepfocus-theme')
    if (savedTheme) {
      theme.value = savedTheme as 'light' | 'dark'
    }

    // 应用主题
    applyTheme()
  } catch (error) {
    console.error('加载设置失败:', error)
  }
}

// 保存设置
const saveSettings = () => {
  try {
    // 保存时间设置
    localStorage.setItem('deepfocus-focus-time', String(focusTime.value))
    localStorage.setItem('deepfocus-short-break', String(shortBreakTime.value))
    localStorage.setItem('deepfocus-long-break', String(longBreakTime.value))
    localStorage.setItem('deepfocus-interval', String(longBreakInterval.value))

    // 保存任务设置
    localStorage.setItem('deepfocus-tasks', JSON.stringify(tasks.value))

    // 保存主题设置
    localStorage.setItem('deepfocus-theme', theme.value)

    // 应用主题
    applyTheme()

    // 显示保存成功消息
    showSavedMessage.value = true
    setTimeout(() => {
      showSavedMessage.value = false
    }, 2000)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 应用主题
const applyTheme = () => {
  if (theme.value === 'dark') {
    document.documentElement.classList.add('dark-theme')
    document.documentElement.classList.remove('light-theme')
  } else {
    document.documentElement.classList.add('light-theme')
    document.documentElement.classList.remove('dark-theme')
  }
}

// 添加任务
const addTask = () => {
  if (!canAddTask.value) return

  tasks.value.push({
    id: Date.now().toString(),
    text: newTaskText.value.trim(),
  })

  newTaskText.value = ''
}

// 删除任务
const deleteTask = (taskId: string) => {
  tasks.value = tasks.value.filter((task) => task.id !== taskId)
}
</script>

<template>
  <div class="page settings-page">
    <!-- 背景装饰元素 -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>

    <div class="settings-container">
      <!-- 页面标题 -->
      <div class="page-header animate-in">
        <h2>设置</h2>
        <p class="subtitle animate-in-delay">自定义你的专注体验</p>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs animate-in-delay">
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'time' }"
          @click="currentTab = 'time'"
        >
          时间设置
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'tasks' }"
          @click="currentTab = 'tasks'"
        >
          任务设置
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'appearance' }"
          @click="currentTab = 'appearance'"
        >
          外观设置
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="settings-content animate-in-delay">
        <!-- 时间设置卡片 -->
        <div v-if="currentTab === 'time'" class="settings-card settings-card-active">
          <h3>专注时长设置</h3>

          <div class="setting-item">
            <label class="setting-label">专注时间 (分钟)</label>
            <div class="setting-control">
              <input
                type="number"
                v-model.number="focusTime"
                min="1"
                max="60"
                class="setting-input"
              />
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">短休息时间 (分钟)</label>
            <div class="setting-control">
              <input
                type="number"
                v-model.number="shortBreakTime"
                min="1"
                max="30"
                class="setting-input"
              />
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">长休息时间 (分钟)</label>
            <div class="setting-control">
              <input
                type="number"
                v-model.number="longBreakTime"
                min="1"
                max="60"
                class="setting-input"
              />
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">长休息间隔 (个番茄钟)</label>
            <div class="setting-control">
              <input
                type="number"
                v-model.number="longBreakInterval"
                min="1"
                max="10"
                class="setting-input"
              />
            </div>
          </div>
        </div>

        <!-- 任务设置卡片 -->
        <div v-else-if="currentTab === 'tasks'" class="settings-card settings-card-active">
          <h3>任务管理</h3>

          <div class="task-input-section">
            <input
              type="text"
              v-model="newTaskText"
              placeholder="添加新任务..."
              class="task-input"
              @keyup.enter="addTask"
            />
            <button class="add-btn" :disabled="!canAddTask" @click="addTask">添加</button>
          </div>

          <div v-if="tasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无任务</p>
            <p class="empty-hint">添加任务以在专注时追踪进度</p>
          </div>

          <ul v-else class="task-list">
            <li v-for="task in tasks" :key="task.id" class="task-item">
              <span class="task-text">{{ task.text }}</span>
              <button class="delete-btn" @click="deleteTask(task.id)" aria-label="删除任务">
                ×
              </button>
            </li>
          </ul>
        </div>

        <!-- 外观设置卡片 -->
        <div v-else-if="currentTab === 'appearance'" class="settings-card settings-card-active">
          <h3>外观设置</h3>

          <div class="setting-item">
            <label class="setting-label">主题</label>
            <div class="theme-selector">
              <button
                class="theme-btn"
                :class="{ active: theme === 'light' }"
                @click="theme = 'light'"
              >
                浅色
              </button>
              <button
                class="theme-btn"
                :class="{ active: theme === 'dark' }"
                @click="theme = 'dark'"
              >
                深色
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center">
        <!-- 保存按钮 -->
        <button class="save-btn animate-in-delay" @click="saveSettings">保存设置</button>
      </div>

      <!-- 保存成功消息 -->
      <div v-if="showSavedMessage" class="saved-message animate-in">✅ 设置已保存</div>
    </div>
  </div>
</template>

<style scoped>
/* 基础样式 - 优化颜色系统 */
:root {
  /* 主色调 */
  --primary-color: #0ea5e9;
  --primary-light: #38bdf8;
  --primary-dark: #0284c7;
  /* 渐变 */
  --primary-gradient: linear-gradient(135deg, #3b82f6, #0ea5e9);
  --primary-gradient-angled: linear-gradient(45deg, #3b82f6, #0ea5e9);
  --secondary-gradient: linear-gradient(135deg, #10b981, #059669);
  /* 功能色 */
  --danger-color: #ef4444;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  /* 背景色 */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: rgba(15, 23, 42, 0.85);
  --bg-card-active: #0ea5e9;
  --bg-hover: rgba(255, 255, 255, 0.1);
  --bg-input: rgba(255, 255, 255, 0.05);
  --bg-input-focus: rgba(255, 255, 255, 0.08);
  /* 文本色 */
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  /* 边框色 */
  --border-color: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);
  --border-focus: rgba(14, 165, 233, 0.3);
  /* 尺寸 */
  --card-radius: 20px;
  --btn-radius: 16px;
  --input-radius: 14px;
  --section-padding: 24px;
  /* 阴影 */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.2);
  --shadow-primary: 0 4px 12px rgba(14, 165, 233, 0.3);
  --shadow-success: 0 4px 12px rgba(16, 185, 129, 0.3);
  /* 过渡 */
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  --transition-slow: 0.5s ease;
}

.settings-page {
  position: relative;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  overflow: hidden;
  /* 添加微妙的背景纹理 */
  background-image:
    radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(14, 165, 233, 0.03) 0%, transparent 50%);
  background-attachment: fixed;
}

/* 背景装饰元素 - 与RecordsView保持一致 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  filter: blur(50px);
  z-index: 0;
  /* 添加动画效果 */
  animation: float 8s ease-in-out infinite;
  mix-blend-mode: overlay;
}

.bg-decoration-1 {
  top: 10%;
  right: 15%;
  width: 400px;
  height: 400px;
  opacity: 0.3;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
  animation-delay: 0s;
}

.bg-decoration-2 {
  bottom: 20%;
  left: 10%;
  width: 350px;
  height: 350px;
  opacity: 0.25;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.3) 0%, transparent 70%);
  animation-delay: -2s;
}

/* 浮动动画 */
@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translate(15px, -15px) scale(1.05);
    opacity: 0.4;
  }
}

/* 主容器 - 与RecordsView保持一致 */
.settings-container {
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  z-index: 1;
}

/* 页面标题 - 与RecordsView保持一致 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h2 {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
  color: var(--primary-color);
  letter-spacing: -1px;
}

.subtitle {
  margin-top: 8px;
  font-size: 16px;
  opacity: 0.7;
}

/* 标签页导航 */
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
  inline-size: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.tab-btn {
  padding: 12px 28px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
  font-size: 15px;
  font-weight: 500;
  opacity: 0.7;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
  transition: left var(--transition-slow);
  z-index: -1;
}

.tab-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

.tab-btn:hover::before {
  left: 100%;
}

.tab-btn.active {
  background: linear-gradient(135deg, var(--primary-color), #2563eb);
  opacity: 1;
  color: white;
  box-shadow:
    var(--shadow-primary),
    0 0 20px rgba(14, 165, 233, 0.4);
  transform: translateY(-2px);
  font-weight: 600;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-btn.active::before {
  display: none;
}

/* 内容区域 */
.settings-content {
  margin-bottom: 32px;
}

/* 设置卡片 - 与RecordsView的卡片风格一致 */
.settings-card {
  background: var(--bg-card);
  border: none;
  border-radius: var(--card-radius);
  padding: var(--section-padding);
  transition: all var(--transition-normal);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.settings-card-active {
  background: var(--bg-card-active);
  border: none;
  box-shadow:
    var(--shadow-primary),
    0 0 20px rgba(14, 165, 233, 0.3);
}

.settings-card-active h3,
.settings-card-active .setting-label,
.settings-card-active .task-text,
.settings-card-active p,
.settings-card-active .empty-hint {
  color: white !important;
  opacity: 1 !important;
}

.settings-card-active .task-input,
.settings-card-active .setting-input {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: white !important;
}

.settings-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.settings-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: rgba(14, 165, 233, 0.3);
}

.settings-card:hover::before {
  opacity: 1;
}

.settings-card h3 {
  margin: 0 0 24px 0;
  font-size: 20px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

/* 设置项 */
.setting-item {
  margin-bottom: 24px;
}

.setting-label {
  display: block;
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 500;
  opacity: 0.9;
}

.setting-control {
  position: relative;
}

/* 输入框样式 */
.setting-input,
.task-input {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg-input);
  border: none;
  border-radius: var(--input-radius);
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  transition: all var(--transition-normal);
  position: relative;
  z-index: 1;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.2);
}

.setting-input::placeholder,
.task-input::placeholder {
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.setting-input:hover,
.task-input:hover {
  border-color: var(--border-hover);
  background: var(--bg-input-focus);
}

.setting-input:focus,
.task-input:focus {
  outline: none;
  background: var(--bg-input-focus);
  box-shadow:
    0 0 0 3px var(--border-focus),
    inset 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-input:focus::placeholder,
.task-input:focus::placeholder {
  color: transparent;
}

/* 主题选择器 */
.theme-selector {
  display: flex;
  gap: 12px;
}

.theme-btn {
  flex: 1;
  padding: 12px 20px;
  border: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border-radius: var(--input-radius);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  font-weight: 500;
}

.theme-btn:hover {
  background: var(--hover-bg);
  border-color: rgba(255, 255, 255, 0.2);
}

.theme-btn.active {
  background: var(--primary-gradient);
  border-color: var(--primary-color);
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* 任务管理 */
.task-input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

/* 添加按钮 - 与RecordsView风格一致 */
.add-btn {
  padding: 12px 24px;
  background: var(--secondary-gradient);
  border: none;
  border-radius: var(--btn-radius);
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.add-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
  z-index: -1;
}
.center {
  margin: auto;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-success);
}

.add-btn:hover:not(:disabled)::before {
  left: 100%;
}

.add-btn:active:not(:disabled) {
  transform: translateY(0);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 任务列表 - 与RecordsView的记录项风格一致 */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
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

.task-item:hover {
  background: var(--hover-bg);
  transform: translateX(5px);
  border-left-color: var(--primary-color);
}

.task-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.2), transparent);
  transition: left 0.5s;
}

.task-item:hover::before {
  left: 100%;
}

.task-text {
  flex: 1;
  font-size: 15px;
  line-height: 1.4;
}

/* 删除按钮 */
.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger-color);
  border-radius: 8px;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.1);
}

/* 空状态 - 与RecordsView保持一致 */
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

/* 保存按钮 - 与RecordsView的按钮风格一致 */
.save-btn {
  display: flex;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
  padding: 14px 24px;
  background: var(--primary-gradient);
  border: none;
  border-radius: var(--btn-radius);
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  z-index: 1;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left var(--transition-slow);
  z-index: -1;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);
  background: var(--primary-gradient-angled);
}

.save-btn:hover::before {
  left: 100%;
}

.save-btn:active {
  transform: translateY(0);
}

/* 保存成功消息 */
.saved-message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  background: rgba(16, 185, 129, 0.95);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  z-index: 1000;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  animation:
    slideInRight 0.4s ease forwards,
    fadeOut 0.4s ease 1.6s forwards;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(20px);
  }
}

/* 动画 - 与RecordsView完全一致 */
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

/* 响应式设计 - 与RecordsView保持一致 */
@media (max-width: 1024px) {
  .settings-container {
    max-width: 700px;
  }
}

@media (max-width: 768px) {
  .settings-container {
    padding: 30px 15px;
    max-width: 100%;
  }

  .page-header h2 {
    font-size: 28px;
  }

  .tabs {
    width: 100%;
    overflow-x: auto;
    justify-content: flex-start;
  }

  .tab-btn {
    padding: 10px 20px;
    font-size: 14px;
    flex-shrink: 0;
  }

  .settings-card {
    padding: 20px;
  }

  .settings-card h3 {
    font-size: 18px;
  }

  .setting-input,
  .task-input {
    font-size: 15px;
    padding: 10px 14px;
  }

  .bg-decoration-1 {
    width: 200px;
    height: 200px;
  }

  .bg-decoration-2 {
    width: 180px;
    height: 180px;
  }

  .task-input-section {
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
  }

  .task-item {
    padding: 14px 16px;
  }

  .task-text {
    font-size: 14px;
  }

  .delete-btn {
    width: 28px;
    height: 28px;
    font-size: 20px;
  }

  .save-btn {
    max-width: 100%;
    padding: 14px 20px;
    font-size: 15px;
  }

  .saved-message {
    top: 15px;
    right: 15px;
    left: 15px;
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .settings-container {
    padding: 20px 10px;
  }

  .page-header h2 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .tabs {
    padding: 3px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 13px;
    border-radius: 6px;
  }

  .settings-card {
    padding: 16px;
  }

  .settings-card h3 {
    font-size: 16px;
    margin-bottom: 20px;
  }

  .setting-item {
    margin-bottom: 20px;
  }

  .setting-label {
    font-size: 14px;
  }

  .theme-selector {
    flex-direction: column;
    gap: 8px;
  }

  .empty-state {
    padding: 40px 10px;
  }

  .empty-icon {
    font-size: 36px;
  }

  .save-btn {
    padding: 12px 18px;
    font-size: 14px;
  }
}
</style>
