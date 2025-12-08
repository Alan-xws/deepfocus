<script setup lang="ts">
import { ref } from 'vue'
import CommentCard from './CommentCard.vue'

interface Comment {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  date: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

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
  comments?: Comment[]
}>()

const emit = defineEmits<{
  (e: 'toggle-like', postId: string): void
  (e: 'toggle-comments', postId: string): void
  (e: 'add-comment', postId: string, content: string): void
  (e: 'toggle-comment-like', commentId: string): void
  (e: 'reply-to-comment', commentId: string): void
  (e: 'add-reply', postId: string, commentId: string, content: string): void
}>()

const isCommentsOpen = ref(false)
const newComment = ref('')
const isCommenting = ref(false)

const handleLike = () => {
  emit('toggle-like', props.post.id)
}

const toggleComments = () => {
  isCommentsOpen.value = !isCommentsOpen.value
  emit('toggle-comments', props.post.id)
}

const handleAddComment = () => {
  if (newComment.value.trim()) {
    isCommenting.value = true
    emit('add-comment', props.post.id, newComment.value.trim())
    newComment.value = ''
    setTimeout(() => {
      isCommenting.value = false
    }, 300)
  }
}

const handleAddReply = (commentId: string, content: string) => {
  emit('add-reply', props.post.id, commentId, content)
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
      <button class="action-btn like-btn" @click="handleLike" :class="{ liked: post.isLiked }">
        <span class="action-icon">❤️</span>
        <span class="action-text">{{ post.likes }}</span>
      </button>
      <button
        class="action-btn comment-btn"
        @click="toggleComments"
        :class="{ active: isCommentsOpen }"
      >
        <span class="action-icon">💬</span>
        <span class="action-text">{{ post.comments }}</span>
      </button>
      <button class="action-btn share-btn">
        <span class="action-icon">🔄</span>
        <span class="action-text">分享</span>
      </button>
    </div>

    <!-- 评论区域 -->
    <div v-if="isCommentsOpen" class="comments-section">
      <!-- 评论输入框 -->
      <div class="comment-input-section">
        <img
          src="https://ui-avatars.com/api/?name=User&background=random"
          alt="当前用户头像"
          class="current-user-avatar"
        />
        <div class="comment-input-container">
          <textarea
            v-model="newComment"
            class="comment-input"
            placeholder="写下你的评论..."
            rows="2"
            @keyup.enter.ctrl="handleAddComment"
          ></textarea>
          <button
            class="submit-comment-btn"
            @click="handleAddComment"
            :disabled="!newComment.trim() || isCommenting"
          >
            {{ isCommenting ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-if="props.comments && props.comments.length > 0" class="comments-header">
          <h4 class="comments-title">全部评论 ({{ props.comments.length }})</h4>
        </div>

        <div v-if="props.comments && props.comments.length > 0">
          <CommentCard
            v-for="comment in props.comments"
            :key="comment.id"
            :comment="comment"
            @toggle-like="(commentId) => emit('toggle-comment-like', commentId)"
            @reply="(commentId) => emit('reply-to-comment', commentId)"
            @add-reply="handleAddReply"
          />
        </div>

        <div v-else class="no-comments">
          <p>暂无评论，快来抢沙发吧！</p>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.share-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.share-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.share-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
}

.share-card:hover::before {
  transform: scaleX(1);
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
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 浅色主题适配 */
:global(.light-theme) .user-avatar {
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.post-date {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 400;
}

.card-content {
  margin-bottom: 16px;
}

.post-content {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text-primary);
  margin-bottom: 16px;
  white-space: pre-wrap;
  transition: color 0.3s ease;
}

.share-card:hover .post-content {
  color: var(--text-hover);
}

.focus-duration {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  padding: 8px 16px;
  border-radius: 20px;
  width: fit-content;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.focus-duration:hover {
  background: rgba(16, 185, 129, 0.25);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.2);
}

/* 浅色主题适配 */
:global(.light-theme) .focus-duration {
  background: rgba(16, 185, 129, 0.08);
}

:global(.light-theme) .focus-duration:hover {
  background: rgba(16, 185, 129, 0.15);
}

:global(.light-theme) .share-card {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

:global(.light-theme) .share-card:hover {
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
}

:global(.light-theme) .post-image-container {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

:global(.light-theme) .post-image-container:hover {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
}

/* 帖子图片样式 */
.post-image-container {
  margin: 16px 0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

.post-image-container:hover {
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.3);
}

.post-image {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.post-image-container:hover .post-image {
  transform: scale(1.05);
}

.post-image-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.05), transparent);
  pointer-events: none;
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
  gap: 28px;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: border-color 0.3s ease;
}

.share-card:hover .card-actions {
  border-top-color: var(--border-hover);
}

/* 浅色主题适配 */
:global(.light-theme) .card-actions {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 10px 0;
  position: relative;
}

.action-btn::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--accent-primary);
  transform: translateX(-50%);
  transition: width 0.3s ease;
}

.action-btn:hover {
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-btn:hover::before {
  width: 100%;
}

.action-btn:active {
  transform: translateY(0);
}

.action-icon {
  font-size: 18px;
  transition: transform 0.3s ease;
}

.action-text {
  font-size: 13px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.action-btn:hover .action-icon {
  transform: scale(1.2);
}

.like-btn.liked {
  color: var(--danger-color);
}

.like-btn.liked .action-icon {
  animation: heartBeat 0.5s ease;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.3);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
}

.like-btn.liked::before {
  background: var(--danger-color);
}

/* 评论区域样式 */
.comments-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

/* 评论输入区域 */
.comment-input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.current-user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--bg-primary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comment-input {
  width: 100%;
  min-height: 60px;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 14px;
  resize: vertical;
  transition: all 0.2s ease;
}

.comment-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.submit-comment-btn {
  align-self: flex-end;
  padding: 8px 16px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-comment-btn:hover {
  background-color: var(--accent-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(33, 150, 243, 0.2);
}

.submit-comment-btn:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comments-header {
  margin-bottom: 4px;
}

.comments-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.no-comments {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-secondary);
  font-size: 14px;
  background-color: var(--bg-primary);
  border-radius: 12px;
  border: 1px dashed var(--border-color);
}

/* 浅色主题适配 */
:global(.light-theme) .comment-input {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .no-comments {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
}
</style>
