<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useAchievementsStore } from '@/stores/achievements'

const achievementsStore = useAchievementsStore()

// 加载成就数据
onMounted(() => {
  achievementsStore.loadAchievements()
  achievementsStore.calculateConsecutiveDays()
  achievementsStore.checkAchievements()
})

// 新解锁的成就提示
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const newUnlockedAchievements = ref<string[]>([])
const showNotification = ref(false)
const currentNotification = ref<string>('')

// 监听已解锁成就变化，显示新解锁提示
watch(
  () => achievementsStore.unlockedAchievements.length,
  (newLength, oldLength) => {
    if (newLength > oldLength) {
      const newlyUnlocked = achievementsStore.achievements.filter(
        (ach) => ach.unlocked && !achievementUnlockedBefore(ach.id),
      )
      newlyUnlocked.forEach((ach) => {
        showAchievementNotification(ach.name)
      })
    }
  },
)

// 记录已解锁的成就ID，避免重复提示
const unlockedAchievementIds = ref<string[]>(
  achievementsStore.achievements.filter((ach) => ach.unlocked).map((ach) => ach.id),
)

// 检查成就是否之前已解锁
const achievementUnlockedBefore = (id: string) => {
  return unlockedAchievementIds.value.includes(id)
}

// 显示成就解锁提示
const showAchievementNotification = (achievementName: string) => {
  currentNotification.value = `🎉 恭喜解锁成就：${achievementName}`
  showNotification.value = true

  // 3秒后自动隐藏
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// 分类成就
const achievementCategories = computed(() => {
  return {
    consecutive: achievementsStore.achievements.filter((achievement) =>
      achievement.id.startsWith('consecutive'),
    ),
    totalFocus: achievementsStore.achievements.filter((achievement) =>
      achievement.id.startsWith('totalFocus'),
    ),
  }
})

// 统计信息
const stats = computed(() => {
  return {
    consecutiveDays: achievementsStore.consecutiveDays,
    totalFocusCount: achievementsStore.totalFocusCount,
    unlockedAchievements: achievementsStore.unlockedAchievements.length,
    totalAchievements: achievementsStore.achievements.length,
    completionRate: Math.round(
      (achievementsStore.unlockedAchievements.length / achievementsStore.achievements.length) * 100,
    ),
  }
})

// 计算成就完成百分比
const getProgressPercentage = (achievement: { progress: number; target?: number }) => {
  if (!achievement.target) return 0
  return Math.min((achievement.progress / achievement.target) * 100, 100)
}

// 当前选中的成就详情
const selectedAchievement = ref<any>(null)
const showAchievementDetail = ref(false)

// 显示成就详情
const openAchievementDetail = (achievement: any) => {
  selectedAchievement.value = achievement
  showAchievementDetail.value = true
}

// 关闭成就详情
const closeAchievementDetail = () => {
  showAchievementDetail.value = false
}
</script>

<template>
  <div class="achievements-container">
    <!-- 成就解锁通知 -->
    <div
      v-if="showNotification"
      class="achievement-notification"
      :class="{ show: showNotification }"
    >
      {{ currentNotification }}
    </div>

    <div class="achievements-header">
      <h1>成就系统</h1>

      <!-- 成就完成度 -->
      <div class="completion-rate">
        <div class="completion-circle">
          <div class="circle-background"></div>
          <div
            class="circle-progress"
            :style="{ strokeDashoffset: 2 * Math.PI * 50 * (1 - stats.completionRate / 100) }"
          ></div>
          <div class="circle-text">{{ stats.completionRate }}%</div>
        </div>
        <div class="completion-label">成就完成度</div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.consecutiveDays }}</div>
            <div class="stat-label">连续打卡天数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🍅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalFocusCount }}</div>
            <div class="stat-label">累计番茄数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏆</div>
          <div class="stat-content">
            <div class="stat-value">
              {{ stats.unlockedAchievements }}/{{ stats.totalAchievements }}
            </div>
            <div class="stat-label">已解锁成就</div>
          </div>
        </div>
      </div>
    </div>

    <div class="achievements-main">
      <!-- 连续打卡成就 -->
      <section class="achievement-section">
        <h2>连续打卡成就</h2>
        <div class="achievement-grid">
          <div
            v-for="achievement in achievementCategories.consecutive"
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked }"
            @click="openAchievementDetail(achievement)"
          >
            <div class="achievement-icon">
              {{ achievement.type === 'consecutive' ? '🔥' : '🍅' }}
              <div class="achievement-badge" v-if="achievement.unlocked">✓</div>
            </div>
            <div class="achievement-content">
              <div class="achievement-title">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-progress">
                <div
                  class="progress-bar"
                  :style="{ width: `${getProgressPercentage(achievement)}%` }"
                  :class="{ completed: achievement.progress >= achievement.target }"
                ></div>
                <div class="progress-text">
                  <span v-if="achievement.unlocked" class="unlocked-text">已完成</span>
                  <span v-else>{{ achievement.progress }}/{{ achievement.target }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 累计番茄成就 -->
      <section class="achievement-section">
        <h2>累计番茄成就</h2>
        <div class="achievement-grid">
          <div
            v-for="achievement in achievementCategories.totalFocus"
            :key="achievement.id"
            class="achievement-card"
            :class="{ unlocked: achievement.unlocked }"
            @click="openAchievementDetail(achievement)"
          >
            <div class="achievement-icon">
              {{ achievement.type === 'consecutive' ? '🔥' : '🍅' }}
              <div class="achievement-badge" v-if="achievement.unlocked">✓</div>
            </div>
            <div class="achievement-content">
              <div class="achievement-title">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-progress">
                <div
                  class="progress-bar"
                  :style="{ width: `${getProgressPercentage(achievement)}%` }"
                  :class="{ completed: achievement.progress >= achievement.target }"
                ></div>
                <div class="progress-text">
                  <span v-if="achievement.unlocked" class="unlocked-text">已完成</span>
                  <span v-else>{{ achievement.progress }}/{{ achievement.target }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 成就详情弹窗 -->
    <div
      v-if="showAchievementDetail && selectedAchievement"
      class="achievement-detail-overlay"
      @click="closeAchievementDetail"
    >
      <div class="achievement-detail-modal" @click.stop>
        <div class="detail-header">
          <div class="detail-icon">
            {{ selectedAchievement.type === 'consecutive' ? '🔥' : '🍅' }}
            <div class="achievement-badge" v-if="selectedAchievement.unlocked">✓</div>
          </div>
          <h3 class="detail-title">{{ selectedAchievement.name }}</h3>
          <button class="close-btn" @click="closeAchievementDetail">&times;</button>
        </div>

        <div class="detail-content">
          <p class="detail-description">{{ selectedAchievement.description }}</p>

          <div class="detail-progress">
            <div class="progress-info">
              <span>进度</span>
              <span>
                <span v-if="selectedAchievement.unlocked" class="unlocked-text">已完成</span>
                <span v-else
                  >{{ selectedAchievement.progress }}/{{ selectedAchievement.target }}</span
                >
              </span>
            </div>
            <div class="progress-bar-container">
              <div
                class="progress-bar"
                :style="{ width: `${getProgressPercentage(selectedAchievement)}%` }"
                :class="{ completed: selectedAchievement.progress >= selectedAchievement.target }"
              ></div>
            </div>
          </div>

          <div class="detail-info">
            <div class="info-item">
              <span class="info-label">类型</span>
              <span class="info-value">{{
                selectedAchievement.type === 'consecutive' ? '连续打卡' : '累计番茄'
              }}</span>
            </div>
            <div class="info-item" v-if="selectedAchievement.unlocked">
              <span class="info-label">解锁日期</span>
              <span class="info-value">
                {{
                  selectedAchievement.unlockDate
                    ? new Date(selectedAchievement.unlockDate).toLocaleDateString()
                    : '未知'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式 */
.achievements-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: calc(100vh - 100px);
}

/* 成就解锁通知 */
.achievement-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  z-index: 1000;
  font-weight: 600;
  transform: translateX(400px);
  transition: transform 0.3s ease;
  animation: bounceIn 0.5s ease-out;
}

.achievement-notification.show {
  transform: translateX(0);
}

@keyframes bounceIn {
  0% {
    transform: translateX(400px) scale(0.8);
    opacity: 0;
  }
  60% {
    transform: translateX(-10px) scale(1.05);
    opacity: 1;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

/* 头部样式 */
.achievements-header {
  text-align: center;
  margin-bottom: 40px;
}

.achievements-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 30px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 成就完成度圆形进度条 */
.completion-rate {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.completion-circle {
  width: 120px;
  height: 120px;
  position: relative;
  margin-bottom: 10px;
}

.circle-background,
.circle-progress {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
}

.circle-background {
  background: var(--border-color);
}

.circle-progress {
  background: conic-gradient(
    #667eea 0deg,
    #764ba2 var(--progress-deg),
    var(--border-color) var(--progress-deg)
  );
  clip-path: circle(50% at center);
  transition: background 0.5s ease;
}

.circle-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-color);
}

.completion-label {
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: var(--card-background);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  border-color: var(--accent-color);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--accent-color);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-top: 5px;
}

/* 成就内容区域 */
.achievements-main {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.achievement-section h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 20px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border-color);
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

/* 成就卡片 */
.achievement-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.achievement-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.2);
}

