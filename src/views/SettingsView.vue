<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// ==================== 时间设置 ====================
const focus = ref(25)
const short = ref(5)
const long = ref(15)

// ==================== 任务设置 ====================
interface Task {
  id: number
  name: string
}

const tasks = ref<Task[]>([
  { id: 1, name: '学习编程' },
  { id: 2, name: '健身锻炼' },
  { id: 3, name: '阅读书籍' },
])

const newTaskName = ref('')

// ==================== 主题设置 ====================
const theme = ref<'dark' | 'light' | 'system'>('dark')
const soundEnabled = ref(true)
const notificationsEnabled = ref(true)
const autoSaveEnabled = ref(true)

// ==================== 交互状态 ====================
const shakeRef = ref<HTMLElement | null>(null)
const savedMessage = ref('')
const deleteConfirm = ref<number | null>(null)
const isInputFocused = ref(false)
const hoveredTask = ref<number | null>(null)
const hoveredDelete = ref<number | null>(null)
const activeTab = ref<'timer' | 'tasks' | 'appearance'>('timer')

// ==================== 计算属性 ====================
const isDarkMode = computed(() => {
  if (theme.value === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  return theme.value === 'dark'
})

// ==================== 生命周期 ====================
onMounted(() => {
  // 从本地存储加载设置
  loadSettings()

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', updateThemeClass)
  updateThemeClass()

  return () => {
    mediaQuery.removeEventListener('change', updateThemeClass)
  }
})

// 更新主题类
const updateThemeClass = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else {
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  }
}

// ==================== 方法 ====================
// 加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('deepfocus-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      if (settings.focus) focus.value = settings.focus
      if (settings.short) short.value = settings.short
      if (settings.long) long.value = settings.long
      if (settings.theme) theme.value = settings.theme
      if (typeof settings.soundEnabled === 'boolean') soundEnabled.value = settings.soundEnabled
      if (typeof settings.notificationsEnabled === 'boolean')
        notificationsEnabled.value = settings.notificationsEnabled
      if (typeof settings.autoSaveEnabled === 'boolean')
        autoSaveEnabled.value = settings.autoSaveEnabled
    }

    const savedTasks = localStorage.getItem('deepfocus-tasks')
    if (savedTasks) {
      const savedTasksArray = JSON.parse(savedTasks)
      if (Array.isArray(savedTasksArray) && savedTasksArray.length > 0) {
        tasks.value = savedTasksArray
      }
    }
  } catch (e) {
    console.error('Failed to load settings:', e)
  }
}

// 保存设置
const saveSettings = (event?: Event | boolean) => {
  try {
    // 确定是否显示动画
    const showAnimation = typeof event === 'boolean' ? event : true

    // 添加保存动画效果
    if (showAnimation) {
      const saveBtn = document.querySelector('.save-btn') as HTMLElement
      if (saveBtn) {
        saveBtn.classList.add('saving')
        setTimeout(() => {
          saveBtn.classList.remove('saving')
        }, 800)
      }
    }

    // 保存所有设置
    localStorage.setItem(
      'deepfocus-settings',
      JSON.stringify({
        focus: focus.value,
        short: short.value,
        long: long.value,
        theme: theme.value,
        soundEnabled: soundEnabled.value,
        notificationsEnabled: notificationsEnabled.value,
        autoSaveEnabled: autoSaveEnabled.value,
      }),
    )

    // 保存任务列表
    localStorage.setItem('deepfocus-tasks', JSON.stringify(tasks.value))

    // 更新主题
    updateThemeClass()

    // 显示保存成功提示
    savedMessage.value = '设置已保存'
    // 添加成功音效反馈（如果启用）
    if (soundEnabled.value) {
      playNotificationSound('success')
    }
    setTimeout(() => {
      savedMessage.value = ''
    }, 3000)
  } catch (e) {
    console.error('Failed to save settings:', e)
    savedMessage.value = '保存失败'
    // 添加错误音效反馈（如果启用）
    if (soundEnabled.value) {
      playNotificationSound('error')
    }
    setTimeout(() => {
      savedMessage.value = ''
    }, 3000)
  }
}

// 添加任务
const addTask = () => {
  const name = newTaskName.value.trim()

  // 防空
  if (!name) {
    newTaskName.value = ''
    // 为空时添加轻微抖动提示
    const taskAdd = document.querySelector('.task-add') as HTMLElement
    if (taskAdd) {
      taskAdd.classList.add('shake-soft')
      setTimeout(() => {
        taskAdd.classList.remove('shake-soft')
      }, 300)
    }
    return
  }

  // 检查是否已存在同名任务（忽略大小写）
  const exists = tasks.value.some((t) => t.name.toLowerCase() === name.toLowerCase())

  if (exists) {
    // 重复了 → 抖动输入框 + 清空
    triggerShake()
    newTaskName.value = ''
    // 添加错误音效反馈（如果启用）
    if (soundEnabled.value) {
      playNotificationSound('error')
    }
    return
  }

  // 正常添加
  const newTask = {
    id: Date.now(),
    name,
  }
  tasks.value.push(newTask)
  newTaskName.value = ''

  // 添加添加任务动画
  setTimeout(() => {
    const taskEl = document.querySelector(`[data-task-id="${newTask.id}"]`)
    if (taskEl) {
      taskEl.classList.add('task-added')
    }
  }, 10)

  // 添加成功音效反馈（如果启用）
  if (soundEnabled.value) {
    playNotificationSound('success')
  }

  // 自动保存
  if (autoSaveEnabled.value) {
    saveSettings(false) // 静默保存，不显示按钮动画
  }
}

// 触发抖动动画
const triggerShake = () => {
  if (shakeRef.value) {
    shakeRef.value.classList.add('shake-soft')
    setTimeout(() => {
      shakeRef.value?.classList.remove('shake-soft')
    }, 600)
  }
}

// 删除任务（添加确认动画）
const deleteTask = (id: number) => {
  if (deleteConfirm.value === id) {
    // 第二次点击，确认删除
    // 先添加删除动画
    const taskEl = document.querySelector(`[data-task-id="${id}"]`)
    if (taskEl) {
      taskEl.classList.add('task-deleting')
    }

    // 动画完成后实际删除
    setTimeout(() => {
      tasks.value = tasks.value.filter((t) => t.id !== id)
      deleteConfirm.value = null

      // 添加删除音效反馈（如果启用）
      if (soundEnabled.value) {
        playNotificationSound('delete')
      }

      // 自动保存
      if (autoSaveEnabled.value) {
        saveSettings(false) // 静默保存
      }
    }, 300)
  } else {
    // 第一次点击，显示确认状态
    deleteConfirm.value = id

    // 添加选择音效反馈（如果启用）
    if (soundEnabled.value) {
      playNotificationSound('select')
    }

    // 3秒后自动取消确认
    setTimeout(() => {
      if (deleteConfirm.value === id) {
        deleteConfirm.value = null
      }
    }, 3000)
  }
}

// 快速调整时间
const adjustTime = (event: Event, value: number, delta: number, min: number, max: number) => {
  const currentValue = value === focus.value ? focus : value === short.value ? short : long
  const newValue = Math.max(min, Math.min(max, currentValue.value + delta))

  // 只有值发生变化才更新
  if (currentValue.value !== newValue) {
    currentValue.value = newValue

    // 为时间输入框添加轻微缩放动画
    // 获取所有时间输入框并根据当前操作的输入框进行定位
    const inputWrappers = document.querySelectorAll('.time-input-wrapper')

    // 确定当前操作的是哪个输入框
    // 从事件触发源向上查找最近的时间输入框包装器
    const button = (event?.target as HTMLElement)?.closest('.time-adjust-btn')
    const inputWrapper =
      button?.closest('.time-input-wrapper') || (inputWrappers.length > 0 ? inputWrappers[0] : null)

    if (inputWrapper) {
      inputWrapper.classList.add('time-changed')
      setTimeout(() => {
        inputWrapper.classList.remove('time-changed')
      }, 300)
    }

    // 添加调整音效反馈（如果启用）
    if (soundEnabled.value) {
      playNotificationSound('adjust')
    }

    // 自动保存
    if (autoSaveEnabled.value) {
      saveSettings(false) // 静默保存
    }
  }
}

