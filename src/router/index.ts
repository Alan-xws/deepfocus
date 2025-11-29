import { createRouter, createWebHistory } from 'vue-router'
import TimerView from '@/views/TimerView.vue'
import RecordsView from '@/views/RecordsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ProfileView from '@/views/ProfileView.vue'

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
  { path: '/profile', name: 'Profile', component: ProfileView, meta: { requiresAuth: true } },
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
