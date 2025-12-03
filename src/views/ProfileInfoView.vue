<template>
  <div class="page profile-info-page">
    <div class="page-header">
      <div class="back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
        </svg>
      </div>
      <h1>个人资料</h1>
      <button class="save-button" @click="saveChanges" :disabled="isSaving">
        {{ isSaving ? '保存中...' : '保存' }}
      </button>
    </div>

    <div class="profile-form">
      <div class="avatar-section">
        <div class="avatar-wrapper">
          <div class="avatar-preview">
            <span class="avatar-text">{{ userName.charAt(0) }}</span>
          </div>
          <div class="avatar-upload-overlay" @click="triggerFileUpload">
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarUpload"
            />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path
                d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M13,15V17H17V19H13V21H11V19H7V17H11V15H13Z"
              />
            </svg>
          </div>
        </div>
        <button class="avatar-upload-btn" @click="triggerFileUpload">更换头像</button>
      </div>

      <form @submit.prevent="saveChanges">
        <div class="form-group" :class="{ 'has-error': errors.userName }">
          <label for="userName">昵称</label>
          <input
            id="userName"
            v-model="userName"
            type="text"
            placeholder="请输入昵称"
            maxlength="20"
          />
          <div v-if="errors.userName" class="error-message">{{ errors.userName }}</div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.userEmail }">
          <label for="userEmail">邮箱</label>
          <input id="userEmail" v-model="userEmail" type="email" placeholder="请输入邮箱" />
          <div v-if="errors.userEmail" class="error-message">{{ errors.userEmail }}</div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.bio }">
          <label for="bio">个人简介</label>
          <textarea
            id="bio"
            v-model="bio"
            placeholder="简单介绍一下自己吧..."
            maxlength="100"
            rows="3"
          ></textarea>
          <div class="char-count">{{ bio.length }}/100</div>
          <div v-if="errors.bio" class="error-message">{{ errors.bio }}</div>
        </div>

        <div class="form-group" :class="{ 'has-error': errors.password }">
          <label for="password">修改密码 <span class="optional">(选填)</span></label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入新密码（留空表示不修改）"
          />
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>
        </div>

        <div class="settings-section">
          <h3>基本设置</h3>
          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">接收通知</span>
              <span class="toggle-description">开启后将收到应用的各类通知</span>
            </div>
            <ToggleSwitch v-model="notificationsEnabled" />
          </div>

          <div class="toggle-setting">
            <div class="toggle-info">
              <span class="toggle-label">声音提醒</span>
              <span class="toggle-description">专注开始/结束时播放提示音</span>
            </div>
            <ToggleSwitch v-model="soundEnabled" />
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="cancelChanges">取消</button>
        </div>
      </form>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ToggleSwitch from '../components/ToggleSwitch.vue'

const router = useRouter()
const fileInput = ref<HTMLInputElement | null>(null)

// 用户资料数据
const userName = ref('专注大师')
const userEmail = ref('user@example.com')
const bio = ref('热爱生活，专注自我提升')
const password = ref('')
const notificationsEnabled = ref(true)
const soundEnabled = ref(true)

// 状态管理
const isSaving = ref(false)
const errors = ref<Record<string, string>>({})
const showSuccessMessage = ref(false)
const successMessage = ref('')

// 原始数据，用于取消修改时恢复
interface UserData {
  userName: string
  userEmail: string
  bio: string
  notificationsEnabled: boolean
  soundEnabled: boolean
}

let originalData: UserData = {
  userName: '',
  userEmail: '',
  bio: '',
  notificationsEnabled: false,
  soundEnabled: false,
}

onMounted(() => {
  // 保存初始数据
  originalData = {
    userName: userName.value,
    userEmail: userEmail.value,
    bio: bio.value,
    notificationsEnabled: notificationsEnabled.value,
    soundEnabled: soundEnabled.value,
  }
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理头像上传
const handleAvatarUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      showError('请上传有效的图片文件（JPG、PNG、GIF）')
      return
    }

    // 验证文件大小（5MB）
    if (file.size > 5 * 1024 * 1024) {
      showError('图片大小不能超过5MB')
      return
    }

    // 模拟上传过程
    isSaving.value = true
    setTimeout(() => {
      isSaving.value = false
      showSuccess('头像上传成功')
      // 在实际应用中，这里应该处理上传后的图片URL
    }, 1000)
  }
}

