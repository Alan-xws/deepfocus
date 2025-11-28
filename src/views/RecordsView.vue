<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Record {
  date: string
  minutes: number
}

const records = ref<Record[]>([])

onMounted(() => {
  const raw = localStorage.getItem('deepfocus-records')
  if (raw) records.value = JSON.parse(raw)
})
</script>

<template>
  <div class="page records-page">
    <h2>专注记录</h2>
    <p v-if="records.length === 0" class="empty">暂无记录</p>
    <ul v-else>
      <li v-for="r in records.slice().reverse()" :key="r.date">
        {{ r.date }} · {{ r.minutes }} 分钟
      </li>
    </ul>
  </div>
</template>

<style scoped>
.records-page {
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
}
h2 {
  text-align: center;
  margin-bottom: 40px;
}
.empty {
  text-align: center;
  opacity: 0.6;
  font-size: 18px;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin: 12px 0;
  display: flex;
  justify-content: space-between;
}
</style>
