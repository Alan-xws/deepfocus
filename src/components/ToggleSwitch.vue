<template>
  <label class="toggle-switch">
    <input type="checkbox" :checked="modelValue" @change="updateValue" :disabled="disabled" />
    <span class="slider" :class="{ active: modelValue, disabled }">
      <span class="thumb"></span>
    </span>
  </label>
</template>

<script setup lang="ts">
// import { computed } from 'vue'

defineProps<{
  modelValue: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  change: [value: boolean]
}>()

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = target.checked
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
</script>

<style scoped>
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  cursor: pointer;
  user-select: none;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-tertiary);
  border: 2px solid var(--border-color);
  border-radius: 34px;
  transition: all 0.3s ease;
}

.slider.active {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
}

.slider.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider .thumb {
  position: absolute;
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.slider.active .thumb {
  transform: translateX(24px);
}

/* 深色模式特定样式 */
:global(.dark-theme) .slider.active {
  background-color: var(--accent-primary);
}

:global(.dark-theme) .slider .thumb {
  background-color: white;
}
</style>
