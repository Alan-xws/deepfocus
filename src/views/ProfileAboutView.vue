<template>
  <div class="page profile-about-page">
    <div class="page-header">
      <div class="back-button" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
        </svg>
      </div>
      <h1>关于应用</h1>
    </div>

    <div class="about-container">
      <div class="app-info">
        <div class="app-logo">
          <div class="logo-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
              <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z M12,5A3,3 0 0,1 15,8A3,3 0 0,1 12,11A3,3 0 0,1 9,8A3,3 0 0,1 12,5M12,17A5,5 0 0,0 17,12C17,10.36 16.5,8.83 15.61,7.64L16.85,6.41C18.18,7.75 19,9.5 19,11.45C19,15.97 15.3,19.9 11,20.6V17H12Z"/>
            </svg>
          </div>
          <h2>{{ appName }}</h2>
          <p class="version">版本 {{ appVersion }}</p>
        </div>

        <p class="description">
          {{ appDescription }}
        </p>
      </div>

      <div class="info-section">
        <h3>应用信息</h3>
        <div class="info-item">
          <span class="label">开发者</span>
          <span class="value">{{ developer }}</span>
        </div>
        <div class="info-item">
          <span class="label">联系邮箱</span>
          <a :href="`mailto:${email}`" class="value link">{{ email }}</a>
        </div>
        <div class="info-item">
          <span class="label">官网</span>
          <a :href="website" target="_blank" rel="noopener noreferrer" class="value link">{{ website }}</a>
        </div>
        <div class="info-item">
          <span class="label">最后更新</span>
          <span class="value">{{ lastUpdate }}</span>
        </div>
      </div>

      <div class="info-section">
        <h3>法律信息</h3>
        <div class="legal-links">
          <button class="legal-btn" @click="showPrivacyPolicy">隐私政策</button>
          <button class="legal-btn" @click="showTermsOfService">服务条款</button>
          <button class="legal-btn" @click="showLicense">许可证</button>
        </div>
      </div>

      <div class="info-section">
        <h3>给我们评分</h3>
        <p class="rating-description">如果您喜欢我们的应用，请给我们一个评分和反馈！</p>
        <div class="rating-stars">
          <span 
            v-for="star in 5" 
            :key="star"
            class="star"
            :class="{ active: star <= userRating }"
            @click="setRating(star)"
          >
            ★
          </span>
        </div>
        <button class="review-btn" @click="submitReview">提交评价</button>
      </div>

      <div class="info-section">
        <h3>分享应用</h3>
        <div class="share-buttons">
          <button class="share-btn" @click="shareApp('wechat')">微信</button>
          <button class="share-btn" @click="shareApp('weibo')">微博</button>
          <button class="share-btn" @click="shareApp('copy')">复制链接</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 应用信息
const appName = 'Deep Focus'
const appVersion = '1.0.0'
const appDescription = 'Deep Focus 是一款专注计时应用，帮助您提高工作效率，培养良好的时间管理习惯。通过科学的番茄工作法，让您的工作更加高效。'
const developer = '专注团队'
const email = 'support@deepfocus.example.com'
const website = 'https://deepfocus.example.com'
const lastUpdate = '2024年1月15日'

// 用户评分
const userRating = ref(0)

// 返回上一页
const goBack = () => {
  router.back()
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  alert('隐私政策将在这里显示')
  // 实际应用中应该跳转到隐私政策页面
}

// 显示服务条款
const showTermsOfService = () => {
  alert('服务条款将在这里显示')
  // 实际应用中应该跳转到服务条款页面
}

// 显示许可证
const showLicense = () => {
  alert('许可证信息将在这里显示')
  // 实际应用中应该跳转到许可证页面
}

// 设置评分
const setRating = (rating: number) => {
  userRating.value = rating
}

// 提交评价
const submitReview = () => {
  if (userRating.value === 0) {
    alert('请先选择评分')
    return
  }
  
  alert(`感谢您的 ${userRating.value} 星评价！\n您的反馈对我们很重要。`)
  // 实际应用中应该提交评价到服务器
}

// 分享应用
const shareApp = (platform: string) => {
  let message = ''
  
  switch (platform) {
    case 'wechat':
      message = '分享到微信功能已触发'
      break
    case 'weibo':
      message = '分享到微博功能已触发'
      break
    case 'copy':
      message = '应用链接已复制到剪贴板'
      // 实际应用中应该复制链接到剪贴板
      break
    default:
      message = '分享功能已触发'
  }
  
  alert(message)
}
</script>

<style scoped>
.profile-about-page {
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

.about-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.app-info {
  text-align: center;
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 40px 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.app-logo {
  margin-bottom: 20px;
}

.logo-icon {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
}

.app-logo h2 {
  margin: 0 0 8px 0;
  color: var(--text-primary);
  font-size: 28px;
  font-weight: 700;
}

.version {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.description {
  color: var(--text-primary);
  font-size: 16px;
  line-height: 1.6;
  margin: 0 auto;
  max-width: 600px;
}

.info-section {
  background: var(--bg-secondary);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.info-section h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  color: var(--text-secondary);
  font-size: 14px;
}

.info-item .value {
  color: var(--text-primary);
  font-size: 14px;
  text-align: right;
}

.link {
  color: var(--accent-primary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.link:hover {
  color: var(--accent-secondary);
  text-decoration: underline;
}

.legal-links,
.share-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.legal-btn,
.share-btn {
  padding: 10px 20px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.legal-btn:hover,
.share-btn:hover {
  background: var(--bg-hover);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-1px);
}

.rating-description {
  margin: 0 0 16px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.star {
  font-size: 36px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.star:hover,
.star.active {
  color: var(--accent-primary);
  transform: scale(1.1);
}

.review-btn {
  display: block;
  width: 100%;
  padding: 12px;
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.review-btn:hover {
  background: var(--accent-secondary);
  border-color: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .profile-about-page {
    padding: 16px;
  }
  
  .app-info {
    padding: 30px 20px;
    border-radius: 16px;
  }
  
  .logo-icon {
    width: 80px;
    height: 80px;
  }
  
  .app-logo h2 {
    font-size: 24px;
  }
  
  .info-section {
    padding: 20px;
    border-radius: 16px;
  }
  
  .info-item {
    flex-direction: column;
    gap: 4px;
  }
  
  .info-item .value {
    text-align: left;
  }
  
  .star {
    font-size: 32px;
  }
}
</style>