// 切换标签页
const switchTab = (tab: 'timer' | 'tasks' | 'appearance') => {
  // 只有不同标签才切换
  if (activeTab.value !== tab) {
    // 添加标签切换动画类
    const cards = document.querySelectorAll('.setting-card')
    cards.forEach((card) => {
      card.classList.add('tab-transition-out')
    })

    setTimeout(() => {
      activeTab.value = tab

      // 标签切换后，移除过渡类并添加进入动画
      setTimeout(() => {
        cards.forEach((card) => {
          card.classList.remove('tab-transition-out')
          card.classList.add('tab-transition-in')
          setTimeout(() => {
            card.classList.remove('tab-transition-in')
          }, 300)
        })
      }, 10)

      // 添加标签切换音效反馈（如果启用）
      if (soundEnabled.value) {
        playNotificationSound('select')
      }
    }, 200)
  }
}
// 播放通知音效
const playNotificationSound = (type: 'success' | 'error' | 'select' | 'delete' | 'adjust') => {
  try {
    // 使用 AudioContext 创建简单的音效
    // 使用 any 类型是为了处理 WebKit 浏览器兼容性问题
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    const audioCtx = new AudioContext()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    // 根据不同类型设置不同的音效参数
    switch (type) {
      case 'success':
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.2)
        break
      case 'error':
        oscillator.type = 'sawtooth'
        oscillator.frequency.setValueAtTime(300, audioCtx.currentTime)
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.2)
        break
      case 'select':
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime)
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.1)
        break
      case 'delete':
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.15)
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.15)
        break
      case 'adjust':
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(500, audioCtx.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05)
        oscillator.start()
        oscillator.stop(audioCtx.currentTime + 0.05)
        break
    }
  } catch (e) {
    console.warn('无法播放音效:', e)
  }
}

// 键盘导航支持
const handleKeyDown = (e: KeyboardEvent) => {
  // 处理Tab键导航
  if (e.key === 'Tab') {
    // 聚焦下一个可交互元素
    const focusableElements = Array.from(
      document.querySelectorAll('button, input, select, [tabindex]:not([tabindex="-1"])'),
    )
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    let nextIndex = currentIndex + 1

    if (e.shiftKey) {
      // Shift+Tab 反向导航
      nextIndex = currentIndex - 1
      if (nextIndex < 0) nextIndex = focusableElements.length - 1
    } else {
      // Tab 正向导航
      if (nextIndex >= focusableElements.length) nextIndex = 0
    }

    // 聚焦到下一个元素
    if (nextIndex >= 0 && nextIndex < focusableElements.length) {
      const element = focusableElements[nextIndex] as HTMLElement
      if (element) {
        element.focus()
        // 为聚焦的元素添加视觉反馈
        if (element.classList) {
          element.classList.add('keyboard-focused')
          setTimeout(() => {
            if (element.classList) {
              element.classList.remove('keyboard-focused')
            }
          }, 300)
        }
      }
    }
  }

  // 处理Enter键快捷保存
  if (e.key === 'Enter' && e.ctrlKey) {
    saveSettings()
    e.preventDefault()
  }
}

// 添加键盘事件监听
onMounted(() => {
  // 从本地存储加载设置
  loadSettings()

  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', updateThemeClass)
  updateThemeClass()

  // 添加键盘导航支持
  document.addEventListener('keydown', handleKeyDown)

  return () => {
    mediaQuery.removeEventListener('change', updateThemeClass)
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// 防抖保存功能已移除，相关功能通过Vue的响应式系统自动处理
</script>

<template>
  <!-- 页面整体容器 -->
  <div class="settings-page" :class="{ 'dark-mode': isDarkMode }">
    <!-- 背景装饰元素 -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>
    <div class="bg-decoration bg-decoration-3"></div>

    <!-- 内容容器 -->
    <div class="settings-container">
      <!-- 页面标题 -->
      <div class="page-header animate-in">
        <div class="header-content">
          <h2 class="title">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              class="title-icon"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              ></path>
            </svg>
            设置中心
          </h2>
          <p class="subtitle">自定义你的专注体验</p>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs animate-in-delay">
        <button class="tab" :class="{ active: activeTab === 'timer' }" @click="switchTab('timer')">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="tab-icon"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          时间设置
        </button>
        <button class="tab" :class="{ active: activeTab === 'tasks' }" @click="switchTab('tasks')">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="tab-icon"
          >
            <path
              d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"
            ></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
          任务管理
        </button>
        <button
          class="tab"
          :class="{ active: activeTab === 'appearance' }"
          @click="switchTab('appearance')"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="tab-icon"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          外观设置
        </button>
      </div>

      <!-- 时间设置卡片 -->
      <div v-if="activeTab === 'timer'" class="setting-card animate-in-delay">
        <h3 class="card-title">专注与休息时间</h3>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">专注时长</label>
            <span class="setting-description">每次专注的持续时间</span>
          </div>
          <div class="setting-control">
            <div class="time-input-wrapper">
              <button class="time-adjust-btn minus" @click="adjustTime($event, focus, -1, 1, 120)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <input
                v-model.number="focus"
                type="number"
                min="1"
                max="120"
                class="time-input"
                @change="saveSettings"
              />
              <button class="time-adjust-btn plus" @click="adjustTime($event, focus, 1, 1, 120)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <span class="time-unit">分钟</span>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">短休息</label>
            <span class="setting-description">每次工作后的小休息</span>
          </div>
          <div class="setting-control">
            <div class="time-input-wrapper">
              <button class="time-adjust-btn minus" @click="adjustTime($event, short, -1, 1, 30)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <input
                v-model.number="short"
                type="number"
                min="1"
                max="30"
                class="time-input"
                @change="saveSettings"
              />
              <button class="time-adjust-btn plus" @click="adjustTime($event, short, 1, 1, 30)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <span class="time-unit">分钟</span>
          </div>
        </div>
        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">长休息</label>
            <span class="setting-description">多轮工作后的长休息</span>
          </div>
          <div class="setting-control">
            <div class="time-input-wrapper">
              <button class="time-adjust-btn minus" @click="adjustTime($event, long, -5, 5, 60)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <input
                v-model.number="long"
                type="number"
                min="5"
                max="60"
                class="time-input"
                @change="saveSettings"
              />
              <button class="time-adjust-btn plus" @click="adjustTime($event, long, 5, 5, 60)">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
            <span class="time-unit">分钟</span>
          </div>
        </div>
      </div>

      <!-- 任务设置卡片 -->
      <div v-if="activeTab === 'tasks'" class="setting-card animate-in-delay">
        <h3 class="card-title">任务管理</h3>

        <!-- 添加任务输入框 -->
        <div class="task-add" :class="{ focused: isInputFocused }">
          <input
            ref="shakeRef"
            v-model="newTaskName"
            @keyup.enter="addTask"
            @focus="isInputFocused = true"
            @blur="isInputFocused = false"
            placeholder="输入任务名称后按回车添加"
            class="task-input"
          />
          <button
            @click="addTask"
            class="add-btn"
            :disabled="!newTaskName.trim()"
            :class="{ disabled: !newTaskName.trim() }"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <!-- 任务列表 -->
        <div class="task-list">
          <div
            v-for="task in tasks"
            :key="task.id"
            class="task-item"
            :class="{
              hovered: hoveredTask === task.id,
              'delete-confirm': deleteConfirm === task.id,
            }"
            @mouseenter="hoveredTask = task.id"
            @mouseleave="hoveredTask = null"
          >
            <div class="task-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="9 11 12 14 22 4"></polyline>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div class="task-info">
              <span class="task-name">{{ task.name }}</span>
              <span v-if="deleteConfirm === task.id" class="delete-hint">再次点击确认删除</span>
            </div>
            <button
              @click="deleteTask(task.id)"
              class="delete-btn"
              title="删除"
              :class="{
                hovered: hoveredDelete === task.id,
                'delete-confirm': deleteConfirm === task.id,
              }"
              @mouseenter="hoveredDelete = task.id"
              @mouseleave="hoveredDelete = null"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div v-if="tasks.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>暂无任务</p>
            <p class="empty-hint">添加一些任务来开始你的专注之旅</p>
          </div>
        </div>
      </div>

      <!-- 外观设置卡片 -->
      <div v-if="activeTab === 'appearance'" class="setting-card animate-in-delay">
        <h3 class="card-title">应用外观</h3>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">主题模式</label>
            <span class="setting-description">选择应用的显示主题</span>
          </div>
          <div class="setting-control theme-selector">
            <button
              class="theme-option"
              :class="{ active: theme === 'light' }"
              @click="theme = 'light'"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              浅色
            </button>
            <button
              class="theme-option"
              :class="{ active: theme === 'dark' }"
              @click="theme = 'dark'"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              深色
            </button>
            <button
              class="theme-option"
              :class="{ active: theme === 'system' }"
              @click="theme = 'system'"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              跟随系统
            </button>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">声音提醒</label>
            <span class="setting-description">计时结束时播放提示音</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="soundEnabled" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">通知提醒</label>
            <span class="setting-description">计时结束时显示系统通知</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="notificationsEnabled" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <label class="setting-label">自动保存</label>
            <span class="setting-description">修改设置后自动保存</span>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="autoSaveEnabled" @change="saveSettings" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- 保存按钮 -->
      <button @click="saveSettings" class="save-btn animate-in-delay">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="btn-icon"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
          <polyline points="17 21 17 13 7 13 7 21"></polyline>
          <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        保存设置
      </button>

      <!-- 保存状态提示 -->
      <div
        v-if="savedMessage"
        class="saved-message"
        :class="{ error: savedMessage.includes('失败') }"
      >
        <svg
          v-if="!savedMessage.includes('失败')"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="message-icon success"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="message-icon error"
        >
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        {{ savedMessage }}
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ==================== 页面整体布局 ====================
.settings-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
  overflow: hidden;
  transition: background 0.3s ease;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%);
  pointer-events: none;
  filter: blur(50px);
  z-index: 0;
  opacity: 0.7;
}

