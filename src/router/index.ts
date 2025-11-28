import { createRouter, createWebHistory } from 'vue-router'
import TimerView from '@/views/TimerView.vue'
import RecordsView from '@/views/RecordsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import ProfileView from '@/views/ProfileView.vue'

const routes = [
  { path: '/', redirect: '/welcome' }, // 首次进入跳欢迎页
  { path: '/welcome', component: () => import('@/views/WelcomeView.vue') },
  { path: '/timer', component: () => import('@/views/TimerView.vue') },
  { path: '/records', name: 'Records', component: RecordsView },
  { path: '/settings', name: 'Settings', component: SettingsView },
  { path: '/profile', name: 'Profile', component: ProfileView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