.achievement-card:hover::before {
  opacity: 1;
}

.achievement-card.unlocked {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, var(--card-background) 0%, rgba(102, 126, 234, 0.1) 100%);
  animation: unlockPulse 0.6s ease-out;
}

@keyframes unlockPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
  }
  70% {
    transform: scale(1.02);
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
}

/* 成就图标 */
.achievement-icon {
  font-size: 3rem;
  margin-right: 20px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  position: relative;
  z-index: 1;
}

.achievement-card.unlocked .achievement-icon {
  opacity: 1;
  animation: iconGlow 2s ease-in-out infinite alternate;
}

@keyframes iconGlow {
  from {
    filter: drop-shadow(0 0 5px rgba(102, 126, 234, 0.3));
  }
  to {
    filter: drop-shadow(0 0 15px rgba(102, 126, 234, 0.6));
  }
}

.achievement-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.5);
  animation: badgeBounce 0.5s ease-out;
}

@keyframes badgeBounce {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 成就内容 */
.achievement-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.achievement-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
  transition: color 0.3s ease;
}

.achievement-card.unlocked .achievement-title {
  color: var(--accent-color);
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.4;
}

/* 进度条 */
.achievement-progress {
  width: 100%;
  height: 10px;
  background: var(--border-color);
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
  position: relative;
}