.bg-decoration-1 {
  top: 15%;
  left: 10%;
  width: 400px;
  height: 400px;
  opacity: 0.5;
  animation: float 15s ease-in-out infinite;
  background: radial-gradient(circle, rgba(96, 165, 250, 0.2) 0%, transparent 70%);
}

.bg-decoration-2 {
  bottom: 10%;
  right: 15%;
  width: 350px;
  height: 350px;
  opacity: 0.4;
  animation: float 18s ease-in-out infinite reverse;
  background: radial-gradient(circle, rgba(167, 139, 250, 0.2) 0%, transparent 70%);
}

.bg-decoration-3 {
  top: 60%;
  left: 30%;
  width: 300px;
  height: 300px;
  opacity: 0.3;
  animation: float 20s ease-in-out infinite;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%);
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40px, -40px) scale(1.1);
  }
  66% {
    transform: translate(-30px, 30px) scale(0.9);
  }
}

/* 设置容器 */
.settings-container {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 40px 20px 50px;
  gap: 36px;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95));
}

/* 浅色模式背景 */
.settings-page:not(.dark-mode) .settings-container {
  background: linear-gradient(135deg, rgba(251, 252, 254, 0.95), rgba(248, 250, 252, 0.95));
}

/* ==================== 移动端响应式设计 ==================== */
@media (max-width: 768px) {
  /* 整体页面优化 */
  .settings-container {
    padding: 20px 16px 40px;
    gap: 20px;
    min-height: calc(100vh - 56px);
  }

  /* 背景装饰优化 */
  .bg-decoration {
    transform: scale(0.7);
  }

  .bg-decoration-1 {
    top: 5%;
    left: -10%;
  }

  .bg-decoration-2 {
    bottom: 5%;
    right: -10%;
  }

  /* 页面标题适配 */
  .page-header {
    padding: 16px;
    margin-bottom: 16px;
  }

  .title {
    font-size: 28px;
    gap: 8px;
    letter-spacing: -0.5px;
  }

  .title-icon {
    width: 32px;
    height: 32px;
  }

  .subtitle {
    font-size: 14px;
    margin-top: 8px;
  }

  /* 标签页适配 - 优化移动端导航体验 */
  .tabs {
    padding: 6px;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-overflow-scrolling: touch;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.08);
    position: relative;
    min-height: 52px;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    padding: 14px 22px;
    font-size: 14px;
    white-space: nowrap;
    min-height: 52px;
    border-radius: 16px;
    flex-shrink: 0;
    position: relative;
    /* 触摸优化 */
    transition: all 0.15s ease;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    font-weight: 500;
    /* 添加内阴影 */
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  /* 标签点击波纹效果 */
  .tab::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition:
      width 0.5s ease,
      height 0.5s ease;
    pointer-events: none;
  }

  .tab:active::after {
    width: 200px;
    height: 200px;
    opacity: 0;
    transition:
      width 0.5s ease,
      height 0.5s ease,
      opacity 0.5s ease;
  }

  .tab:active {
    transform: scale(0.96);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.05),
      0 1px 3px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.05s ease,
      box-shadow 0.05s ease;
  }

  .tab.active {
    box-shadow:
      0 4px 16px rgba(139, 92, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    background: linear-gradient(145deg, rgba(139, 92, 246, 0.15), rgba(124, 58, 237, 0.15));
  }

  .settings-page:not(.dark-mode) .tab.active {
    background: linear-gradient(145deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1));
  }

  .tab-icon {
    width: 18px;
    height: 18px;
    margin-right: 8px;
    flex-shrink: 0;
  }

  /* 设置卡片适配 - 移动端卡片更紧凑 */
  .setting-card {
    padding: 24px 18px;
    border-radius: 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease;
    backdrop-filter: blur(12px);
    margin-bottom: 20px;
    background: rgba(30, 30, 30, 0.8);
    /* 添加背景渐变效果 */
    background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.05));
    /* 添加细微边框增强层次感 */
    border: 1px solid rgba(255, 255, 255, 0.05);
    position: relative;
    overflow: hidden;
  }

  .settings-page:not(.dark-mode) .setting-card {
    background: rgba(255, 255, 255, 0.95);
    background-image: linear-gradient(145deg, rgba(255, 255, 255, 0.5), rgba(240, 240, 240, 0.5));
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* 卡片触摸效果 - 波纹扩散 */
  .setting-card::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s ease,
      height 0.6s ease;
    pointer-events: none;
  }

  .setting-card:active::before {
    width: 300px;
    height: 300px;
    opacity: 0;
    transition:
      width 0.6s ease,
      height 0.6s ease,
      opacity 0.6s ease;
  }

  .setting-card:active {
    transform: scale(0.99);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.05s ease,
      box-shadow 0.05s ease;
  }

  .card-title {
    font-size: 19px;
    margin-bottom: 20px;
    padding-bottom: 14px;
    font-weight: 600;
    letter-spacing: -0.3px;
  }

  .card-title::after {
    width: 40px;
    height: 2px;
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    background: linear-gradient(90deg, #8b5cf6, transparent);
    border-radius: 1px;
  }

  /* 设置项适配 - 优化移动端布局 */
  .setting-item {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .setting-info {
    width: 100%;
  }

  .setting-label {
    font-size: 16px;
    font-weight: 500;
  }

  .setting-description {
    font-size: 13px;
    line-height: 1.5;
  }

  .setting-control {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  /* 时间输入适配 - 优化移动端交互 */
  .time-input-wrapper {
    display: flex;
    align-items: center;
    width: 100%;
    max-width: 200px;
    margin: 0 auto;
    background: rgba(15, 23, 42, 0.7);
    border-radius: 12px;
    /* 添加细微边框 */
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .settings-page:not(.dark-mode) .time-input-wrapper {
    background: rgba(241, 245, 249, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .time-adjust-btn {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    /* 触摸优化 - 增大点击区域 */
    position: relative;
    transition:
      transform 0.15s ease,
      background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    will-change: transform;
  }

  .settings-page:not(.dark-mode) .time-adjust-btn {
    background: rgba(0, 0, 0, 0.03);
  }

  /* 按钮波纹效果 */
  .time-adjust-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition:
      width 0.4s ease,
      height 0.4s ease;
    pointer-events: none;
  }

  .time-adjust-btn:active::after {
    width: 100px;
    height: 100px;
    opacity: 0;
    transition:
      width 0.4s ease,
      height 0.4s ease,
      opacity 0.4s ease;
  }

  .time-adjust-btn::before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    border-radius: 32px;
  }

  .time-adjust-btn:active {
    transform: scale(0.9);
    background: rgba(255, 255, 255, 0.1);
    transition:
      transform 0.05s ease,
      background-color 0.05s ease;
  }

  .settings-page:not(.dark-mode) .time-adjust-btn:active {
    background: rgba(0, 0, 0, 0.08);
  }

  .time-input {
    width: 90px;
    height: 48px;
    font-size: 20px;
    padding: 0 12px;
    /* 触摸优化 */
    touch-action: manipulation;
    text-align: center;
    font-weight: 600;
  }

  .time-unit {
    font-size: 14px;
    margin-left: 12px;
    font-weight: 500;
  }

  /* 主题选择器优化 */
  .theme-selector {
    flex-direction: column;
    width: 100%;
    gap: 10px;
    padding: 8px;
    background: rgba(15, 23, 42, 0.5);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .settings-page:not(.dark-mode) .theme-selector {
    background: rgba(241, 245, 249, 0.8);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  .theme-option {
    padding: 14px 20px;
    font-size: 14px;
    border-radius: 10px;
    justify-content: flex-start;
    /* 触摸优化 */
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease;
    position: relative;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid transparent;
    overflow: hidden;
  }

  .theme-option.selected {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    background: rgba(139, 92, 246, 0.05);
  }

  /* 主题选项波纹效果 */
  .theme-option::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.15);
    transform: translate(-50%, -50%);
    transition:
      width 0.4s ease,
      height 0.4s ease;
    pointer-events: none;
  }

  .theme-option:active::after {
    width: 200px;
    height: 200px;
    opacity: 0;
    transition:
      width 0.4s ease,
      height 0.4s ease,
      opacity 0.4s ease;
  }

  .theme-option::before {
    content: '';
    position: absolute;
    top: -8px;
    left: -8px;
    right: -8px;
    bottom: -8px;
  }

  .theme-option:active {
    transform: scale(0.97);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.05s ease,
      box-shadow 0.05s ease;
  }

  /* 开关优化 */
  .toggle-switch {
    width: 64px;
    height: 32px;
  }

  .toggle-slider {
    border-radius: 34px;
  }

  .toggle-slider:before {
    height: 24px;
    width: 24px;
    left: 3px;
    bottom: 3px;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(32px);
  }

  /* 任务管理适配 - 优化移动端交互 */
  .task-add {
    padding: 16px;
    border-radius: 14px;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.3s ease;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    position: relative;
    will-change: transform, box-shadow;
  }

  /* 任务添加框悬停效果 */
  .task-add:hover {
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .settings-page:not(.dark-mode) .task-add {
    background: rgba(241, 245, 249, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* 任务添加波纹效果 */
  .task-add::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%);
    transition:
      width 0.5s ease,
      height 0.5s ease;
    pointer-events: none;
  }

  .task-add:active::after {
    width: 300px;
    height: 300px;
    opacity: 0;
    transition:
      width 0.5s ease,
      height 0.5s ease,
      opacity 0.5s ease;
  }

  .task-add:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.05s ease,
      box-shadow 0.05s ease;
  }

  .task-input {
    font-size: 16px;
    padding: 14px 16px;
    line-height: 1.4;
    /* 优化触摸体验 */
    -webkit-appearance: none;
    border-radius: 8px;
  }

  .add-btn {
    padding: 12px 22px;
    border-radius: 10px;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.3s ease,
      box-shadow 0.3s ease;
    background: rgba(139, 92, 246, 0.2);
    overflow: hidden;
    position: relative;
    will-change: transform, box-shadow;
  }

  /* 添加按钮悬停效果 */
  .add-btn:hover {
    background: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
  }

  /* 添加按钮波纹效果 */
  .add-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition:
      width 0.4s ease,
      height 0.4s ease;
    pointer-events: none;
  }

  .add-btn:active::after {
    width: 100px;
    height: 100px;
    opacity: 0;
    transition:
      width 0.4s ease,
      height 0.4s ease,
      opacity 0.4s ease;
  }

  .add-btn:active:not(.disabled) {
    transform: scale(0.95);
    background: rgba(139, 92, 246, 0.25);
    transition:
      transform 0.05s ease,
      background-color 0.05s ease;
  }

  .task-list {
    max-height: 260px;
    padding-right: 6px;
    /* 添加平滑滚动 */
    -webkit-overflow-scrolling: touch;
  }

  .task-item {
    padding: 18px;
    border-radius: 14px;
    margin-bottom: 12px;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.3s ease;
    position: relative;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
    overflow: hidden;
    /* 滑动删除提示 */
    --swipe-delete-threshold: 80px;
    will-change: transform, box-shadow;
  }

  /* 任务项悬停效果 */
  .task-item:hover {
    background: rgba(15, 23, 42, 0.85);
    border-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px) scale(1.01);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  }

  .settings-page:not(.dark-mode) .task-item {
    background: rgba(241, 245, 249, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }

  /* 任务项波纹效果 */
  .task-item::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    transform: translate(-50%, -50%);
    transition:
      width 0.5s ease,
      height 0.5s ease;
    pointer-events: none;
  }

  .task-item:active::after {
    width: 300px;
    height: 300px;
    opacity: 0;
    transition:
      width 0.5s ease,
      height 0.5s ease,
      opacity 0.5s ease;
  }

  .task-item:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition:
      transform 0.05s ease,
      box-shadow 0.05s ease;
  }

  /* 滑动删除提示 */
  .task-item::before {
    content: '← 滑动删除';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
  }

  .task-item.swiping-left::before {
    opacity: 1;
  }

  .settings-page:not(.dark-mode) .task-item::before {
    color: rgba(0, 0, 0, 0.5);
  }

  .task-name {
    font-size: 16px;
    font-weight: 500;
  }

  .delete-btn {
    padding: 10px;
    border-radius: 10px;
    transition:
      background-color 0.3s ease,
      transform 0.2s ease,
      box-shadow 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  /* 删除按钮悬停效果 */
  .delete-btn:hover {
    transform: scale(1.1);
    background-color: rgba(239, 68, 68, 0.15);
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  }

  .delete-btn:active {
    transform: scale(0.95);
  }

  /* 保存按钮适配 */
  .save-btn {
    width: 100%;
    padding: 20px 24px;
    font-size: 17px;
    min-height: 60px;
    border-radius: 16px;
    transition:
      transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
      background 0.3s ease;
    position: relative;
    overflow: hidden;
    /* 增强渐变效果 */
    background: linear-gradient(135deg, #8b5cf6, #6d28d9);
    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
    will-change: transform;
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.5px;
  }

  /* 按钮点击波纹效果 */
  .save-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition:
      width 0.6s ease,
      height 0.6s ease;
    pointer-events: none;
  }

  .save-btn:active::before {
    width: 400px;
    height: 400px;
    opacity: 0;
    transition:
      width 0.6s ease,
      height 0.6s ease,
      opacity 0.6s ease;
  }

  .save-btn:active {
    transform: scale(0.98);
    box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
    transition:
      transform 0.05s ease,
      box-shadow 0.05s ease;
  }

  /* 按钮悬停效果 - 仅在有指针设备时显示 */
  @media (hover: hover) and (pointer: fine) {
    .save-btn:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 30px rgba(139, 92, 246, 0.6);
      background: linear-gradient(135deg, #9333ea, #6d28d9);
    }
  }

  .btn-icon {
    width: 18px;
    height: 18px;
  }

  /* 保存成功消息适配 */
  .saved-message {
    bottom: 24px;
    left: 16px;
    right: 16px;
    transform: none;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 14px;
    backdrop-filter: blur(10px);
    animation: savedMessageSlideIn 0.3s ease-out;
  }

  @keyframes savedMessageSlideIn {
    from {
      transform: translateY(40px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* 空状态优化 */
  .empty-state {
    padding: 30px 16px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  /* 小屏幕额外优化 */
  @media (max-width: 480px) {
    /* 整体布局优化 */
    .settings-container {
      padding: 16px 12px 32px;
      gap: 16px;
    }

    /* 标题区域优化 */
    .page-header {
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 20px;
    }

    .title {
      font-size: 24px;
      gap: 8px;
      display: flex;
      align-items: center;
    }

    .title-icon {
      width: 28px;
      height: 28px;
    }

    .subtitle {
      font-size: 14px;
      line-height: 1.5;
    }

    /* 标签页小屏幕优化 */
    .tabs {
      padding: 6px;
      gap: 8px;
      border-radius: 20px;
      min-height: 52px;
      flex-wrap: wrap;
    }

    .tab {
      padding: 14px 20px;
      font-size: 14px;
      min-height: 52px;
      border-radius: 16px;
      flex: 1;
      min-width: calc(50% - 8px);
    }

    .tab-icon {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }

    /* 卡片小屏幕优化 */
    .setting-card {
      padding: 24px 18px;
      border-radius: 20px;
      margin-bottom: 20px;
    }

    .card-title {
      font-size: 18px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      position: relative;
    }

    .card-title::after {
      width: 35px;
      height: 2px;
    }

    /* 设置项小屏幕优化 */
    .setting-item {
      padding: 16px 0;
      gap: 12px;
      flex-direction: column;
      align-items: flex-start;
    }

    .setting-info {
      margin-bottom: 12px;
    }

    .setting-label {
      font-size: 16px;
    }

    .setting-description {
      font-size: 13px;
    }

    /* 时间输入优化 */
    .time-input-wrapper {
      max-width: 100%;
      width: 100%;
      padding: 6px;
      justify-content: center;
    }

    .time-input {
      width: 80px;
      height: 44px;
      font-size: 18px;
    }

    .time-adjust-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
    }

    .time-unit {
      font-size: 13px;
      margin: 0 4px;
    }

    /* 主题选择器优化 */
    .theme-selector {
      flex-direction: column;
      width: 100%;
    }

    .theme-option {
      padding: 16px;
      width: 100%;
      justify-content: space-between;
    }

    /* 任务管理优化 */
    .task-add {
      padding: 16px;
      flex-direction: column;
      gap: 12px;
    }

    .task-input {
      font-size: 16px;
      padding: 14px 16px;
      min-height: 48px;
      width: 100%;
    }

    .add-btn {
      width: 100%;
      justify-content: center;
      padding: 14px;
    }

    .task-item {
      padding: 16px;
      margin-bottom: 10px;
    }

    .task-name {
      font-size: 16px;
    }

    .delete-btn {
      width: 40px;
      height: 40px;
    }

    /* 保存按钮优化 */
    .save-btn {
      padding: 18px;
      font-size: 16px;
      min-height: 56px;
      border-radius: 14px;
    }

    /* 保存消息优化 */
    .saved-message {
      padding: 14px 16px;
      font-size: 14px;
      bottom: 20px;
      left: 12px;
      right: 12px;
      border-radius: 14px;
    }
  }

  /* 平板设备优化 - 介于手机和平板之间 */
  @media (min-width: 481px) and (max-width: 768px) {
    .settings-container {
      padding: 20px;
    }

    .setting-card {
      padding: 30px 24px;
    }

    .tabs {
      max-width: 100%;
    }

    .setting-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .setting-control {
      width: 100%;
      justify-content: flex-end;
    }
  }

  /* 超小屏幕优化 - 针对低端手机 */
  @media (max-width: 320px) {
    .settings-container {
      padding: 10px 8px 24px;
    }

    .title {
      font-size: 20px;
    }

    .tab {
      padding: 10px 14px;
      font-size: 12px;
    }

    .setting-card {
      padding: 18px 14px;
    }

    .card-title {
      font-size: 16px;
    }
  }
}

/* 页面标题 - 增强版 */
.page-header {
  text-align: center;
  margin-bottom: 28px;
  width: 100%;
  padding: 24px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

/* 装饰光效 */
.page-header::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%);
  animation: lightPulse 8s ease-in-out infinite;
}

@keyframes lightPulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

.page-header:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

/* 浅色模式头部 */
.settings-page:not(.dark-mode) .page-header {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(203, 213, 225, 0.5);
}

.settings-page:not(.dark-mode) .page-header:hover {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.header-content {
  max-width: 600px;
  margin: 0 auto;
}

.title {
  font-size: 42px;
  font-weight: 800;
  background: linear-gradient(90deg, #4f46e5, #8b5cf6, #ec4899);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -1px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  animation: gradientShift 3s ease infinite;
  text-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.title-icon {
  animation: pulse 2s ease-in-out infinite;
  width: 40px;
  height: 40px;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

.subtitle {
  margin-top: 12px;
  font-size: 16px;
  opacity: 0.8;
  margin-bottom: 0;
  color: #cbd5e1;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* ==================== 标签页导航 ==================== */
.tabs {
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.06);
  padding: 6px;
  border-radius: 22px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 600px;
  width: 100%;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.5s ease-out;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

.tabs:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
}

/* 浅色模式标签页 */
.settings-page:not(.dark-mode) .tabs {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(203, 213, 225, 0.6);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.settings-page:not(.dark-mode) .tabs:hover {
  background: white;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
}

.tab {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 26px;
  border-radius: 16px;
  background: transparent;
  color: #94a3b8;
  border: none;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  outline: none;
  min-width: 120px;
  justify-content: center;
  will-change: transform, box-shadow;
  backdrop-filter: blur(10px);
}

.tab::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.tab:hover::before {
  opacity: 1;
}

/* 浅色模式标签 */
.settings-page:not(.dark-mode) .tab {
  color: #64748b;
}

.settings-page:not(.dark-mode) .tab::before {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.05), transparent);
}

.tab:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #f8fafc;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
  z-index: 5;
}

/* 浅色模式标签悬停 */
.settings-page:not(.dark-mode) .tab:hover {
  background: rgba(226, 232, 240, 0.6);
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.tab.active {
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  background-size: 200% auto;
  color: white;
  box-shadow: 0 8px 28px rgba(139, 92, 246, 0.5);
  transform: translateY(-3px) scale(1.03);
  animation: gradientActive 2.5s ease infinite;
  z-index: 10;
}

@keyframes gradientActive {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 浅色模式活动标签 */
.settings-page:not(.dark-mode) .tab.active {
  box-shadow: 0 6px 24px rgba(139, 92, 246, 0.3);
}

.tab.active::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), transparent);
  opacity: 1;
}

.tab-icon {
  opacity: 0.9;
  width: 20px;
  height: 20px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab:hover .tab-icon {
  transform: scale(1.15) rotate(5deg);
}

.tab.active .tab-icon {
  opacity: 1;
  transform: scale(1.2) rotate(5deg);
  animation: iconBounce 0.5s ease-out;
}

@keyframes iconBounce {
  0% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.3) rotate(8deg);
  }
  100% {
    transform: scale(1.2) rotate(5deg);
  }
}

/* ==================== 设置卡片 ==================== */
.setting-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 24px;
  padding: 36px;
  width: 100%;
  max-width: 600px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.5s ease,
    border 0.5s ease;
  animation: slideUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

/* 卡片悬浮光效 */
.setting-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 30%);
  pointer-events: none;
  transition: background 0.5s ease;
}

.setting-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.setting-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 20%);
  pointer-events: none;
}

