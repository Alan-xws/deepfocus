<template>
  <div class="page notifications-page">
    <div class="page-header">
      <div class="back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
      </div>
      <h1>通知设置</h1>
    </div>

    <div class="settings-container">
      <!-- 专注提醒设置 -->
      <div class="settings-section">
        <h2>专注提醒</h2>
        <div class="setting-card">
          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">专注开始提醒</span>
              <span class="toggle-description">专注计时开始时发送通知</span>
            </div>
            <ToggleSwitch v-model="focusStartEnabled" @change="handleFocusStartChange" />
          </div>

          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">专注结束提醒</span>
              <span class="toggle-description">专注计时结束时发送通知</span>
            </div>
            <ToggleSwitch v-model="focusEndEnabled" @change="handleFocusEndChange" />
          </div>

          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">休息提醒</span>
              <span class="toggle-description">休息时间开始和结束时发送通知</span>
            </div>
            <ToggleSwitch v-model="breakRemindersEnabled" />
          </div>

          <div class="toggle-setting" :class="{ disabled: !focusEndEnabled }">
            <div class="toggle-info">
              <span class="toggle-label">提前结束提醒</span>
              <span class="toggle-description">专注即将结束前30秒提醒</span>
            </div>
            <ToggleSwitch v-model="earlyEndReminder" :disabled="!focusEndEnabled" />
          </div>
        </div>
      </div>

      <!-- 声音设置 -->
      <div class="settings-section">
        <h2>声音设置</h2>
        <div class="setting-card">
          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">启用声音</span>
              <span class="toggle-description">为所有通知启用声音效果</span>
            </div>
            <ToggleSwitch v-model="soundsEnabled" @change="handleSoundsEnabledChange" />
          </div>

          <div class="sound-selector" :class="{ disabled: !soundsEnabled }">
            <label>提示音效</label>
            <div class="sound-options">
              <div
                v-for="sound in soundOptions"
                :key="sound.id"
                class="sound-option"
                :class="{ selected: selectedSound === sound.id }"
                @click="selectSound(sound.id)"
              >
                <span class="sound-name">{{ sound.name }}</span>
                <button
                  class="play-sound-btn"
                  @click.stop="playSoundPreview(sound.id)"
                  :disabled="!soundsEnabled"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div class="volume-control" :class="{ disabled: !soundsEnabled }">
            <div class="volume-header">
              <label>音量</label>
              <span class="volume-value">{{ volume }}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="volume"
              @input="handleVolumeChange"
              :disabled="!soundsEnabled"
              class="volume-slider"
            />
          </div>
        </div>
      </div>

      <!-- 其他通知 -->
      <div class="settings-section">
        <h2>其他通知</h2>
        <div class="setting-card">
          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">每周统计报告</span>
              <span class="toggle-description">每周一收到上周专注统计报告</span>
            </div>
            <ToggleSwitch v-model="weeklyReportEnabled" />
          </div>

          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">成就提醒</span>
              <span class="toggle-description">达成新的专注成就时通知</span>
            </div>
            <ToggleSwitch v-model="achievementsEnabled" />
          </div>

          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">应用更新通知</span>
              <span class="toggle-description">有新版本发布时通知</span>
            </div>
            <ToggleSwitch v-model="updatesEnabled" />
          </div>

          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">推送通知</span>
              <span class="toggle-description">在设备通知中心显示通知</span>
            </div>
            <ToggleSwitch v-model="pushNotificationsEnabled" />
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn-reset" @click="resetToDefaults" :disabled="isResetting">
          {{ isResetting ? '重置中...' : '恢复默认设置' }}
        </button>
        <button class="btn-save" @click="saveSettings" :disabled="isSaving">
          {{ isSaving ? '保存中...' : '保存设置' }}
        </button>
      </div>
    </div>

    <!-- 保存成功提示 -->
    <div v-if="showSuccessMessage" class="success-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path
          d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,15H12V17H19V15M19,11H8V13H19V11M19,7H8V9H19V7M7,13H5V11H7V13M7,7V9H5V7H7Z"
        />
      </svg>
      {{ successMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ToggleSwitch from '../components/ToggleSwitch.vue'

const router = useRouter()

// 专注提醒设置
const focusStartEnabled = ref(true)
const focusEndEnabled = ref(true)
const breakRemindersEnabled = ref(true)
const earlyEndReminder = ref(false)

// 声音设置
const soundsEnabled = ref(true)
const volume = ref(80)
const selectedSound = ref('bell')

// 其他通知设置
const weeklyReportEnabled = ref(true)
const achievementsEnabled = ref(true)
const updatesEnabled = ref(true)
const pushNotificationsEnabled = ref(true)

// 状态管理
const isSaving = ref(false)
const isResetting = ref(false)
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 音效选项
const soundOptions = [
  { id: 'bell', name: '铃声' },
  { id: 'chime', name: '钟声' },
  { id: 'soft', name: '轻柔' },
  { id: 'none', name: '无音效' },
]

// 原始设置，用于恢复默认
const defaultSettings = {
  focusStartEnabled: true,
  focusEndEnabled: true,
  breakRemindersEnabled: true,
  earlyEndReminder: false,
  soundsEnabled: true,
  volume: 80,
  selectedSound: 'bell',
  weeklyReportEnabled: true,
  achievementsEnabled: true,
  updatesEnabled: true,
  pushNotificationsEnabled: true,
}

onMounted(() => {
  // 在实际应用中，这里应该从本地存储或API加载设置
  console.log('加载通知设置')
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 处理专注开始提醒变更
const handleFocusStartChange = (enabled: boolean) => {
  focusStartEnabled.value = enabled
  // 可以在这里添加额外的逻辑
}

// 处理专注结束提醒变更
const handleFocusEndChange = (enabled: boolean) => {
  focusEndEnabled.value = enabled
  if (!enabled) {
    earlyEndReminder.value = false
  }
}

// 处理声音启用状态变更
const handleSoundsEnabledChange = (enabled: boolean) => {
  soundsEnabled.value = enabled
}

// 选择音效
const selectSound = (soundId: string) => {
  if (!soundsEnabled.value) return
  selectedSound.value = soundId
}

// 播放音效预览
const playSoundPreview = (soundId: string) => {
  if (!soundsEnabled.value || soundId === 'none') return

  // 在实际应用中，这里应该播放对应的音效
  console.log('播放音效:', soundId)
  showSuccess('预览音效: ' + getSoundNameById(soundId))
}

// 获取音效名称
const getSoundNameById = (soundId: string): string => {
  const sound = soundOptions.find((s) => s.id === soundId)
  return sound ? sound.name : '未知'
}

// 处理音量变更
const handleVolumeChange = () => {
  // 可以在这里添加音量调整的逻辑
  console.log('音量调整为:', volume.value)
}

// 重置为默认设置
const resetToDefaults = () => {
  if (confirm('确定要恢复默认设置吗？')) {
    isResetting.value = true

    // 模拟重置过程
    setTimeout(() => {
      focusStartEnabled.value = defaultSettings.focusStartEnabled
      focusEndEnabled.value = defaultSettings.focusEndEnabled
      breakRemindersEnabled.value = defaultSettings.breakRemindersEnabled
      earlyEndReminder.value = defaultSettings.earlyEndReminder
      soundsEnabled.value = defaultSettings.soundsEnabled
      volume.value = defaultSettings.volume
      selectedSound.value = defaultSettings.selectedSound
      weeklyReportEnabled.value = defaultSettings.weeklyReportEnabled
      achievementsEnabled.value = defaultSettings.achievementsEnabled
      updatesEnabled.value = defaultSettings.updatesEnabled
      pushNotificationsEnabled.value = defaultSettings.pushNotificationsEnabled

      isResetting.value = false
      showSuccess('已恢复默认设置')
    }, 600)
  }
}

// 保存设置
const saveSettings = () => {
  isSaving.value = true

  // 构建设置对象
  const settings = {
    focusStartEnabled: focusStartEnabled.value,
    focusEndEnabled: focusEndEnabled.value,
    breakRemindersEnabled: breakRemindersEnabled.value,
    earlyEndReminder: earlyEndReminder.value,
    soundsEnabled: soundsEnabled.value,
    volume: volume.value,
    selectedSound: selectedSound.value,
    weeklyReportEnabled: weeklyReportEnabled.value,
    achievementsEnabled: achievementsEnabled.value,
    updatesEnabled: updatesEnabled.value,
    pushNotificationsEnabled: pushNotificationsEnabled.value,
  }

  // 在实际应用中，这里应该保存到本地存储或API
  console.log('保存通知设置:', settings)

  // 模拟保存过程
  setTimeout(() => {
    isSaving.value = false
    showSuccess('设置已保存')
  }, 800)
}

// 显示成功消息
const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true

  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}
</script>

<style scoped>
.notifications-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  position: relative;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.back-button {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  margin-right: 16px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: var(--bg-hover);
  transform: translateX(-2px);
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.settings-section {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-section h2 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.setting-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.setting-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.toggle-setting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease;
}

.toggle-setting:last-child {
  border-bottom: none;
}

.toggle-setting:hover:not(.disabled) {
  background-color: rgba(14, 165, 233, 0.03);
}

.toggle-setting.disabled {
  opacity: 0.6;
}

.toggle-info {
  flex: 1;
}

.toggle-label {
  display: block;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.toggle-description {
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
}

.sound-selector {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.sound-selector.disabled,
.volume-control.disabled {
  opacity: 0.6;
}

.sound-selector label,
.volume-control label {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
}

.sound-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sound-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sound-option:hover:not(.sound-selector.disabled .sound-option) {
  border-color: var(--accent-primary);
  background: var(--bg-hover);
}

.sound-option.selected {
  border-color: var(--accent-primary);
  background: rgba(14, 165, 233, 0.1);
}

.sound-name {
  color: var(--text-primary);
  font-size: 15px;
}

.play-sound-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.play-sound-btn:hover:not(:disabled) {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  transform: scale(1.1);
}

.play-sound-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.volume-control {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.volume-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.volume-value {
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
}

.volume-slider {
  width: 100%;
  height: 6px;
  background: var(--border-color);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition: all 0.3s ease;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  background: var(--accent-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.volume-slider::-webkit-slider-thumb:hover:not(:disabled) {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(14, 165, 233, 0.3);
}

.volume-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  background: var(--accent-primary);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.volume-slider::-moz-range-thumb:hover:not(:disabled) {
  transform: scale(1.2);
  box-shadow: 0 3px 10px rgba(14, 165, 233, 0.3);
}

.volume-slider:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 32px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.btn-reset,
.btn-save {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid;
}

.btn-reset {
  background: var(--bg-tertiary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.btn-reset:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--text-secondary);
  transform: translateY(-1px);
}

.btn-save {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.btn-reset:disabled,
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  position: fixed;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: slideUp 0.3s ease;
  z-index: 1000;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

/* 深色模式特定样式 */
:global(.dark-theme) .toggle-setting:hover:not(.disabled) {
  background-color: rgba(14, 165, 233, 0.05);
}

:global(.dark-theme) .sound-option.selected {
  background: rgba(14, 165, 233, 0.15);
}

/* 触摸优化 */
.toggle-setting {
  transition: background-color 0.15s ease;
}

.toggle-setting:active:not(.disabled) {
  background-color: rgba(14, 165, 233, 0.08);
}

.sound-option {
  transition: all 0.2s ease;
}

.sound-option:active:not(.sound-selector.disabled .sound-option) {
  transform: scale(0.98);
}

.play-sound-btn {
  /* 增大点击区域 */
  position: relative;
}

.play-sound-btn::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
}

.play-sound-btn:active:not(:disabled) {
  transform: scale(0.95);
}

/* 音量滑块触摸优化 */
.volume-slider {
  touch-action: none;
}

.volume-slider::-webkit-slider-thumb {
  /* 增大点击区域 */
  box-shadow: 0 0 0 8px transparent;
  transition: box-shadow 0.2s ease;
}

.volume-slider::-webkit-slider-thumb:active {
  box-shadow: 0 0 0 12px rgba(14, 165, 233, 0.2);
}

.volume-slider::-moz-range-thumb {
  /* 增大点击区域 */
  box-shadow: 0 0 0 8px transparent;
  transition: box-shadow 0.2s ease;
}

.volume-slider::-moz-range-thumb:active {
  box-shadow: 0 0 0 12px rgba(14, 165, 233, 0.2);
}

/* 按钮触摸优化 */
.btn-reset,
.btn-save {
  transition: transform 0.2s ease;
}

.btn-reset:active:not(:disabled),
.btn-save:active:not(:disabled) {
  transform: scale(0.98) translateY(-1px);
}

.back-button {
  /* 增大点击区域 */
  position: relative;
}

.back-button::before {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
}

.back-button:active {
  transform: translateX(-2px) scale(0.96);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .notifications-page {
    padding: 16px;
    min-height: calc(100vh - 60px);
  }

  .page-header {
    padding-bottom: 12px;
    margin-bottom: 24px;
  }

  .back-button {
    width: 36px;
    height: 36px;
    margin-right: 12px;
  }

  .back-button svg {
    width: 20px;
    height: 20px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .settings-container {
    gap: 24px;
  }

  .settings-section h2 {
    font-size: 17px;
    margin-bottom: 12px;
  }

  .setting-card {
    padding: 20px 16px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .toggle-setting {
    padding: 14px 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .toggle-info {
    width: 100%;
  }

  .toggle-label {
    font-size: 15px;
    margin-bottom: 2px;
  }

  .toggle-description {
    font-size: 12px;
    line-height: 1.3;
  }

  .sound-selector,
  .volume-control {
    margin-top: 16px;
    padding-top: 16px;
  }

  .sound-selector label,
  .volume-control label {
    margin-bottom: 10px;
  }

  .sound-options {
    gap: 6px;
  }

  .sound-option {
    padding: 10px 14px;
    border-radius: 10px;
  }

  .sound-name {
    font-size: 14px;
  }

  .play-sound-btn {
    width: 30px;
    height: 30px;
  }

  .play-sound-btn svg {
    width: 16px;
    height: 16px;
  }

  .volume-header {
    margin-bottom: 10px;
  }

  .volume-value {
    font-size: 12px;
  }

  .volume-slider {
    height: 5px;
  }

  .volume-slider::-webkit-slider-thumb,
  .volume-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 12px;
    margin-top: 24px;
    padding-top: 24px;
  }

  .btn-reset,
  .btn-save {
    padding: 14px 20px;
    font-size: 16px;
  }

  .success-message {
    left: 16px;
    right: 16px;
    bottom: 16px;
    transform: none;
    text-align: center;
    padding: 12px 16px;
    font-size: 13px;
  }

  .success-message svg {
    width: 18px;
    height: 18px;
  }
}

/* 小屏幕优化 (320px - 480px) */
@media (max-width: 480px) {
  .notifications-page {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  .setting-card {
    padding: 16px 12px;
  }

  .toggle-label {
    font-size: 14px;
  }

  .toggle-description {
    font-size: 11px;
  }
}
</style>