.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-bar.completed {
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
}

.progress-text {
  position: absolute;
  right: 0;
  top: -25px;
  font-size: 0.8rem;
  font-weight: 500;
}

.unlocked-text {
  color: #4ade80;
}

/* 成就详情弹窗 */
.achievement-detail-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.achievement-detail-modal {
  background: var(--card-background);
  border-radius: 16px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-color);
}

.detail-icon {
  font-size: 3rem;
  margin-right: 20px;
  position: relative;
}

.detail-title {
  flex: 1;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: var(--text-primary);
}

.detail-content {
  margin-bottom: 20px;
}

.detail-description {
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 30px;
  line-height: 1.6;
}

.detail-progress {
  margin-bottom: 30px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
  font-weight: 500;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: var(--border-color);
  border-radius: 6px;
  overflow: hidden;
}

.detail-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.info-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .achievements-container {
    padding: 10px;
  }

  .achievements-header h1 {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .achievement-grid {
    grid-template-columns: 1fr;
  }

  .achievement-card {
    flex-direction: column;
    text-align: center;
    cursor: pointer;
  }

  .achievement-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }

  .achievement-detail-modal {
    padding: 20px;
    width: 95%;
  }

  .achievement-notification {
    right: 10px;
    left: 10px;
    transform: translateX(100%);
  }

  .achievement-notification.show {
    transform: translateX(0);
  }
}

@media (max-width: 480px) {
  .achievements-header h1 {
    font-size: 1.8rem;
  }

  .completion-circle {
    width: 100px;
    height: 100px;
  }

  .circle-background,
  .circle-progress {
    width: 100px;
    height: 100px;
  }

  .circle-text {
    font-size: 1.5rem;
  }
}
</style>