/* 浅色模式卡片 */
.settings-page:not(.dark-mode) .setting-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(226, 232, 240, 0.7);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.settings-page:not(.dark-mode) .setting-card::after {
  background: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.03) 0%, transparent 20%);
}

.setting-card:hover {
  transform: translateY(-5px) scale(1.01);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.12);
}

.setting-card:hover::before {
  opacity: 1;
}

.setting-card:hover::after {
  background: radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 40%);
}

/* 浅色模式卡片悬停 */
.settings-page:not(.dark-mode) .setting-card:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(226, 232, 240, 1);
}

.settings-page:not(.dark-mode) .setting-card:hover::after {
  background: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.05) 0%, transparent 30%);
}

.card-title {
  font-size: 26px;
  font-weight: 700;
  color: #f8fafc;
  margin: 0 0 28px 0;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: color 0.3s ease;
  position: relative;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 2px;
}

.setting-card:hover .card-title {
  color: #c4b5fd;
}

/* 浅色模式卡片标题 */
.settings-page:not(.dark-mode) .card-title {
  color: #1e293b;
  border-bottom: 1px solid rgba(203, 213, 225, 0.5);
}

.settings-page:not(.dark-mode) .setting-card:hover .card-title {
  color: #6d28d9;
}

/* ==================== 设置项样式 ==================== */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

