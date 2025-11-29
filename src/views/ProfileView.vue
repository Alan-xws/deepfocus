<template>
  <div class="page profile-page">
    <div class="user-profile">
      <div class="avatar-container">
        <div class="avatar">
          <span class="avatar-text">{{ userName.charAt(0) }}</span>
        </div>
        <div class="user-info">
          <h2>{{ userName }}</h2>
          <p class="join-date">加入时间：{{ joinDate }}</p>
        </div>
      </div>
    </div>

    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-value">{{ totalFocusHours }}</div>
        <div class="stat-label">总专注时长(小时)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ totalCompletedSessions }}</div>
        <div class="stat-label">完成专注次数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ currentStreak }}</div>
        <div class="stat-label">当前连续天数</div>
      </div>
    </div>

    <div class="action-container">
      <h3>个人设置</h3>
      <div class="action-cards">
        <div class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5M19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.66 15.5 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.5 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.94C7.96 18.34 8.5 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.5 18.67 16.04 18.34 16.56 17.94L19.05 18.95C19.27 19.03 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z"
              />
            </svg>
          </div>
          <div class="action-content">
            <h4>个人资料</h4>
            <p>修改头像、昵称等信息</p>
          </div>
        </div>

        <div class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
              />
            </svg>
          </div>
          <div class="action-content">
            <h4>通知设置</h4>
            <p>管理应用通知偏好</p>
          </div>
        </div>

        <div class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,17A5,5 0 0,0 17,12C17,10.36 16.5,8.83 15.61,7.64L16.85,6.41C18.18,7.75 19,9.5 19,11.45C19,15.97 15.3,19.9 11,20.6V17H12Z"
              />
            </svg>
          </div>
          <div class="action-content">
            <h4>隐私设置</h4>
            <p>管理数据和隐私选项</p>
          </div>
        </div>

        <div class="action-card">
          <div class="action-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M22,3H2C0.89,3 0,3.9 0,5V19A2,2 0 0,0 2,21H22A2,2 0 0,0 24,19V5C24,3.9 23.1,3 22,3M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"
              />
            </svg>
          </div>
          <div class="action-content">
            <h4>关于应用</h4>
            <p>版本信息与使用说明</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 用户数据
const userName = '专注大师'
const joinDate = '2025年'
const totalFocusHours = '128'
const totalCompletedSessions = '326'
const currentStreak = '15'
</script>

<style scoped>
.profile-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  gap: 30px;

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 20px;
  }
}

/* 用户个人信息区域 */
.user-profile {
  width: 100%;
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
  }
}

.user-profile:hover {
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.avatar-container {
  display: flex;
  align-items: center;
  gap: 20px;

  /* 移动端优化 */
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 36px;
  font-weight: 700;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
  transition: all 0.3s ease;

  /* 移动端优化 */
  @media (max-width: 768px) {
    width: 80px;
    height: 80px;
    font-size: 30px;
  }
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 30px rgba(14, 165, 233, 0.4);
}

.avatar-text {
  line-height: 1;
}

.user-info h2 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 24px;
  }
}

.join-date {
  margin: 0;
  color: var(--text-secondary);
  font-size: 16px;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 14px;
  }
}

/* 统计数据卡片 */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;

  /* 移动端优化 */
  @media (max-width: 768px) {
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

.stat-card {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 25px;
  text-align: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 20px 16px;
    border-radius: 14px;
  }
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 8px;
  line-height: 1;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 28px;
  }
}

.stat-label {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 14px;
  }
}

/* 操作菜单区域 */
.action-container {
  width: 100%;
}

.action-container h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 600;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 16px;
  }
}

.action-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;

  /* 移动端优化 */
  @media (max-width: 768px) {
    gap: 10px;
  }
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  /* 移动端优化 */
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
    border-radius: 14px;
  }
}

.action-card:hover {
  transform: translateX(5px);
  background: var(--bg-hover);
  border-color: var(--border-color);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  flex-shrink: 0;

  /* 移动端优化 */
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }

  /* 移动端图标大小 */
  @media (max-width: 768px) {
    svg {
      width: 20px;
      height: 20px;
    }
  }
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-content h4 {
  margin: 0 0 4px 0;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 15px;
  }
}

.action-content p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;

  /* 移动端优化 */
  @media (max-width: 768px) {
    font-size: 13px;
  }
}

.action-arrow {
  color: var(--text-secondary);
  transition: color 0.3s ease;
}

.action-card:hover .action-arrow {
  color: var(--accent-primary);
}

/* 深色模式特定样式 */
:global(.dark-theme) .user-profile,
:global(.dark-theme) .stat-card,
:global(.dark-theme) .action-card {
  background: rgba(255, 255, 255, 0.05);
}

:global(.dark-theme) .user-profile:hover,
:global(.dark-theme) .stat-card:hover,
:global(.dark-theme) .action-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

:global(.dark-theme) .action-icon {
  background: rgba(255, 255, 255, 0.1);
}
</style>
