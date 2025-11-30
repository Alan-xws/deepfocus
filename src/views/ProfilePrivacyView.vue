<template>
  <div class="page profile-privacy-page">
    <div class="page-header">
      <div class="back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
      </div>
      <h1>隐私设置</h1>
    </div>

    <div class="settings-container">
      <div class="settings-section">
        <h2>数据收集</h2>
        <div class="setting-item">
          <div class="setting-info">
            <h3>使用统计</h3>
            <p>允许收集匿名使用数据以改进应用体验</p>
          </div>
          <toggle-switch v-model="usageAnalytics" />
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h3>崩溃报告</h3>
            <p>允许收集应用崩溃信息以改进稳定性</p>
          </div>
          <toggle-switch v-model="crashReports" />
        </div>
      </div>

      <div class="settings-section">
        <h2>数据导出</h2>
        <p class="section-description">导出您在应用中创建的所有数据，包括专注记录和设置。</p>
        <button class="export-btn" @click="exportData">导出我的数据</button>
      </div>

      <div class="settings-section">
        <h2>数据清理</h2>
        <div class="cleanup-options">
          <div class="cleanup-item">
            <h3>清除专注记录</h3>
            <p>删除所有专注历史记录</p>
            <button class="cleanup-btn warning" @click="clearFocusRecords">清除记录</button>
          </div>

          <div class="cleanup-item">
            <h3>清除统计数据</h3>
            <p>重置所有统计数据但保留历史记录</p>
            <button class="cleanup-btn warning" @click="clearStatistics">重置统计</button>
          </div>
        </div>
      </div>

      <div class="settings-section danger">
        <h2>账户管理</h2>
        <p class="section-description">请注意，以下操作无法撤销！</p>

        <div class="account-actions">
          <div class="action-item">
            <h3>暂停账户</h3>
            <p>临时暂停账户，可随时恢复</p>
            <button class="account-btn warning" @click="suspendAccount">暂停账户</button>
          </div>

          <div class="action-item">
            <h3>删除账户</h3>
            <p>永久删除您的账户和所有相关数据</p>
            <button class="account-btn danger" @click="deleteAccount">删除账户</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 隐私设置状态
const usageAnalytics = ref(true)
const crashReports = ref(true)

onMounted(() => {
  // 从本地存储加载设置
  loadSettings()
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 加载设置
const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('privacySettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      usageAnalytics.value = parsed.usageAnalytics
      crashReports.value = parsed.crashReports
    }
  } catch (error) {
    console.error('加载隐私设置失败:', error)
  }
}

// 保存设置（自动保存）
const saveSettings = () => {
  const settings = {
    usageAnalytics: usageAnalytics.value,
    crashReports: crashReports.value,
  }

  try {
    localStorage.setItem('privacySettings', JSON.stringify(settings))
  } catch (error) {
    console.error('保存隐私设置失败:', error)
  }
}

// 监听设置变化，自动保存
watchEffect(() => {
  saveSettings()
})

// 导出数据
const exportData = () => {
  // 这里应该有实际的数据导出逻辑
  console.log('导出用户数据')

  // 模拟导出过程
  alert('您的数据导出请求已处理，导出文件将很快准备好。')
}

// 清除专注记录
const clearFocusRecords = () => {
  if (confirm('确定要清除所有专注记录吗？此操作无法撤销。')) {
    console.log('清除专注记录')
    alert('专注记录已清除')
  }
}

// 清除统计数据
const clearStatistics = () => {
  if (confirm('确定要重置所有统计数据吗？此操作无法撤销。')) {
    console.log('重置统计数据')
    alert('统计数据已重置')
  }
}

// 暂停账户
const suspendAccount = () => {
  if (confirm('确定要暂停您的账户吗？您可以随时恢复账户使用。')) {
    console.log('暂停账户')
    alert('您的账户已暂停')
    // 这里应该有实际的暂停账户逻辑
    router.push('/login')
  }
}

// 删除账户
const deleteAccount = () => {
  const confirmText = 'ARE YOU SURE'
  const userInput = prompt('此操作将永久删除您的账户和所有数据！\n请输入 "ARE YOU SURE" 确认删除：')

  if (userInput === confirmText) {
    if (confirm('最后确认：此操作无法撤销，您的数据将被永久删除！')) {
      console.log('删除账户')
      alert('您的账户删除请求已提交，将在24小时内处理完毕。')
      // 这里应该有实际的删除账户逻辑
      router.push('/login')
    }
  } else {
    alert('账户删除已取消')
  }
}
</script>

