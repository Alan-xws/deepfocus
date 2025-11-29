<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { onMounted } from 'vue'
import { useThemeStore } from '../stores/theme'
import { logout } from '../utils/api'

const route = useRoute()
const currentPath = () => route.path
const themeStore = useThemeStore()

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
})

// 切换主题
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// 处理登出
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    logout()
  }
}
</script>

<template>
  <header class="navbar">
    <div class="nav-left">
      <RouterLink to="/timer" class="logo">专注</RouterLink>
    </div>

    <nav class="nav-center">
      <RouterLink to="/timer" :class="{ active: currentPath() === '/timer' }">计时器</RouterLink>
      <RouterLink to="/records" :class="{ active: currentPath() === '/records' }"
        >专注记录</RouterLink
      >
      <RouterLink to="/settings" :class="{ active: currentPath() === '/settings' }"
        >设置</RouterLink
      >
      <RouterLink to="/profile" :class="{ active: currentPath() === '/profile' }">我的</RouterLink>
    </nav>

    <div class="nav-right">
      <button
        class="theme-toggle"
        @click="toggleTheme"
        title="切换主题"
        :aria-label="themeStore.isDarkMode ? '切换到浅色主题' : '切换到深色主题'"
      >
        <svg
          v-if="themeStore.isDarkMode"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41.39.39 1.03.39 1.41 0l1.06-1.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"
          />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2c-.55 0-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1V3c0-.55-.45-1-1-1zm9 7h-1V7c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h2c.55 0 1-.45 1-1s-.45-1-1-1zm-1 10h1c.55 0 1-.45 1-1v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1zM4 18h1v-1c0-.55.45-1 1-1s1 .45 1 1v1c0 .55-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1zM18.36 5.64c-.39-.39-1.03-.39-1.41 0L13.41 10.25c-.39.39-.39 1.03 0 1.41l3.54 3.54c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41L14.83 11l3.53-3.53c.38-.39.38-1.03 0-1.41zM6.7 14.83l-3.53-3.54c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l3.54 3.54c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41zm1.41-8.19l3.54 3.54c.39.39.39 1.03 0 1.41l-3.54 3.54c-.39.39-1.03.39-1.41 0-.39-.39-.39-1.03 0-1.41l3.53-3.53c.39-.38.39-1.03 0-1.41l-3.53-3.54c-.38-.39-.38-1.03 0-1.41.39-.39 1.03-.39 1.41 0z"
          />
        </svg>
      </button>
      <!-- 登录页面不显示退出按钮 -->
      <button
        v-if="currentPath() !== '/login'"
        class="logout-btn"
        @click="handleLogout"
        title="退出登录"
      >
        退出
      </button>
      <span class="version">v1.0</span>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  height: 64px;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(90deg, #0ea5e9, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.nav-center a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s;
}

.nav-center a:hover,
.nav-center a.active {
  background: rgba(14, 165, 233, 0.2);
  color: white;
}

.nav-right {
  font-size: 14px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  transform: scale(1.05);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 6px 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

/* 浅色主题下的导航栏样式 */
:global(.light-theme) .navbar {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .nav-center a {
  color: rgba(0, 0, 0, 0.7);
}

:global(.light-theme) .nav-center a:hover,
:global(.light-theme) .nav-center a.active {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

:global(.light-theme) .theme-toggle {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.7);
}

:global(.light-theme) .theme-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.9);
}

:global(.light-theme) .logout-btn {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
  color: rgba(0, 0, 0, 0.7);
}

:global(.light-theme) .logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

:global(.light-theme) .version {
  color: rgba(0, 0, 0, 0.5);
}
</style>