/* 设置项悬停效果 */
.setting-item:hover {
  border-bottom-color: rgba(148, 163, 184, 0.2);
}

.setting-item:hover .setting-label {
  color: #c4b5fd;
}

/* 浅色模式设置项悬停 */
.settings-page:not(.dark-mode) .setting-item:hover .setting-label {
  color: #6d28d9;
}

.setting-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.setting-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.setting-label {
  font-size: 16px;
  font-weight: 600;
  color: #f8fafc;
  transition: color 0.3s ease;
}

/* 浅色模式标签 */
.settings-page:not(.dark-mode) .setting-label {
  color: #1e293b;
}

.setting-description {
  font-size: 14px;
  color: #94a3b8;
  line-height: 1.4;
  transition: color 0.3s ease;
}

/* 浅色模式描述 */
.settings-page:not(.dark-mode) .setting-description {
  color: #64748b;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ==================== 时间输入框样式 ==================== */
.time-input-wrapper {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 浅色模式时间输入框容器 */
.settings-page:not(.dark-mode) .time-input-wrapper {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(203, 213, 225, 0.5);
}

.time-adjust-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 20px;
  font-weight: 300;
  border-radius: 8px;
  outline: none;
}

/* 浅色模式调整按钮 */
.settings-page:not(.dark-mode) .time-adjust-btn {
  color: #64748b;
}

.time-adjust-btn:hover {
  background: rgba(148, 163, 184, 0.1);
  color: #f8fafc;
}

.time-adjust-btn:active {
  background: rgba(148, 163, 184, 0.2);
}

.time-input {
  width: 80px;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 8px 0;
  outline: none;
  transition: color 0.3s ease;
}

/* 浅色模式输入框 */
.settings-page:not(.dark-mode) .time-input {
  color: #1e293b;
}

.time-input:focus {
  background: rgba(148, 163, 184, 0.05);
  color: #60a5fa;
}

.settings-page:not(.dark-mode) .time-input:focus {
  color: #3b82f6;
}

.time-input:focus {
  background: rgba(148, 163, 184, 0.05);
}

.time-unit {
  font-size: 16px;
  color: #94a3b8;
  font-weight: 500;
  transition: color 0.3s ease;
}

/* 浅色模式时间单位 */
.settings-page:not(.dark-mode) .time-unit {
  color: #64748b;
}

/* ==================== 主题选择器样式 ==================== */
.theme-selector {
  display: flex;
  gap: 12px;
  padding: 6px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 14px;
  transition: all 0.3s ease;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

/* 浅色模式主题选择器 */
.settings-page:not(.dark-mode) .theme-selector {
  background: rgba(241, 245, 249, 0.8);
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.6);
  color: #cbd5e1;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  outline: none;
  position: relative;
  overflow: hidden;
}

.theme-option:hover {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(148, 163, 184, 0.3);
  transform: translateY(-1px);
}

/* 选中主题效果 */
.theme-option.selected {
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  border-color: rgba(139, 92, 246, 0.5);
  color: white;
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.3);
}