// 验证表单
const validateForm = (): boolean => {
  errors.value = {}
  let isValid = true

  // 用户名验证
  if (!userName.value.trim()) {
    errors.value.userName = '昵称不能为空'
    isValid = false
  } else if (userName.value.length > 20) {
    errors.value.userName = '昵称不能超过20个字符'
    isValid = false
  }

  // 邮箱验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!userEmail.value.trim()) {
    errors.value.userEmail = '邮箱不能为空'
    isValid = false
  } else if (!emailRegex.test(userEmail.value)) {
    errors.value.userEmail = '请输入有效的邮箱地址'
    isValid = false
  }

  // 简介验证
  if (bio.value.length > 100) {
    errors.value.bio = '个人简介不能超过100个字符'
    isValid = false
  }

  // 密码验证（如果填写了密码）
  if (password.value && password.value.length < 6) {
    errors.value.password = '密码长度至少为6个字符'
    isValid = false
  }

  return isValid
}

// 保存修改
const saveChanges = () => {
  if (!validateForm()) {
    return
  }

  isSaving.value = true

  // 这里应该有保存到后端的逻辑
  const updatedData = {
    userName: userName.value,
    userEmail: userEmail.value,
    bio: bio.value,
    password: password.value || undefined,
    notificationsEnabled: notificationsEnabled.value,
    soundEnabled: soundEnabled.value,
  }

  console.log('保存用户资料:', updatedData)

  // 模拟API请求
  setTimeout(() => {
    isSaving.value = false
    showSuccess('个人资料已更新')

    // 更新原始数据
    originalData = {
      userName: userName.value,
      userEmail: userEmail.value,
      bio: bio.value,
      notificationsEnabled: notificationsEnabled.value,
      soundEnabled: soundEnabled.value,
    }

    // 清空密码字段
    password.value = ''
  }, 800)
}

// 取消修改
const cancelChanges = () => {
  // 恢复原始数据
  userName.value = originalData.userName
  userEmail.value = originalData.userEmail
  bio.value = originalData.bio
  notificationsEnabled.value = originalData.notificationsEnabled
  soundEnabled.value = originalData.soundEnabled
  password.value = ''

  // 清除错误信息
  errors.value = {}

  router.back()
}

// 显示成功消息
const showSuccess = (message: string) => {
  successMessage.value = message
  showSuccessMessage.value = true

  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

// 显示错误消息
const showError = (message: string) => {
  errors.value.general = message

  // 5秒后清除错误消息
  setTimeout(() => {
    delete errors.value.general
  }, 5000)
}
</script>

<style scoped>
.profile-info-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  position: relative;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
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

.save-button {
  padding: 10px 20px;
  background: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-button:hover:not(:disabled) {
  background: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.save-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-form {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.profile-form:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.12);
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 48px;
  font-weight: 700;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover .avatar-preview {
  transform: scale(1.03);
}

.avatar-upload-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border: 3px solid var(--bg-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.avatar-upload-overlay:hover {
  background: var(--accent-secondary);
  transform: scale(1.1);
}

.avatar-upload-btn {
  background: var(--bg-tertiary);
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  padding: 8px 20px;
  color: var(--accent-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-upload-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.form-group {
  margin-bottom: 24px;
  position: relative;
}

.form-group.has-error input,
.form-group.has-error textarea {
  border-color: #ef4444;
}

.form-group.has-error input:focus,
.form-group.has-error textarea:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.optional {
  color: var(--text-secondary);
  font-weight: 400;
  font-size: 13px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 16px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.char-count {
  position: absolute;
  right: 12px;
  bottom: -20px;
  font-size: 12px;
  color: var(--text-secondary);
}

.error-message {
  margin-top: 4px;
  font-size: 12px;
  color: #ef4444;
  line-height: 1.4;
}

.settings-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
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

.toggle-setting:hover {
  background-color: rgba(14, 165, 233, 0.03);
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

/* ToggleSwitch组件样式已在组件内部定义 */

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.btn-cancel {
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-cancel:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
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
:global(.dark-theme) .toggle-setting:hover {
  background-color: rgba(14, 165, 233, 0.05);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .profile-info-page {
    padding: 16px;
  }

  .page-header {
    padding-bottom: 12px;
  }

  .page-header h1 {
    font-size: 20px;
  }

  .save-button {
    padding: 8px 16px;
    font-size: 13px;
  }

  .profile-form {
    padding: 20px;
    border-radius: 16px;
  }

  .avatar-preview {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel {
    width: 100%;
  }

  .success-message {
    left: 20px;
    right: 20px;
    bottom: 20px;
    transform: none;
    text-align: center;
  }

  .toggle-setting {
    padding: 14px 0;
  }
}
</style>
