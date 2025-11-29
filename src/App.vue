<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import { RouterView, useRoute } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

// 判断当前是否在「计时器页面」和「全屏/最大化状态」
const route = useRoute()
const isImmersive = ref(false)

const checkImmersive = () => {
  const isTimerPage = route.path === '/timer' // 你的计时器路由
  const isFullscreen = !!document.fullscreenElement
  const isMaximized = window.innerHeight >= screen.height - 100 // 容错：减100px避免误判

  isImmersive.value = isTimerPage && (isFullscreen || isMaximized)
}

onMounted(() => {
  // 检查沉浸模式状态
  checkImmersive()
  window.addEventListener('resize', checkImmersive)
  document.addEventListener('fullscreenchange', checkImmersive)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkImmersive)
  document.removeEventListener('fullscreenchange', checkImmersive)
})
</script>

<template>
  <div class="app" :class="{ immersive: isImmersive }">
    <!-- 沉浸模式下隐藏导航栏 -->
    <NavBar v-if="!isImmersive" />

    <!-- 路由内容区 -->
    <main class="router-container" :class="{ full: isImmersive }">
      <RouterView />
    </main>

    <!-- 沉浸模式下隐藏底部 -->
    <footer v-if="!isImmersive" class="footer">
      <p>© 2025 深度 · 专注，让时间更有意义</p>
    </footer>
  </div>
</template>

<style>
/* 全局主题变量 */
:root {
  /* 深色主题变量 */
  --bg-primary: #0f172a;
  --bg-secondary: #1a1a2e;
  --bg-card: rgba(15, 23, 42, 0.95);
  --bg-card-light: rgba(255, 255, 255, 0.05);

  --text-primary: white;
  --text-secondary: rgba(255, 255, 255, 0.8);
  --text-disabled: rgba(255, 255, 255, 0.5);

  --border-color: rgba(255, 255, 255, 0.1);

  --accent-primary: #60a5fa;
  --accent-secondary: #a78bfa;
  --accent-hover: rgba(96, 165, 250, 0.2);

  --error-light: #fca5a5;
  --error-main: #ef4444;
  --error-bg: rgba(239, 68, 68, 0.1);

  color-scheme: dark;
}

/* 浅色主题 */
.light-theme {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-card: rgba(255, 255, 255, 0.95);
  --bg-card-light: rgba(0, 0, 0, 0.05);

  --text-primary: #0f172a;
  --text-secondary: rgba(0, 0, 0, 0.7);
  --text-disabled: rgba(0, 0, 0, 0.5);

  --border-color: rgba(0, 0, 0, 0.1);

  --accent-primary: #3b82f6;
  --accent-secondary: #8b5cf6;
  --accent-hover: rgba(59, 130, 246, 0.1);

  --error-light: #fca5a5;
  --error-main: #dc2626;
  --error-bg: rgba(239, 68, 68, 0.05);

  color-scheme: light;
}
</style>

<style scoped>
/* 你原来的所有样式全部保留！只加下面几行 */

/* 沉浸模式：隐藏头尾 + 内容区占满全屏 */
.app.immersive {
  background: var(--bg-primary);
}

.app.immersive .router-container.full {
  position: fixed;
  inset: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  z-index: 9999;
}

/* 确保沉浸模式下真的看不见头尾 */
.app.immersive header,
.app.immersive footer {
  display: none !important;
}

/* 你原来的样式全部不动（保持原样） */
html,
body,
#app,
.app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

header {
  flex-shrink: 0;
  height: 64px;
}

.router-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}
.router-container::-webkit-scrollbar {
  width: 6px;
}
.router-container::-webkit-scrollbar-track {
  background: transparent;
}
.router-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}
.router-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

.footer {
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0.6;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(10px);
}
</style>
