<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
const currentPath = () => route.path
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
}
</style>