<style scoped>
.profile-privacy-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
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
  gap: 30px;
}

.settings-section {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.settings-section.danger {
  border: 1px solid rgba(239, 68, 68, 0.2);
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.05), var(--bg-secondary));
}

.settings-section h2 {
  margin: 0 0 16px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.section-description {
  margin: 0 0 20px 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20px;
}

.setting-info h3 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.setting-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.export-btn {
  width: 100%;
  padding: 14px;
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.cleanup-options,
.account-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cleanup-item,
.action-item {
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 16px;
  border: 1px solid var(--border-color);
}

.cleanup-item h3,
.action-item h3 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 500;
}

.cleanup-item p,
.action-item p {
  margin: 0 0 16px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.cleanup-btn,
.account-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.cleanup-btn.warning,
.account-btn.warning {
  background: var(--warning-color, #f59e0b);
  color: white;
}

.cleanup-btn.warning:hover,
.account-btn.warning:hover {
  background: var(--warning-dark, #d97706);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.account-btn.danger {
  background: var(--danger-color, #ef4444);
  color: white;
}

.account-btn.danger:hover {
  background: var(--danger-dark, #dc2626);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .profile-privacy-page {
    padding: 16px;
    min-height: calc(100vh - 60px);
  }

  .page-header {
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

  .settings-section {
    padding: 20px 16px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  }

  .settings-section h2 {
    font-size: 17px;
    margin-bottom: 12px;
  }

  .section-description {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    padding: 14px 0;
    gap: 8px;
  }

  .setting-info {
    margin-right: 0;
    margin-bottom: 8px;
  }

  .setting-info h3 {
    font-size: 15px;
    margin-bottom: 4px;
  }

  .setting-info p {
    font-size: 13px;
    line-height: 1.4;
  }

  .export-btn {
    padding: 12px 16px;
    font-size: 15px;
    width: 100%;
  }

  .cleanup-options,
  .account-actions {
    gap: 16px;
  }

  .cleanup-item,
  .action-item {
    padding: 16px;
    border-radius: 14px;
  }

  .cleanup-item h3,
  .action-item h3 {
    font-size: 15px;
    margin-bottom: 6px;
  }

  .cleanup-item p,
  .action-item p {
    font-size: 13px;
    margin-bottom: 14px;
  }

  .cleanup-btn,
  .account-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* 小屏幕优化 (320px - 480px) */
@media (max-width: 480px) {
  .profile-privacy-page {
    padding: 12px;
  }

  .page-header h1 {
    font-size: 18px;
  }

  .settings-section {
    padding: 16px 12px;
  }

  .settings-section h2 {
    font-size: 16px;
  }

  .setting-info h3,
  .cleanup-item h3,
  .action-item h3 {
    font-size: 14px;
  }

  .setting-info p,
  .section-description,
  .cleanup-item p,
  .action-item p {
    font-size: 12px;
  }

  .cleanup-item,
  .action-item {
    padding: 14px;
  }
}

/* 触摸优化 - 全局应用 */
.setting-item,
.cleanup-item,
.action-item {
  transition: all 0.2s ease;
}

.setting-item:active,
.cleanup-item:active,
.action-item:active {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(0.99);
}

/* 按钮触摸优化 */
.export-btn,
.cleanup-btn,
.account-btn {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.export-btn:active:not(:disabled),
.cleanup-btn:active:not(:disabled),
.account-btn:active:not(:disabled) {
  transform: scale(0.98) translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* 后退按钮触摸优化 */
.back-button {
  transition: transform 0.2s ease;
}

.back-button:active {
  transform: translateX(-2px) scale(0.96);
}

/* 开关触摸优化 */
.toggle-switch {
  /* 增大点击区域 */
  position: relative;
}

.toggle-switch::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
}

/* 输入框触摸优化 */
input[type='text'],
input[type='email'],
textarea {
  transition: border-color 0.2s ease;
}

input[type='text']:focus,
input[type='email']:focus,
textarea:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
}

/* 防止iOS双击放大 */
@media (max-width: 768px) {
  button,
  a,
  input,
  textarea,
  select,
  .toggle-switch {
    touch-action: manipulation;
  }
}
</style>
