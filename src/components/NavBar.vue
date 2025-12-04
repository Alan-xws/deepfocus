<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useThemeStore } from '../stores/theme'
import { logout } from '../utils/api'

const route = useRoute()
const currentPath = () => route.path
const themeStore = useThemeStore()
const isMobileMenuOpen = ref(false)

// 初始化主题
onMounted(() => {
  themeStore.initTheme()
})

// 切换移动端菜单
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 控制滚动
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

// 关闭移动端菜单
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 处理登出
const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    logout()
  }
}

// 处理登出并关闭菜单
const handleLogoutAndClose = () => {
  handleLogout()
  closeMobileMenu()
}
</script>

<template>
  <header class="navbar">
    <div class="nav-left">
      <RouterLink to="/timer" class="logo">专注</RouterLink>
    </div>

    <!-- 桌面端导航 -->
    <nav class="nav-center">
      <RouterLink to="/timer" :class="{ active: currentPath() === '/timer' }">番茄钟</RouterLink>
      <RouterLink to="/records" :class="{ active: currentPath() === '/records' }"
        >专注记录</RouterLink
      >
      <RouterLink to="/achievements" :class="{ active: currentPath() === '/achievements' }"
        >成就</RouterLink
      >
      <RouterLink to="/square" :class="{ active: currentPath() === '/square' }"
        >专注广场</RouterLink
      >
      <RouterLink to="/settings" :class="{ active: currentPath() === '/settings' }"
        >设置</RouterLink
      >
      <RouterLink to="/profile" :class="{ active: currentPath() === '/profile' }">我的</RouterLink>
    </nav>

    <div class="nav-right">
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

      <!-- 移动端菜单按钮 -->
      <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="打开菜单">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>
    </div>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ open: isMobileMenuOpen }">
      <div class="mobile-menu-content">
        <div class="mobile-menu-header">
          <RouterLink to="/timer" class="logo">专注</RouterLink>
          <button class="close-menu-btn" @click="toggleMobileMenu" aria-label="关闭菜单">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
          </button>
        </div>
        <nav class="mobile-nav">
          <RouterLink
            to="/timer"
            :class="{ active: currentPath() === '/timer' }"
            @click="closeMobileMenu"
            >计时器</RouterLink
          >
          <RouterLink
            to="/records"
            :class="{ active: currentPath() === '/records' }"
            @click="closeMobileMenu"
            >专注记录</RouterLink
          >
          <RouterLink
            to="/achievements"
            :class="{ active: currentPath() === '/achievements' }"
            @click="closeMobileMenu"
            >成就</RouterLink
          >
          <RouterLink
            to="/settings"
            :class="{ active: currentPath() === '/settings' }"
            @click="closeMobileMenu"
            >设置</RouterLink
          >
          <RouterLink
            to="/square"
            :class="{ active: currentPath() === '/square' }"
            @click="closeMobileMenu"
            >专注广场</RouterLink
          >
          <RouterLink
            to="/profile"
            :class="{ active: currentPath() === '/profile' }"
            @click="closeMobileMenu"
            >我的</RouterLink
          >

          <button
            v-if="currentPath() !== '/login'"
            class="mobile-logout-btn"
            @click="handleLogoutAndClose"
            title="退出登录"
          >
            退出
          </button>
        </nav>
      </div>
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
  transition: all 0.3s ease;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  display: inline-block;
}

.nav-center a {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  touch-action: manipulation;
}

.nav-center a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: all 0.3s ease;
  transform: translateX(-50%);
  border-radius: 1px;
}

.nav-center a:hover,
.nav-center a.active {
  background: rgba(59, 130, 246, 0.15);
  color: white;
  transform: translateY(-1px);
}

.nav-center a:hover::after,
.nav-center a.active::after {
  width: 70%;
}

.nav-right {
  font-size: 14px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 16px;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  transform: translateY(-1px);
}

.logout-btn:active {
  transform: translateY(0);
  background: rgba(239, 68, 68, 0.3);
}

/* 移动端菜单按钮 */
.mobile-menu-btn {
  display: none;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  width: 44px;
  height: 44px;
  display: none;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* 移动端菜单样式 */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  height: 100vh;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(15px);
  z-index: 999;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.mobile-menu.open {
  right: 0;
}

.mobile-menu-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.close-menu-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.close-menu-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.05);
}

.close-menu-btn:active {
  transform: scale(0.95);
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.mobile-nav a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 18px 24px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mobile-nav a:hover,
.mobile-nav a.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
  color: white;
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.mobile-nav a:active {
  transform: translateY(0);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
}

.mobile-logout-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 18px 24px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.mobile-logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  transform: translateY(-2px);
}

.mobile-logout-btn:active {
  transform: translateY(0);
  background: rgba(239, 68, 68, 0.3);
}

/* 浅色主题下的导航栏样式 */
:global(.light-theme) .navbar {
  background: rgba(255, 255, 255, 0.95);
  border-bottom-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

:global(.light-theme) .nav-center a {
  color: rgba(0, 0, 0, 0.7);
}

:global(.light-theme) .nav-center a:hover,
:global(.light-theme) .nav-center a.active {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

:global(.light-theme) .nav-center a::after {
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
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

:global(.light-theme) .logout-btn:active {
  background: rgba(239, 68, 68, 0.2);
}

:global(.light-theme) .version {
  color: rgba(0, 0, 0, 0.5);
}

/* 浅色主题移动端样式 */
:global(.light-theme) .mobile-menu-btn,
:global(.light-theme) .close-menu-btn {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.8);
}

:global(.light-theme) .mobile-menu-btn:hover,
:global(.light-theme) .close-menu-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .mobile-menu {
  background: rgba(255, 255, 255, 0.95);
}

:global(.light-theme) .mobile-menu-header {
  border-bottom-color: rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .mobile-nav a {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(0, 0, 0, 0.02);
  border-color: rgba(0, 0, 0, 0.05);
}

:global(.light-theme) .mobile-nav a:hover,
:global(.light-theme) .mobile-nav a.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
  color: #2563eb;
  border-color: rgba(59, 130, 246, 0.2);
}

:global(.light-theme) .mobile-nav a:active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
}

:global(.light-theme) .mobile-logout-btn {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.1);
  color: rgba(0, 0, 0, 0.7);
}

:global(.light-theme) .mobile-logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

:global(.light-theme) .mobile-logout-btn:active {
  background: rgba(239, 68, 68, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navbar {
    height: 56px;
    padding: 0 16px;
  }

  .nav-center {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .logout-btn {
    display: none;
  }

  .version {
    display: none;
  }

  .logo {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .navbar {
    height: 52px;
    padding: 0 12px;
  }

  .mobile-menu-content {
    padding: 16px;
  }

  .mobile-nav a {
    padding: 16px 20px;
    font-size: 16px;
  }

  .mobile-logout-btn {
    padding: 16px 20px;
    font-size: 16px;
  }

  /* 防止iOS双击放大 */
  * {
    touch-action: manipulation;
  }

  /* 触摸优化 */
  .mobile-nav a,
  .mobile-menu-btn,
  .close-menu-btn,
  .mobile-logout-btn {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
  }
}
</style>
