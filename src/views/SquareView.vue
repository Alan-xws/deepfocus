<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ShareCard from '../components/ShareCard.vue'
import { useSquareStore } from '@/stores/square'

const squareStore = useSquareStore()
const showShareModal = ref(false)
const isSubmitting = ref(false)
const error = ref('')
const newPostContent = ref('')
const newPostDuration = ref(0)
const newPostImage = ref<string | null>(null)
const isUploading = ref(false)

// 初始化时获取帖子列表
onMounted(() => {
  squareStore.fetchPosts()
})

// 切换点赞状态
const toggleLike = (postId: string) => {
  squareStore.toggleLike(postId)
}

// 打开分享模态框
const openShareModal = () => {
  showShareModal.value = true
  newPostContent.value = ''
  newPostDuration.value = 0
  newPostImage.value = null
  error.value = ''
}

// 关闭分享模态框
const closeShareModal = () => {
  showShareModal.value = false
  newPostImage.value = null
}

// 处理图片选择
const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]

    // 检查文件大小 (限制为2MB)
    if (file.size > 2 * 1024 * 1024) {
      error.value = '图片大小不能超过2MB'
      return
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      error.value = '请选择图片文件'
      return
    }

    // 读取文件并显示预览
    isUploading.value = true
    error.value = ''

    const reader = new FileReader()
    reader.onload = (e) => {
      newPostImage.value = e.target?.result as string
      isUploading.value = false
    }
    reader.onerror = () => {
      error.value = '图片读取失败'
      isUploading.value = false
    }
    reader.readAsDataURL(file)
  }
}

// 移除已选择的图片
const removeImage = () => {
  newPostImage.value = null
}

