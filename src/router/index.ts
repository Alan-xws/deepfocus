import { createRouter, createWebHistory } from 'vue-router'
import TimerView from '@/views/TimerView.vue'
import RecordsView from '@/views/RecordsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ProfileView from '@/views/ProfileView.vue'
import ProfileInfoView from '@/views/ProfileInfoView.vue'
import ProfileNotificationsView from '@/views/ProfileNotificationsView.vue'
import ProfilePrivacyView from '@/views/ProfilePrivacyView.vue'
import ProfileAboutView from '@/views/ProfileAboutView.vue'
import SquareView from '@/views/SquareView.vue'
import AchievementsView from '@/views/AchievementsView.vue'

// 检查是否已登录
const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token')
}

const routes = [
  { path: '/', redirect: '/login' }, // 首次进入跳登录页
  { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { requiresGuest: true } },
  { path: '/welcome', component: () => import('@/views/WelcomeView.vue'), meta: { requiresAuth: true } },
  { path: '/timer', component: () => import('@/views/TimerView.vue'), meta: { requiresAuth: true } },
  { path: '/records', name: 'Records', component: RecordsView, meta: { requiresAuth: true } },
  { path: '/settings', name: 'Settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/square', name: 'Square', component: SquareView, meta: { requiresAuth: true } },
  { path: '/achievements', name: 'Achievements', component: AchievementsView, meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
  // 个人设置子页面
  { path: '/profile/info', name: 'ProfileInfo', component: ProfileInfoView, meta: { requiresAuth: true } },
  { path: '/profile/notifications', name: 'ProfileNotifications', component: ProfileNotificationsView, meta: { requiresAuth: true } },
  { path: '/profile/privacy', name: 'ProfilePrivacy', component: ProfilePrivacyView, meta: { requiresAuth: true } },
  { path: '/profile/about', name: 'ProfileAbout', component: ProfileAboutView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 需要认证的页面
    if (!isAuthenticated()) {
      next({ path: '/login' })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    // 游客页面（如登录页）
    if (isAuthenticated()) {
      next({ path: '/timer' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
