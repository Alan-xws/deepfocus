<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAchievementsStore } from '@/stores/achievements'

const achievementsStore = useAchievementsStore()

// 加载成就数据
onMounted(() => {
  achievementsStore.loadAchievements()
  achievementsStore.calculateConsecutiveDays()
  achievementsStore.checkAchievements()
})

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
  }
})

// 计算成就完成百分比
const getProgressPercentage = (achievement: { progress: number; target?: number }) => {
  if (!achievement.target) return 0
  return Math.min((achievement.progress / achievement.target) * 100, 100)
}
</script>

<template>
  <div class="achievements-container">
    <div class="achievements-header">
      <h1>成就系统</h1>
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
            <div class="stat-value">{{ stats.unlockedAchievements }}</div>
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
          >
            <div class="achievement-icon">
              {{ achievement.type === 'consecutive' ? '🔥' : '🍅' }}
            </div>
            <div class="achievement-content">
              <div class="achievement-title">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-progress">
                <div
                  class="progress-bar"
                  :style="{ width: `${getProgressPercentage(achievement)}%` }"
                ></div>
                <div class="progress-text">{{ achievement.progress }}/{{ achievement.target }}</div>
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
          >
            <div class="achievement-icon">
              {{ achievement.type === 'consecutive' ? '🔥' : '🍅' }}
            </div>
            <div class="achievement-content">
              <div class="achievement-title">{{ achievement.name }}</div>
              <div class="achievement-description">{{ achievement.description }}</div>
              <div class="achievement-progress">
                <div
                  class="progress-bar"
                  :style="{ width: `${getProgressPercentage(achievement)}%` }"
                ></div>
                <div class="progress-text">{{ achievement.progress }}/{{ achievement.target }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.achievements-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.achievements-header {
  text-align: center;
  margin-bottom: 40px;
}

.achievements-header h1 {
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 30px;
  font-weight: 700;
}

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
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
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
}

.achievement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.achievement-card {
  background: var(--card-background);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.achievement-card.unlocked {
  border-color: var(--accent-color);
  background: linear-gradient(135deg, var(--card-background) 0%, rgba(59, 130, 246, 0.05) 100%);
}

.achievement-icon {
  font-size: 3rem;
  margin-right: 20px;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.achievement-card.unlocked .achievement-icon {
  opacity: 1;
}

.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 5px;
}

.achievement-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin-bottom: 15px;
  line-height: 1.4;
}

.achievement-progress {
  width: 100%;
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: var(--accent-color);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.progress-text {
  position: absolute;
  right: 0;
  top: -25px;
  font-size: 0.8rem;
  color: var(--text-secondary);
}

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
  }

  .achievement-icon {
    margin-right: 0;
    margin-bottom: 15px;
  }
}
</style>