// 提交分享
const submitShare = async () => {
  // 表单验证
  if (!newPostContent.value.trim()) {
    error.value = '分享内容不能为空'
    return
  }

  if (newPostDuration.value <= 0) {
    error.value = '专注时长必须大于0'
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    await squareStore.createPost({
      content: newPostContent.value,
      duration: newPostDuration.value,
      image: newPostImage.value || undefined,
    })

    // 关闭模态框
    closeShareModal()
  } catch {
    error.value = squareStore.error || '发布失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="square-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration bg-decoration-1"></div>
    <div class="bg-decoration bg-decoration-2"></div>

    <div class="square-header">
      <h1>专注广场</h1>
      <p>分享你的专注时刻，与他人一起成长</p>
    </div>

    <div class="share-section">
      <div class="share-card">
        <div class="share-input-container">
          <textarea
            placeholder="分享你的专注心得..."
            class="share-textarea"
            rows="3"
            @click="openShareModal"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="posts-section">
      <div class="posts-header">
        <h2>最新分享</h2>
      </div>

      <!-- 加载状态 -->
      <div v-if="squareStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="squareStore.error" class="error-state">
        <p>{{ squareStore.error }}</p>
        <button @click="squareStore.fetchPosts" class="retry-btn">重试</button>
      </div>

      <!-- 空状态 -->
      <div v-else-if="squareStore.sortedPosts.length === 0" class="empty-state">
        <p>广场还没有分享内容，快来发布第一条吧！</p>
      </div>

      <!-- 帖子列表 -->
      <div v-else class="posts-list">
        <ShareCard
          v-for="post in squareStore.sortedPosts"
          :key="post.id"
          :post="post"
          @toggle-like="toggleLike"
        />
      </div>
    </div>

    <!-- 分享模态框 -->
    <div v-if="showShareModal" class="modal-overlay" @click="closeShareModal">
      <div class="share-modal" @click.stop>
        <div class="modal-header">
          <h3>分享你的专注时刻</h3>
          <button class="close-btn" @click="closeShareModal">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label for="share-content">分享内容</label>
            <textarea
              id="share-content"
              v-model="newPostContent"
              placeholder="分享你的专注体验、感悟或技巧..."
              rows="4"
              :disabled="isSubmitting"
              class="share-textarea"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="focus-duration">专注时长（分钟）</label>
            <input
              id="focus-duration"
              type="number"
              v-model.number="newPostDuration"
              min="1"
              placeholder="请输入专注时长"
              :disabled="isSubmitting"
              class="duration-input"
            />
          </div>

          <div class="form-group">
            <label>添加图片（可选）</label>
            <div class="image-upload-section">
              <!-- 图片预览区域 -->
              <div v-if="newPostImage" class="image-preview-container">
                <img :src="newPostImage" alt="预览" class="image-preview" />
                <button
                  class="remove-image-btn"
                  @click="removeImage"
                  :disabled="isSubmitting || isUploading"
                >
                  ×
                </button>
              </div>

              <!-- 图片上传区域 -->
              <div v-else class="image-upload-container">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  @change="handleImageChange"
                  :disabled="isSubmitting || isUploading"
                  class="image-upload-input"
                />
                <label
                  for="image-upload"
                  class="image-upload-label"
                  :class="{ disabled: isSubmitting || isUploading }"
                >
                  <div class="upload-icon">📷</div>
                  <div class="upload-text">点击上传图片</div>
                  <div class="upload-hint">支持 JPG、PNG 格式，最大 2MB</div>
                </label>
              </div>

              <!-- 上传中状态 -->
              <div v-if="isUploading" class="uploading-indicator">
                <div class="loading-spinner small"></div>
                <span>上传中...</span>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="closeShareModal" :disabled="isSubmitting">取消</button>
          <button
            class="share-btn"
            @click="submitShare"
            :disabled="isSubmitting || !newPostContent.trim() || !newPostDuration"
          >
            <span v-if="isSubmitting">发布中...</span>
            <span v-else>发布</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 现有的样式保持不变 */
.square-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background-color: var(--bg-primary);
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.square-header {
  text-align: center;
  margin-bottom: 30px;
}

.square-header h1 {
  font-size: 2rem;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.square-header p {
  font-size: 1rem;
  color: var(--text-secondary);
}

.share-section {
  margin-bottom: 30px;
}

.share-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.share-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.share-input-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.share-textarea {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  resize: vertical;
  box-sizing: border-box;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.share-textarea:focus {
  outline: none;
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}

.posts-section {
  margin-bottom: 40px;
}

.posts-header {
  margin-bottom: 20px;
}

.posts-header h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.15;
  z-index: -1;
  transition: all 0.5s ease;
}

.bg-decoration-1 {
  width: 600px;
  height: 600px;
  background: var(--accent-primary);
  top: -150px;
  left: -150px;
}

.bg-decoration-2 {
  width: 500px;
  height: 500px;
  background: var(--accent-secondary);
  bottom: -200px;
  right: -150px;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 16px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 20px;
  height: 20px;
  margin: 0;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--danger-color);
}

.retry-btn {
  margin-top: 16px;
  padding: 8px 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
}

/* 分享模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.share-modal {
  background: var(--bg-secondary);
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.duration-input {
  flex: 1;
  max-width: 200px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  box-sizing: border-box;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}

.duration-input:focus {
  outline: none;
  border-color: rgba(14, 165, 233, 0.5);
  box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
}

.duration-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: var(--danger-color);
  font-size: 12px;
  margin-top: 8px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-cancel,
.share-btn {
  padding: 10px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.btn-cancel:hover:not(:disabled) {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
}

.share-btn {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: white;
}

.share-btn:hover:not(:disabled) {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  transform: translateY(-1px);
}

.btn-cancel:disabled,
.share-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 图片上传相关样式 */
.image-upload-section {
  margin-top: 8px;
}

.image-upload-container {
  position: relative;
  width: 100%;
  height: 120px;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.02);
}

.image-upload-container:hover:not(.disabled) {
  border-color: rgba(14, 165, 233, 0.5);
  background: rgba(14, 165, 233, 0.05);
}

.image-upload-container.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-upload-input {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.image-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 14px;
  text-align: center;
  pointer-events: none;
}

.upload-icon {
  font-size: 32px;
}

.upload-text {
  font-weight: 500;
  color: var(--text-primary);
}

.upload-hint {
  font-size: 12px;
  color: var(--text-tertiary);
}

.image-preview-container {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-preview {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  display: block;
}

.remove-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: 20px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.remove-image-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.8);
  transform: scale(1.1);
}

.remove-image-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.uploading-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .square-container {
    padding: 16px;
  }

  .share-card {
    padding: 16px;
  }

  .modal-overlay {
    padding: 20px;
  }

  .share-modal {
    width: 100%;
    max-width: none;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
}
</style>