/* 浅色模式主题选项 */
.settings-page:not(.dark-mode) .theme-option {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(203, 213, 225, 0.5);
  color: #475569;
}

.theme-option:hover {
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  transform: translateY(-1px);
}

.theme-option.active {
  border-color: #60a5fa;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  color: white;
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.4);
}

/* ==================== 开关样式 ==================== */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  transition: all 0.3s ease;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(148, 163, 184, 0.3);
  transition: 0.4s;
  border-radius: 34px;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* 浅色模式开关滑块 */
.settings-page:not(.dark-mode) .toggle-slider {
  background: rgba(148, 163, 184, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.toggle-slider:before {
  position: absolute;
  content: '';
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .toggle-slider {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  border-color: #60a5fa;
}

input:checked + .toggle-slider:before {
  transform: translateX(30px);
  box-shadow: 0 2px 6px rgba(96, 165, 250, 0.4);
}

/* ==================== 任务样式优化 ==================== */
.task-add {
  display: flex;
  margin-bottom: 24px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 浅色模式任务添加容器 */
.settings-page:not(.dark-mode) .task-add {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(203, 213, 225, 0.5);
}

.task-add.focused {
  border-color: #60a5fa;
  box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.2);
}

.task-input {
  flex: 1;
  padding: 16px;
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 16px;
  outline: none;
  transition: color 0.3s ease;
}

/* 浅色模式任务输入框 */
.settings-page:not(.dark-mode) .task-input {
  color: #1e293b;
}

.settings-page:not(.dark-mode) .task-input::placeholder {
  color: #94a3b8;
}

.task-input::placeholder {
  color: #94a3b8;
}

.add-btn {
  padding: 0 24px;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover:not(.disabled) {
  background: linear-gradient(135deg, #4f46e5, #8b5cf6);
  transform: scale(1.05);
}

.add-btn.disabled {
  background: rgba(148, 163, 184, 0.3);
  cursor: not-allowed;
  transform: none;
}

.task-list {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
}

.task-list::-webkit-scrollbar {
  width: 6px;
}

.task-list::-webkit-scrollbar-track {
  background: rgba(148, 163, 184, 0.1);
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.task-item {
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

/* 浅色模式任务项 */
.settings-page:not(.dark-mode) .task-item {
  background: rgba(241, 245, 249, 0.8);
  border: 1px solid rgba(203, 213, 225, 0.5);
}

.task-icon {
  margin-right: 12px;
  color: #60a5fa;
  opacity: 0.7;
}

.task-item.hovered {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(96, 165, 250, 0.5);
  transform: translateX(4px);
}

/* 浅色模式任务悬停 */
.settings-page:not(.dark-mode) .task-item.hovered {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(96, 165, 250, 0.7);
}

.task-item.hovered .task-icon {
  opacity: 1;
}

.task-item.delete-confirm {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.3);
}

.task-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-size: 16px;
  font-weight: 500;
  color: #f8fafc;
  transition: color 0.3s ease;
}

/* 浅色模式任务名称 */
.settings-page:not(.dark-mode) .task-name {
  color: #1e293b;
}

.delete-hint {
  font-size: 12px;
  color: #ef4444;
  opacity: 0.8;
}

.delete-btn {
  padding: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.delete-btn.delete-confirm {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* 任务添加动画 */
.task-item.task-added {
  animation: taskAdded 0.6s ease-out;
}

@keyframes taskAdded {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  70% {
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 任务删除动画 */
.task-item.task-deleting {
  animation: taskDeleted 0.3s ease-in-out;
  opacity: 0;
  transform: translateX(100px) rotate(5deg);
}

@keyframes taskDeleted {
  0% {
    opacity: 1;
    transform: translateX(0) rotate(0);
  }
  100% {
    opacity: 0;
    transform: translateX(100px) rotate(5deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  transition: color 0.3s ease;
}

/* 浅色模式空状态 */
.settings-page:not(.dark-mode) .empty-state {
  color: #64748b;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.empty-state p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-hint {
  font-size: 14px;
  opacity: 0.7;
}

/* ==================== 保存按钮样式 ==================== */
.save-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 200px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  outline: none;
}

.save-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.save-btn:active {
  transform: translateY(0);
}

/* 保存按钮动画 */
.save-btn.saving {
  animation: pulse 0.8s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
  }
}

.btn-icon {
  opacity: 0.9;
}

/* ==================== 保存状态提示样式 ==================== */
.saved-message {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

/* 浅色模式成功提示 */
.settings-page:not(.dark-mode) .saved-message {
  background: rgba(16, 185, 129, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 浅色模式错误提示 */
.settings-page:not(.dark-mode) .saved-message.error {
  background: rgba(239, 68, 68, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.saved-message.error {
  background: rgba(239, 68, 68, 0.9);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.message-icon {
  flex-shrink: 0;
}

.message-icon.success {
  color: #10b981;
  background: white;
  border-radius: 50%;
}

.message-icon.error {
  color: #ef4444;
  background: white;
  border-radius: 50%;
}

/* ==================== 动画定义 ==================== */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes shake-soft {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.animate-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease-out forwards;
}

.animate-in-delay {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s ease-out 0.2s forwards;
}

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

/* 时间输入框变化动画 */
.time-input-wrapper.time-changed {
  animation: timeChanged 0.3s ease-out;
}

@keyframes timeChanged {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* 标签页切换动画 */
.tab-transition-out {
  animation: tabOut 0.2s ease-out;
  opacity: 0;
  transform: translateY(20px);
}

.tab-transition-in {
  animation: tabIn 0.3s ease-out;
}

@keyframes tabOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes tabIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 键盘导航聚焦样式 */
.keyboard-focused {
  animation: keyboardFocus 0.3s ease-out;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
}

@keyframes keyboardFocus {
  0% {
    box-shadow: 0 0 0 0 rgba(96, 165, 250, 0.8);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(96, 165, 250, 0.2);
  }
  100% {
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
  }
}

/* ==================== 响应式设计 ==================== */
/* 平板设备 */
@media (max-width: 768px) {
  .settings-container {
    padding: 40px 16px;
    gap: 24px;
    min-height: 100vh;
  }

  .title {
    font-size: 36px;
    line-height: 1.2;
  }

  .subtitle {
    font-size: 16px;
  }

  .tabs {
    width: 100%;
    overflow-x: auto;
    padding: 6px;
    -ms-overflow-style: none;
    scrollbar-width: none;
    margin-bottom: 8px;
  }

  .tabs::-webkit-scrollbar {
    display: none;
  }

  .tab {
    padding: 10px 16px;
    font-size: 14px;
    white-space: nowrap;
  }

  .setting-card {
    padding: 24px;
    width: 100%;
    margin: 0 auto;
  }

  .card-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .theme-selector {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }

  .theme-option {
    width: 100%;
    justify-content: center;
    padding: 16px;
  }

  .time-input-wrapper {
    width: 100%;
  }

  .save-btn {
    width: 100%;
    min-width: unset;
    padding: 18px 20px;
    margin-top: 16px;
  }

  .saved-message {
    padding: 14px 20px;
    font-size: 14px;
    bottom: 30px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 24px;
  }

  .setting-control {
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .time-input-wrapper {
    flex: 1;
    justify-content: center;
    margin-bottom: 8px;
  }

  /* 时间设置行优化 */
  .time-setting-row {
    flex-direction: column;
    gap: 16px;
  }

  /* 任务列表优化 */
  .task-list {
    max-height: 250px;
  }

  .task-item {
    padding: 14px;
    margin-bottom: 10px;
  }

  .task-name {
    font-size: 15px;
  }
}

/* 手机设备 */
@media (max-width: 480px) {
  .settings-container {
    padding: 24px 12px;
    gap: 20px;
    margin: 0;
  }

  .title {
    font-size: 28px;
    gap: 8px;
    text-align: center;
  }

  .subtitle {
    font-size: 14px;
    text-align: center;
  }

  .tabs {
    padding: 4px;
  }

  .tab {
    padding: 8px 14px;
    font-size: 13px;
  }

  .setting-card {
    padding: 16px;
    margin: 0;
    border-radius: 16px;
  }

  .card-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .setting-label {
    font-size: 15px;
    font-weight: 600;
  }

  .setting-description {
    font-size: 13px;
    line-height: 1.5;
  }

  .setting-item {
    margin-bottom: 20px;
  }

  /* 时间设置优化 */
  .time-input-wrapper {
    flex-direction: column;
    gap: 12px;
  }

  .time-input {
    font-size: 16px;
    padding: 12px;
    text-align: center;
    width: 100%;
  }

  .time-adjust-btn {
    padding: 8px 16px;
  }

  /* 主题选择优化 */
  .theme-option {
    padding: 14px 16px;
    font-size: 14px;
    margin-bottom: 0;
  }

  /* 开关样式优化 */
  .toggle-switch {
    width: 56px;
    height: 28px;
  }

  .toggle-slider:before {
    height: 20px;
    width: 20px;
  }

  input:checked + .toggle-slider:before {
    transform: translateX(28px);
  }

  /* 任务管理优化 */
  .task-add {
    flex-direction: column;
    gap: 0;
  }

  .task-input {
    padding: 14px;
    font-size: 15px;
    width: 100%;
  }

  .add-btn {
    padding: 12px;
  }

  .task-list {
    max-height: 200px;
    padding-right: 4px;
  }

  .task-item {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .task-icon {
    margin-right: 8px;
  }

  .task-info {
    width: 100%;
  }

  .task-name {
    font-size: 14px;
  }

  .delete-btn {
    align-self: flex-end;
  }

  /* 保存按钮优化 */
  .save-btn {
    padding: 16px 20px;
    font-size: 16px;
    width: 100%;
    margin-top: 12px;
  }

  /* 保存提示优化 */
  .saved-message {
    padding: 12px 16px;
    font-size: 13px;
    border-radius: 8px;
    gap: 8px;
  }

  .message-icon {
    font-size: 18px;
  }

  /* 空状态优化 */
  .empty-state {
    padding: 30px 16px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .empty-state p {
    font-size: 15px;
  }

  .empty-hint {
    font-size: 12px;
  }
}

/* 极小屏幕优化 */
@media (max-width: 360px) {
  .settings-container {
    padding: 16px 8px;
  }

  .title {
    font-size: 24px;
  }

  .setting-card {
    padding: 14px;
  }

  .theme-option {
    padding: 12px;
    font-size: 13px;
  }

  .time-input {
    font-size: 14px;
  }

  .task-list {
    max-height: 180px;
  }
}

/* 横屏模式优化 */
@media (max-height: 480px) and (orientation: landscape) {
  .settings-container {
    padding: 20px 16px;
    min-height: unset;
  }

  .setting-card {
    padding: 16px;
  }

  .task-list {
    max-height: 150px;
  }
}

/* ==================== 深色模式适配 ==================== */
.settings-page:not(.dark-mode) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  color: #0f172a;
}

.settings-page:not(.dark-mode) .subtitle {
  color: #64748b;
}

.settings-page:not(.dark-mode) .tabs {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(148, 163, 184, 0.3);
}

.settings-page:not(.dark-mode) .tab {
  color: #64748b;
}

.settings-page:not(.dark-mode) .tab:hover {
  color: #0f172a;
}

.settings-page:not(.dark-mode) .setting-card {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(148, 163, 184, 0.3);
}

.settings-page:not(.dark-mode) .card-title,
.settings-page:not(.dark-mode) .setting-label,
.settings-page:not(.dark-mode) .task-name {
  color: #0f172a;
}

.settings-page:not(.dark-mode) .time-input-wrapper,
.settings-page:not(.dark-mode) .task-add,
.settings-page:not(.dark-mode) .task-item {
  background: rgba(241, 245, 249, 0.8);
  border-color: rgba(148, 163, 184, 0.3);
}

.settings-page:not(.dark-mode) .time-input,
.settings-page:not(.dark-mode) .task-input {
  color: #0f172a;
}

.settings-page:not(.dark-mode) .bg-decoration-1 {
  background: radial-gradient(circle, rgba(96, 165, 250, 0.15) 0%, transparent 70%);
}

.settings-page:not(.dark-mode) .bg-decoration-2 {
  background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%);
}

.settings-page:not(.dark-mode) .bg-decoration-3 {
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
}

/* ==================== 统一卡片样式 ====================
.setting-card {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 32px 40px;
  width: 100%;
  max-width: 480px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(14, 165, 233, 0.1);
  transition: all 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.2);
  transform: translateZ(0);
  will-change: transform, box-shadow;
  position: relative;
  overflow: hidden;
}

.setting-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
}

.setting-card:hover {
  transform: translateY(-5px);
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.45),
    0 0 40px rgba(14, 165, 233, 0.2);
  border-color: rgba(14, 165, 233, 0.2);
}

.setting-card:hover .setting-item {
  transform: scale(1.01);
}

/* 卡片内小标题 */
.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: #60a5fa;
  text-align: center;
  position: relative;
}

.card-title::after {
  content: '';
  display: block;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  margin: 8px auto 0;
  border-radius: 3px;
}

/* ==================== 时间设置项 ====================
.setting-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 20px;
  align-items: center;
  margin: auto;
  width: 100%;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.3s ease;
}

.setting-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.setting-item label {
  text-align: right;
  font-weight: 500;
  color: #e2e8f0;
  font-size: 16px;
  justify-self: end;
}

/* 时间输入包装器 */
.time-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-input {
  width: 80px;
  height: 48px;
  padding: 0;
  background: rgba(30, 41, 59, 0.95);
  border: 1px solid rgba(100, 150, 255, 0.3);
  border-radius: 12px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  line-height: 48px;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: ns-resize;
  -moz-appearance: textfield;
}

.time-input::-webkit-inner-spin-button,
.time-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.time-input:hover {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(14, 165, 233, 0.5);
  transform: translateY(-1px);
}

.time-input:focus {
  transform: scale(1.05);
  background: #1e293b;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
}

.time-adjust-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.time-adjust-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: #0ea5e9;
  transform: scale(1.1);
}

.time-adjust-btn:active {
  transform: scale(0.95);
}

.time-adjust-btn.plus {
  color: #10b981;
}

.time-adjust-btn.minus {
  color: #f59e0b;
}

.setting-item span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
}

/* ==================== 任务设置专属样式 ====================
.task-add {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  transition: all 0.3s ease;
  position: relative;
}

.task-add.focused {
  transform: scale(1.02);
}

.task-input {
  flex: 1;
  padding: 16px 20px;
  background: rgba(30, 41, 59, 0.95);
  border: 2px solid rgba(100, 150, 255, 0.3);
  border-radius: 16px;
  color: white;
  font-size: 16px;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.task-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.task-input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
  background: rgba(30, 41, 59, 1);
}

.add-btn {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.add-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.add-btn:hover::before {
  left: 100%;
}

.add-btn:hover:not(.disabled) {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.5);
}

.add-btn:active:not(.disabled) {
  transform: scale(0.95);
}

.add-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: linear-gradient(135deg, #475569, #64748b);
}

/* 任务列表 */
.task-list {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 8px;
}

/* 美化滚动条 */
.task-list::-webkit-scrollbar {
  width: 6px;
}

.task-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 任务项 */
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 3px solid transparent;
}

.task-item:hover,
.task-item.hovered {
  background: rgba(255, 255, 255, 0.08);
  border-left-color: #0ea5e9;
  transform: translateX(5px);
}

.task-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
  transition: left 0.5s;
}

.task-item:hover::before,
.task-item.hovered::before {
  left: 100%;
}

.task-item.delete-confirm {
  background: rgba(239, 68, 68, 0.1);
  border-left-color: #ef4444;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-size: 16px;
  color: #e2e8f0;
  font-weight: 500;
}

.delete-hint {
  font-size: 12px;
  color: #fca5a5;
  opacity: 0.8;
}

.delete-btn {
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.delete-btn:hover,
.delete-btn.hovered {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  transform: scale(1.1);
}

.delete-btn.delete-confirm {
  background: rgba(239, 68, 68, 0.3);
  color: #ef4444;
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

/* 保存按钮 */
.save-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 40px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.save-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.save-btn:hover::before {
  left: 100%;
}

.save-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.save-btn:active {
  transform: translateY(-1px);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* ==================== 抖动动画 ====================
.shake-soft {
  animation: shakePro 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97);
}

@keyframes shakePro {
  10%,
  90% {
    transform: translate3d(-2px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(3px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-2px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(2px, 0, 0);
  }
}

/* 入场动画 */
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
  .settings-container {
    padding: 30px 15px;
    gap: 24px;
  }

  .title {
    font-size: 30px;
  }

  .setting-card {
    max-width: 100%;
    padding: 24px 28px;
  }

  .setting-item {
    grid-template-columns: 100px 1fr auto;
    gap: 16px;
  }

  .time-input {
    width: 70px;
    height: 44px;
    font-size: 16px;
  }

  .task-input {
    padding: 14px 16px;
  }

  .add-btn {
    width: 48px;
    height: 48px;
  }

  .save-btn {
    padding: 14px 32px;
    font-size: 15px;
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
  .settings-container {
    padding: 20px 10px;
  }

  .title {
    font-size: 26px;
  }

  .setting-card {
    padding: 20px 20px;
  }

  .setting-item {
    grid-template-columns: 90px 1fr auto;
    gap: 12px;
    padding: 16px 0;
  }

  .setting-item label {
    font-size: 14px;
  }

  .time-input {
    width: 60px;
    height: 40px;
    font-size: 15px;
  }

  .time-adjust-btn {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }

  .task-item {
    padding: 14px 16px;
  }

  .task-name {
    font-size: 15px;
  }

  .delete-btn {
    width: 32px;
    height: 32px;
  }

  .empty-state {
    padding: 40px 10px;
  }

  .empty-icon {
    font-size: 36px;
  }

  .save-btn {
    padding: 12px 28px;
    font-size: 14px;
  }

  .saved-message {
    bottom: 20px;
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>
