<script setup lang="ts">
interface SharePost {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  duration: number
  date: string
  likes: number
  comments: number
  isLiked: boolean
  image?: string
}

const props = defineProps<{
  post: SharePost
}>()

const emit = defineEmits<{
  (e: 'toggle-like', postId: string): void
}>()

const handleLike = () => {
  emit('toggle-like', props.post.id)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return '今天'
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}
</script>

<template>
  <div class="share-card">
    <div class="card-header">
      <div class="user-info">
        <img :src="post.avatar" alt="用户头像" class="user-avatar" />
        <div class="user-details">
          <h3 class="username">{{ post.username }}</h3>
          <p class="post-date">{{ formatDate(post.date) }}</p>
        </div>
      </div>
    </div>

    <div class="card-content">
      <p class="post-content">{{ post.content }}</p>
      
      <!-- 图片显示区域 -->
      <div v-if="post.image" class="post-image-container">
        <img :src="post.image" :alt="post.content" class="post-image" loading="lazy" />
      </div>
      
      <div class="focus-duration">
        <span class="duration-icon">⏱️</span>
        <span class="duration-text">专注时长: {{ post.duration }} 分钟</span>
      </div>
    </div>

    <div class="card-actions">
      <button 
        class="action-btn like-btn" 
        @click="handleLike"
        :class="{ 'liked': post.isLiked }"
      >
        <span class="action-icon">❤️</span>
        <span class="action-text">{{ post.likes }}</span>
      </button>
      <button class="action-btn comment-btn">
        <span class="action-icon">💬</span>
        <span class="action-text">{{ post.comments }}</span>
      </button>
      <button class="action-btn share-btn">
        <span class="action-icon">🔄</span>
        <span class="action-text">分享</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.share-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.share-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.post-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
}

.card-content {
  margin-bottom: 16px;
}

.post-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin-bottom: 12px;
  white-space: pre-wrap;
}

.focus-duration {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 16px;
  width: fit-content;
}

/* 帖子图片样式 */
.post-image-container {
  margin: 12px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.post-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.post-image:hover {
  transform: scale(1.02);
}

.duration-icon {
  font-size: 14px;
}

.duration-text {
  font-size: 12px;
  color: var(--success-color);
  font-weight: 500;
}

.card-actions {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px 0;
}

.action-btn:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.action-icon {
  font-size: 16px;
}

.action-text {
  font-size: 13px;
}

.like-btn.liked {
  color: var(--danger-color);
}

.like-btn.liked .action-icon {
  animation: heartBeat 0.3s ease;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
</style>