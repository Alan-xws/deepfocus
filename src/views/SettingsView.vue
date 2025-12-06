<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import { useSettingsStore } from '@/stores/settings'

// 使用设置store
const settingsStore = useSettingsStore()

// 响应式数据 - 任务设置
const tasksStore = useTasksStore()
const newTaskText = ref<string>('')

// 编辑任务状态
const editingTaskId = ref<number | null>(null)
const editingTaskText = ref<string>('')

// 交互状态
const currentTab = ref<'time' | 'tasks' | 'appearance' | 'notifications'>('time')
const showSavedMessage = ref<boolean>(false)
const isResetting = ref<boolean>(false)

// 计算属性
const canAddTask = computed(() => newTaskText.value.trim().length > 0)
const tasks = computed(() => tasksStore.tasks)

// 生命周期钩子
onMounted(() => {
  settingsStore.loadSettings()
  tasksStore.loadTasks()
})

// 保存设置
const saveSettings = () => {
  try {
    // 设置store会自动保存到localStorage
    settingsStore.saveSettings()

    // 显示保存成功消息
    showSavedMessage.value = true
    setTimeout(() => {
      showSavedMessage.value = false
    }, 2000)
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 添加任务
const addTask = () => {
  if (!canAddTask.value) return

  tasksStore.addTask(newTaskText.value.trim())
  newTaskText.value = ''
}

// 编辑任务
const startEditTask = (task: { id: number; name: string }) => {
  editingTaskId.value = task.id
  editingTaskText.value = task.name
}

// 保存编辑的任务
const saveEditTask = () => {
  if (editingTaskId.value !== null && editingTaskText.value.trim()) {
    tasksStore.updateTask(editingTaskId.value, editingTaskText.value.trim())
    cancelEditTask()
  }
}

// 取消编辑任务
const cancelEditTask = () => {
  editingTaskId.value = null
  editingTaskText.value = ''
}

// 删除任务
const deleteTask = (taskId: number) => {
  tasksStore.deleteTask(taskId)
  if (editingTaskId.value === taskId) {
    cancelEditTask()
  }
}

// 重置设置
const resetSettings = () => {
  if (confirm('确定要重置所有设置吗？这将清除您的所有自定义设置并恢复默认值。')) {
    isResetting.value = true
    setTimeout(() => {
      settingsStore.resetSettings()
      isResetting.value = false
      showSavedMessage.value = true
      setTimeout(() => {
        showSavedMessage.value = false
      }, 2000)
    }, 500)
  }
}

// 预设方案
const applyPreset = (preset: 'default' | 'short' | 'long') => {
  switch (preset) {
    case 'default':
      settingsStore.focusTime = 25
      settingsStore.shortBreakTime = 5
      settingsStore.longBreakTime = 15
      settingsStore.longBreakInterval = 4
      break
    case 'short':
      settingsStore.focusTime = 15
      settingsStore.shortBreakTime = 3
      settingsStore.longBreakTime = 10
      settingsStore.longBreakInterval = 3
      break
    case 'long':
      settingsStore.focusTime = 45
      settingsStore.shortBreakTime = 10
      settingsStore.longBreakTime = 30
      settingsStore.longBreakInterval = 2
      break
  }
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
          <span class="tab-icon">⏱️</span>
          时间设置
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'tasks' }"
          @click="currentTab = 'tasks'"
        >
          <span class="tab-icon">📝</span>
          任务设置
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'appearance' }"
          @click="currentTab = 'appearance'"
        >
          <span class="tab-icon">🎨</span>
          外观设置
        </button>
        <button
          class="tab-btn"
          :class="{ active: currentTab === 'notifications' }"
          @click="currentTab = 'notifications'"
        >
          <span class="tab-icon">🔔</span>
          通知设置
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="settings-content animate-in-delay">
        <!-- 时间设置卡片 -->
        <div v-if="currentTab === 'time'" class="settings-card settings-card-active">
          <h3>专注时长设置</h3>

          <!-- 预设方案 -->
          <div class="presets-section">
            <label class="setting-label">快速预设</label>
            <div class="presets-grid">
              <button class="preset-btn" @click="applyPreset('default')">标准模式</button>
              <button class="preset-btn" @click="applyPreset('short')">短时间模式</button>
              <button class="preset-btn" @click="applyPreset('long')">长时间模式</button>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">专注时间 (分钟)</label>
            <div class="setting-control">
              <div class="input-with-slider">
                <input
                  type="number"
                  v-model.number="settingsStore.focusTime"
                  min="1"
                  max="60"
                  class="setting-input"
                />
                <input
                  type="range"
                  v-model.number="settingsStore.focusTime"
                  min="1"
                  max="60"
                  class="slider"
                />
              </div>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">短休息时间 (分钟)</label>
            <div class="setting-control">
              <div class="input-with-slider">
                <input
                  type="number"
                  v-model.number="settingsStore.shortBreakTime"
                  min="1"
                  max="30"
                  class="setting-input"
                />
                <input
                  type="range"
                  v-model.number="settingsStore.shortBreakTime"
                  min="1"
                  max="30"
                  class="slider"
                />
              </div>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">长休息时间 (分钟)</label>
            <div class="setting-control">
              <div class="input-with-slider">
                <input
                  type="number"
                  v-model.number="settingsStore.longBreakTime"
                  min="1"
                  max="60"
                  class="setting-input"
                />
                <input
                  type="range"
                  v-model.number="settingsStore.longBreakTime"
                  min="1"
                  max="60"
                  class="slider"
                />
              </div>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">长休息间隔 (个番茄钟)</label>
            <div class="setting-control">
              <div class="input-with-slider">
                <input
                  type="number"
                  v-model.number="settingsStore.longBreakInterval"
                  min="1"
                  max="10"
                  class="setting-input"
                />
                <input
                  type="range"
                  v-model.number="settingsStore.longBreakInterval"
                  min="1"
                  max="10"
                  class="slider"
                />
              </div>
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
              <div v-if="editingTaskId === task.id" class="task-edit-section">
                <input
                  type="text"
                  v-model="editingTaskText"
                  class="task-input"
                  @keyup.enter="saveEditTask"
                  @keyup.escape="cancelEditTask"
                  ref="(el) => el?.focus()"
                />
                <div class="edit-actions">
                  <button class="save-btn-small" @click="saveEditTask">保存</button>
                  <button class="cancel-btn-small" @click="cancelEditTask">取消</button>
                </div>
              </div>
              <div v-else class="task-content">
                <span class="task-text">{{ task.name }}</span>
                <div class="task-actions">
                  <button class="edit-btn" @click="startEditTask(task)" aria-label="编辑任务">
                    ✏️
                  </button>
                  <button class="delete-btn" @click="deleteTask(task.id)" aria-label="删除任务">
                    ×
                  </button>
                </div>
              </div>
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
                :class="{ active: settingsStore.theme === 'light' }"
                @click="settingsStore.theme = 'light'"
              >
                <span class="theme-icon">☀️</span>
                浅色
              </button>
              <button
                class="theme-btn"
                :class="{ active: settingsStore.theme === 'dark' }"
                @click="settingsStore.theme = 'dark'"
              >
                <span class="theme-icon">🌙</span>
                深色
              </button>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">强调色</label>
            <div class="color-selector">
              <button 
                class="color-option" 
                style="background: #3b82f6" 
                @click="settingsStore.accentColor = '#3b82f6'"
                :class="{ active: settingsStore.accentColor === '#3b82f6' }"
              ></button>
              <button 
                class="color-option" 
                style="background: #8b5cf6" 
                @click="settingsStore.accentColor = '#8b5cf6'"
                :class="{ active: settingsStore.accentColor === '#8b5cf6' }"
              ></button>
              <button 
                class="color-option" 
                style="background: #ec4899" 
                @click="settingsStore.accentColor = '#ec4899'"
                :class="{ active: settingsStore.accentColor === '#ec4899' }"
              ></button>
              <button 
                class="color-option" 
                style="background: #10b981" 
                @click="settingsStore.accentColor = '#10b981'"
                :class="{ active: settingsStore.accentColor === '#10b981' }"
              ></button>
              <button 
                class="color-option" 
                style="background: #f59e0b" 
                @click="settingsStore.accentColor = '#f59e0b'"
                :class="{ active: settingsStore.accentColor === '#f59e0b' }"
              ></button>
              <button 
                class="color-option" 
                style="background: #ef4444" 
                @click="settingsStore.accentColor = '#ef4444'"
                :class="{ active: settingsStore.accentColor === '#ef4444' }"
              ></button>
            </div>
          </div>
        </div>

        <!-- 通知设置卡片 -->
        <div v-else-if="currentTab === 'notifications'" class="settings-card settings-card-active">
          <h3>通知设置</h3>

          <div class="setting-item">
            <label class="setting-label">声音提示</label>
            <div class="setting-control">
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  id="sound-toggle" 
                  v-model="settingsStore.soundEnabled"
                  class="toggle-input"
                />
                <label for="sound-toggle" class="toggle-label"></label>
              </div>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">声音音量</label>
            <div class="setting-control">
              <input 
                type="range" 
                v-model.number="settingsStore.volume" 
                min="0" 
                max="100" 
                class="slider"
                :disabled="!settingsStore.soundEnabled"
              />
              <span class="slider-value">{{ settingsStore.volume }}%</span>
            </div>
          </div>

          <div class="setting-item">
            <label class="setting-label">桌面通知</label>
            <div class="setting-control">
              <div class="toggle-container">
                <input 
                  type="checkbox" 
                  id="notifications-toggle" 
                  v-model="settingsStore.notificationsEnabled"
                  class="toggle-input"
                />
                <label for="notifications-toggle" class="toggle-label"></label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="settings-actions animate-in-delay">
        <!-- 保存按钮 -->
        <button class="save-btn" @click="saveSettings">保存设置</button>
        <!-- 重置按钮 -->
        <button class="reset-btn" @click="resetSettings" :disabled="isResetting">
          {{ isResetting ? '重置中...' : '重置设置' }}
        </button>
      </div>

      <!-- 保存成功消息 -->
      <div v-if="showSavedMessage" class="saved-message">✅ 设置已保存</div>
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
  border-radius: 16px;
  padding: 6px;
  inline-size: fit-content;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
  position: relative;
  overflow: hidden;
}

