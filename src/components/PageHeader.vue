<template>
  <div class="page-header">
    <div class="header-left" @click="handleBack">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
      </svg>
      <h1>{{ title }}</h1>
    </div>
    <div class="header-right" v-if="showAction && actionLabel">
      <button class="action-button" @click="handleAction">
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

defineProps<{
  title: string
  showAction?: boolean
  actionLabel?: string
}>()

// Emits
const emit = defineEmits<{
  action: []
}>()

// Handle back navigation
const handleBack = () => {
  router.back()
}

// Handle action button click
const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 14px 16px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.header-left:hover {
  color: var(--accent-primary);
}

.header-left h1 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 17px;
  }
}

.action-button {
  padding: 8px 16px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: var(--accent-secondary);
  transform: translateY(-1px);
}

.action-button:active {
  transform: translateY(0);
}

/* 深色模式特定样式 */
:global(.dark-theme) .page-header {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

:global(.dark-theme) .action-button {
  background: var(--accent-primary);
}

:global(.dark-theme) .action-button:hover {
  background: var(--accent-secondary);
}
</style>
