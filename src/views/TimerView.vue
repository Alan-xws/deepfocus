<script setup lang="ts">
import DeepFocusTimer from '@/components/DeepFocusTimer.vue'
</script>

<template>
  <div class="page timer-page">
    <DeepFocusTimer />
  </div>
</template>

<style scoped>
.timer-page {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 64px);
}
</style>