.tab-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.tab-btn:hover {
  opacity: 1;
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  opacity: 1;
  color: white;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* 内容区域 */
.settings-content {
  margin-bottom: 32px;
}

/* 设置卡片 - 与RecordsView的卡片风格一致 */
.settings-card {
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  opacity: 0.8;
  transform: translateY(10px);
  animation: fadeInUp 0.6s ease forwards;
  position: relative;
  overflow: hidden;
}

.settings-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #0ea5e9);
}

.settings-card-active {
  opacity: 1;
  transform: translateY(0);
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

.settings-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
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
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-sizing: border-box;
}

.setting-input::placeholder,
.task-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.setting-input:hover,
.task-input:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.setting-input:focus,
.task-input:focus {
  outline: none;
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
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
  padding: 10px 20px;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.add-btn:active:not(:disabled) {
  transform: translateY(0);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* 任务列表 */
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.task-text {
  flex: 1;
  font-size: 14px;
  color: var(--text-primary);
}

/* 任务内容区域 */
.task-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

/* 任务操作按钮组 */
.task-actions {
  display: flex;
  gap: 8px;
}

/* 编辑按钮 */
.edit-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary-color);
  border-radius: 8px;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
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

/* 任务编辑区域 */
.task-edit-section {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

/* 编辑操作按钮 */
.edit-actions {
  display: flex;
  gap: 8px;
}

.save-btn-small {
  padding: 6px 12px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn-small:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.cancel-btn-small {
  padding: 6px 12px;
  background: rgba(75, 85, 99, 0.6);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn-small:hover {
  background: rgba(75, 85, 99, 0.8);
  transform: translateY(-1px);
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

/* 设置操作按钮 */
.settings-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

/* 保存按钮 - 与RecordsView的按钮风格一致 */
.save-btn {
  padding: 14px 36px;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
  text-align: center;
  min-width: 160px;
  position: relative;
  overflow: hidden;
}

.save-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.4);
}

.save-btn:active {
  transform: translateY(0);
}

/* 重置按钮 */
.reset-btn {
  padding: 14px 36px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  color: var(--danger-color);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 160px;
}

.reset-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.reset-btn:active:not(:disabled) {
  transform: translateY(0);
}

.reset-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 预设方案 */
.presets-section {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.preset-btn {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
  font-weight: 500;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

/* 输入框与滑块组合 */
.input-with-slider {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 滑块样式 */
.slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  transition: all 0.3s ease;
}

.slider:hover {
  background: rgba(255, 255, 255, 0.2);
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
  transition: all 0.3s ease;
}

.slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);
  transition: all 0.3s ease;
}

.slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
  transform: none;
}

.slider-value {
  margin-left: 12px;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 开关样式 */
.toggle-container {
  position: relative;
  width: 60px;
  height: 30px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  transition: .4s;
  border-radius: 34px;
}

.toggle-label:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-input:checked + .toggle-label {
  background: linear-gradient(135deg, #3b82f6, #0ea5e9);
}

.toggle-input:checked + .toggle-label:before {
  transform: translateX(30px);
}

/* 主题选择器 */
.theme-selector {
  display: flex;
  gap: 12px;
}

.theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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

.theme-icon {
  font-size: 16px;
}

/* 颜色选择器 */
.color-selector {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.color-option {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.color-option.active {
  border-color: white;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* 保存成功消息 */
.saved-message {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
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
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
  to {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
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
  
  .tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    padding: 10px 20px;
    font-size: 13px;
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
    padding: 4px;
  }

  .tab-btn {
    padding: 10px 16px;
    font-size: 13px;
    flex-shrink: 0;
    gap: 6px;
  }
  
  .tab-icon {
    font-size: 14px;
  }
  
  .settings-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .save-btn, .reset-btn {
    width: 100%;
  }
  
  .presets-grid {
    grid-template-columns: 1fr;
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
    bottom: 15px;
    left: 15px;
    right: 15px;
    transform: none;
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
    padding: 8px 12px;
    font-size: 12px;
    border-radius: 6px;
    gap: 4px;
  }
  
  .tab-icon {
    font-size: 12px;
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
