<!-- WelcomeView.vue —— 三页极致美观欢迎页 -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentPage = ref(0)

const pages = [
  {
    title: '欢迎来到这里',
    desc: '极简 · 纯粹 · 专注\n让每一次呼吸都成为生产力',
    icon: 'DeepFocus',
  },
  {
    title: '波浪呼吸可视化',
    desc: '专注时波纹随心跳起伏',
    icon: 'Wave',
  },
  {
    title: '准备好了吗？',
    desc: '现在开始\n让时间为你而流动',
    icon: 'Start',
  },
]

// 去计时器页面
const startFocus = () => {
  localStorage.setItem('hasSeenWelcome', 'true') // 记住已看过
  router.push('/timer')
}

// 跳过
const skip = () => {
  localStorage.setItem('hasSeenWelcome', 'true')
  router.push('/timer')
}

// 下一页
const next = () => {
  if (currentPage.value < pages.length - 1) {
    currentPage.value++
  } else {
    startFocus()
  }
}

onMounted(() => {
  // 如果已经看过欢迎页，直接跳到计时器
  if (0) {
    router.replace('/timer')
  }
})
</script>

<template>
  <div class="welcome-container">
    <!-- 当前页面内容 -->
    <Transition name="fade" mode="out-in">
      <div :key="currentPage" class="page">
        <div class="icon">{{ pages[currentPage].icon }}</div>
        <h1 class="title">{{ pages[currentPage].title }}</h1>
        <p class="desc">{{ pages[currentPage].desc }}</p>

        <!-- 页面指示器 -->
        <div class="dots">
          <span v-for="(_, i) in pages" :key="i" :class="{ active: i === currentPage }"></span>
        </div>

        <!-- 按钮区 -->
        <div class="actions">
          <button v-if="currentPage < pages.length - 1" @click="next" class="btn-primary">
            下一页
          </button>
          <button v-else @click="startFocus" class="btn-primary">开始专注</button>
          <button @click="skip" class="btn-skip">跳过</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 全局满屏 + 深色背景 */
.welcome-container {
  position: fixed;
  inset: 0;
  background: #0f172a;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  user-select: none;
}

@keyframes breathe {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
  }
  15% {
    opacity: 0.6;
  }
  100% {
    width: 3000px;
    height: 3000px;
    opacity: 0;
  }
}

/* 页面内容 */
.page {
  text-align: center;
  max-width: 560px;
  padding: 40px;
  z-index: 10;
}

/* 大图标 */
.icon {
  font-size: 120px;
  margin-bottom: 40px;
}

/* 标题 */
.title {
  font-size: 42px;
  font-weight: 700;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 32px 0;
  line-height: 1.2;
}

/* 描述文字 */
.desc {
  font-size: 20px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 60px 0;
  white-space: pre-line;
}

/* 页面指示器 */
.dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 60px;
}
.dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.4s;
}
.dots span.active {
  background: #60a5fa;
  transform: scale(1.4);
}

/* 按钮 */
.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.btn-primary {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  padding: 16px 48px;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.3);
  transition: all 0.3s;
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(14, 165, 233, 0.4);
}

.btn-skip {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 16px;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-skip:hover {
  color: white;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.6s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
