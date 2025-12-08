<script setup lang="ts">
import { ref } from 'vue'

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
  isReplyingTo?: string
}

const props = defineProps<{
  comment: Comment
  isReplying?: boolean
}>()

const emit = defineEmits<{
  (e: 'toggle-like', commentId: string): void
  (e: 'reply', commentId: string): void
  (e: 'add-reply', commentId: string, content: string): void
}>()

const handleLike = () => {
  emit('toggle-like', props.comment.id)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleReply = () => {
  emit('reply', props.comment.id)
}

// 回复相关状态
const showReplyInput = ref(false)
const replyContent = ref('')
// eslint-disable-next-line vue/no-dupe-keys
const isReplying = ref(false)

const toggleReplyInput = () => {
  showReplyInput.value = !showReplyInput.value
  if (showReplyInput.value) {
    setTimeout(() => {
      const textarea = document.querySelector(
        `#reply-input-${props.comment.id}`,
      ) as HTMLTextAreaElement
      textarea?.focus()
    }, 100)
  }
}

const handleAddReply = () => {
  if (replyContent.value.trim()) {
    isReplying.value = true
    emit('add-reply', props.comment.id, replyContent.value.trim())
    replyContent.value = ''
    showReplyInput.value = false
    setTimeout(() => {
      isReplying.value = false
    }, 300)
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return '刚刚'
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}小时前`
  } else if (diffInSeconds < 604800) {
    return `${Math.floor(diffInSeconds / 86400)}天前`
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}
</script>

<template>
  <div class="comment-card">
    <div class="comment-header">
      <div class="user-info">
        <img :src="comment.avatar" alt="用户头像" class="user-avatar" />
        <div class="user-details">
          <h4 class="username">{{ comment.username }}</h4>
          <p class="comment-date">{{ formatDate(comment.date) }}</p>
        </div>
      </div>
    </div>

    <div class="comment-content">
      <p>{{ comment.content }}</p>
    </div>

    <div class="comment-actions">
      <button class="action-btn like-btn" @click="handleLike" :class="{ liked: comment.isLiked }">
        <span class="action-icon">❤️</span>
        <span class="action-text">{{ comment.likes || 0 }}</span>
      </button>
      <button
        class="action-btn reply-btn"
        @click="toggleReplyInput"
        :class="{ active: showReplyInput }"
      >
        <span class="action-icon">💬</span>
        <span class="action-text">{{ showReplyInput ? '取消' : '回复' }}</span>
      </button>
    </div>

    <!-- 回复输入框 -->
    <div v-if="showReplyInput" class="reply-input-section">
      <img
        src="https://ui-avatars.com/api/?name=User&background=random"
        alt="当前用户头像"
        class="current-user-avatar"
      />
      <div class="reply-input-container">
        <textarea
          :id="`reply-input-${comment.id}`"
          v-model="replyContent"
          class="reply-input"
          placeholder="写下你的回复..."
          rows="2"
          @keyup.enter.ctrl="handleAddReply"
        ></textarea>
        <button
          class="submit-reply-btn"
          @click="handleAddReply"
          :disabled="!replyContent.trim() || isReplying"
        >
          {{ isReplying ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>

    <!-- 评论回复 -->
    <div v-if="comment.replies && comment.replies.length > 0" class="comment-replies">
      <CommentCard
        v-for="reply in comment.replies"
        :key="reply.id"
        :comment="reply"
        @toggle-like="(commentId) => emit('toggle-like', commentId)"
        @reply="(commentId) => emit('reply', commentId)"
      />
    </div>
  </div>
</template>

<style scoped>
.comment-card {
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
}

.comment-card:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
}

.comment-header {
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

/* 浅色主题适配 */
:global(.light-theme) .user-avatar {
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.username {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.comment-date {
  font-size: 11px;
  color: var(--text-secondary);
  margin: 0;
}

.comment-content {
  margin-bottom: 12px;
}

.comment-content p {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-primary);
  margin: 0;
  word-break: break-word;
}

.comment-actions {
  display: flex;
  gap: 24px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 6px 0;
}

.action-btn:hover {
  color: var(--accent-primary);
}

.action-icon {
  font-size: 14px;
}

.action-text {
  font-size: 11px;
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

/* 回复样式 */
.comment-replies {
  margin-left: 40px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

/* 回复输入区域 */
.reply-input-section {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--border-color);
}

.current-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  margin-top: 4px;
}

.reply-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reply-input {
  width: 100%;
  min-height: 50px;
  padding: 10px 14px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  resize: vertical;
  transition: all 0.2s ease;
}

.reply-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.submit-reply-btn {
  align-self: flex-end;
  padding: 6px 14px;
  background-color: var(--accent-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-reply-btn:hover:not(:disabled) {
  background-color: var(--accent-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(33, 150, 243, 0.2);
}

.submit-reply-btn:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 回复标记 */
.comment-content .reply-to {
  color: var(--accent-primary);
  font-weight: 500;
}

/* 浅色主题适配 */
:global(.light-theme) .reply-input {
  background-color: rgba(255, 255, 255, 0.8);
  border-color: rgba(0, 0, 0, 0.1);
}

:global(.light-theme) .submit-reply-btn {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 浅色主题适配 */
:global(.light-theme) .comment-card {
  background: var(--bg-tertiary);
}

:global(.light-theme) .comment-card:hover {
  background: var(--bg-hover);
}

:global(.light-theme) .comment-actions {
  border-top-color: var(--border-color);
}

:global(.light-theme) .comment-replies {
  border-top-color: var(--border-color);
}
</style>
