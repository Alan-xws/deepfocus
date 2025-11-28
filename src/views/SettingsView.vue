<script setup lang="ts">
import { ref } from 'vue'

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

// ==================== 替换你原来的 addTask 函数 ====================
const addTask = () => {
  const name = newTaskName.value.trim()

  // 防空
  if (!name) {
    newTaskName.value = ''
    return
  }

  // 关键：检查是否已存在同名任务（忽略大小写）
  const exists = tasks.value.some((t) => t.name.toLowerCase() === name.toLowerCase())

  if (exists) {
    // 重复了 → 抖动输入框 + 清空
    triggerShake()
    newTaskName.value = ''
    return
  }

  // 正常添加
  tasks.value.push({
    id: Date.now(),
    name,
  })
  newTaskName.value = ''
}

// ==================== 新增：抖动动画触发函数 ====================
const shakeRef = ref<HTMLElement | null>(null)

const triggerShake = () => {
  if (shakeRef.value) {
    shakeRef.value.classList.add('shake-soft')
    // 600ms 后移除类名，允许再次触发
    setTimeout(() => {
      shakeRef.value?.classList.remove('shake-soft')
    }, 600)
  }
}

const deleteTask = (id: number) => {
  tasks.value = tasks.value.filter((t) => t.id !== id)
}
</script>

<template>
  <!-- 页面整体居中容器 -->
  <div class="settings-container">
    <h2 class="title">设置中心</h2>

    <!-- 时间设置卡片 -->
    <div class="setting-card">
      <h3 class="card-title">时间设置</h3>
      <div class="setting-item">
        <label>专注时长</label>
        <input v-model.number="focus" type="number" min="1" max="120" />
        <span>分钟</span>
      </div>
      <div class="setting-item">
        <label>短休息</label>
        <input v-model.number="short" type="number" min="1" max="30" />
        <span>分钟</span>
      </div>
      <div class="setting-item">
        <label>长休息</label>
        <input v-model.number="long" type="number" min="5" max="60" />
        <span>分钟</span>
      </div>
    </div>

    <!-- 任务设置卡片 -->
    <div class="setting-card">
      <h3 class="card-title">任务设置</h3>

      <!-- 添加任务输入框 -->

      <div class="task-add">
        <input
          ref="shakeRef"
          v-model="newTaskName"
          @keyup.enter="addTask"
          placeholder="输入任务名称后按回车添加"
          class="task-input"
        />
        <button @click="addTask" class="add-btn">+</button>
      </div>

      <!-- 任务列表 -->
      <div class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <span class="task-name">{{ task.name }}</span>
          <button @click="deleteTask(task.id)" class="delete-btn" title="删除">删除</button>
        </div>

        <p v-if="tasks.length === 0" class="empty-tip">暂无任务，试试添加一个</p>
      </div>
    </div>

    <p class="tip">修改后需重启计时器生效</p>
  </div>
</template>

<style scoped>
/* ==================== 页面整体布局 ==================== */
.settings-container {
  min-height: calc(100vh - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 32px;
}

/* 标题：渐变色 */
.title {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  text-align: center;
}

/* ==================== 统一卡片样式（带悬停放大） ==================== */
.setting-card {
  background: rgba(15, 23, 42, 0.8);
  border-radius: 20px;
  padding: 32px 40px;
  width: 100%;
  max-width: 420px;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 20px rgba(14, 165, 233, 0.1);
  transition: all 0.38s cubic-bezier(0.175, 0.885, 0.32, 1.2);
  transform: translateZ(0);
  will-change: transform, box-shadow;
}

.setting-card:hover {
  transform: scale(1.06) translateY(-8px);
  box-shadow:
    0 32px 64px rgba(0, 0, 0, 0.45),
    0 0 50px rgba(14, 165, 233, 0.3);
  z-index: 10;
}

.setting-card:hover .setting-item {
  transform: scale(1.02);
}
.setting-item {
  transition: transform 0.3s ease;
}

/* 卡片内小标题 */
.card-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 28px 0;
  color: #60a5fa;
  text-align: center;
}

/* ==================== 时间设置项 ==================== */
.setting-item {
  display: grid;
  grid-template-columns: 100px 64px auto;
  gap: 16px;
  align-items: center;
  margin: auto;
  width: 70%;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
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

.setting-item input {
  width: 64px;
  height: 40px;
  padding: 0;
  background: rgba(30, 41, 59, 0.95);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 17px;
  font-weight: 600;
  text-align: center;
  line-height: 40px;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: ns-resize;
  -moz-appearance: textfield;
}

.setting-item input::-webkit-inner-spin-button,
.setting-item input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.setting-item input:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: translateY(-1px);
}

.setting-item input:focus {
  transform: scale(1.08);
  background: #1e293b;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.4);
}

.setting-item span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
}

/* ==================== 任务设置专属样式 ==================== */
.task-add {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.task-input {
  flex: 1;
  padding: 14px 16px;
  background: rgba(30, 41, 59, 0.95);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 16px;
  outline: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.task-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.task-input:focus {
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
}

.add-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  border: none;
  border-radius: 14px;
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
}

.add-btn:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.5);
}

/* 任务列表 */
.task-list {
  max-height: 240px;
  overflow-y: auto;
  padding-right: 4px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.task-item:last-child {
  border-bottom: none;
}

.task-name {
  font-size: 16px;
  color: #e2e8f0;
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 20px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.empty-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
  margin: 20px 0;
  font-style: italic;
}

/* 美化滚动条 */
.task-list::-webkit-scrollbar {
  width: 6px;
}
.task-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* 提示文字 */
.tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
}
/* ==================== 新增：防重时的抖动动画（超级丝滑） ==================== */
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

/* 输入框聚焦时也加点光晕（可选，更高级） */
.task-input:focus {
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.4);
  background: rgba(30, 41, 59, 1);
}
</style>
