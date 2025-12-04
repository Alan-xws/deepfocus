import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRecordsStore } from './records'

// 成就接口定义
export interface Achievement {
  id: string
  name: string
  description: string
  unlocked: boolean
  unlockDate?: Date
  progress: number
  target: number
  type: 'consecutive' | 'total'
}

// 连续打卡成就定义
const CONSECUTIVE_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'consecutive_3',
    name: '初学者',
    description: '连续专注3天',
    unlocked: false,
    progress: 0,
    target: 3,
    type: 'consecutive',
  },
  {
    id: 'consecutive_7',
    name: '坚持者',
    description: '连续专注7天',
    unlocked: false,
    progress: 0,
    target: 7,
    type: 'consecutive',
  },
  {
    id: 'consecutive_14',
    name: '爱好者',
    description: '连续专注14天',
    unlocked: false,
    progress: 0,
    target: 14,
    type: 'consecutive',
  },
  {
    id: 'consecutive_30',
    name: '专注达人',
    description: '连续专注30天',
    unlocked: false,
    progress: 0,
    target: 30,
    type: 'consecutive',
  },
  {
    id: 'consecutive_60',
    name: '专注大师',
    description: '连续专注60天',
    unlocked: false,
    progress: 0,
    target: 60,
    type: 'consecutive',
  },
  {
    id: 'consecutive_100',
    name: '专注传奇',
    description: '连续专注100天',
    unlocked: false,
    progress: 0,
    target: 100,
    type: 'consecutive',
  },
]

// 累计番茄数成就定义
const TOTAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'total_10',
    name: '起步',
    description: '累计完成10个番茄钟',
    unlocked: false,
    progress: 0,
    target: 10,
    type: 'total',
  },
  {
    id: 'total_50',
    name: '进阶',
    description: '累计完成50个番茄钟',
    unlocked: false,
    progress: 0,
    target: 50,
    type: 'total',
  },
  {
    id: 'total_100',
    name: '熟练',
    description: '累计完成100个番茄钟',
    unlocked: false,
    progress: 0,
    target: 100,
    type: 'total',
  },
  {
    id: 'total_200',
    name: '专业',
    description: '累计完成200个番茄钟',
    unlocked: false,
    progress: 0,
    target: 200,
    type: 'total',
  },
  {
    id: 'total_500',
    name: '专家',
    description: '累计完成500个番茄钟',
    unlocked: false,
    progress: 0,
    target: 500,
    type: 'total',
  },
  {
    id: 'total_1000',
    name: '传奇',
    description: '累计完成1000个番茄钟',
    unlocked: false,
    progress: 0,
    target: 1000,
    type: 'total',
  },
]

// 合并所有成就
const ALL_ACHIEVEMENTS = [...CONSECUTIVE_ACHIEVEMENTS, ...TOTAL_ACHIEVEMENTS]

export const useAchievementsStore = defineStore('achievements', () => {
  // 成就列表
  const achievements = ref<Achievement[]>(ALL_ACHIEVEMENTS)

  // 连续打卡天数
  const consecutiveDays = ref<number>(0)

  // 记录store
  const recordsStore = useRecordsStore()

  // 加载成就
  const loadAchievements = () => {
    try {
      const savedAchievements = localStorage.getItem('deepfocus_achievements')
      if (savedAchievements) {
        const parsedAchievements = JSON.parse(savedAchievements)
        // 转换日期字符串为Date对象
        achievements.value = parsedAchievements.map((achievement: Achievement) => ({
          ...achievement,
          unlockDate: achievement.unlockDate ? new Date(achievement.unlockDate) : undefined,
        }))
      }

      const savedConsecutiveDays = localStorage.getItem('deepfocus_consecutive_days')
      if (savedConsecutiveDays) {
        consecutiveDays.value = parseInt(savedConsecutiveDays)
      }
    } catch (error) {
      console.error('Failed to load achievements:', error)
    }
  }

  // 保存成就到localStorage
  const saveAchievements = () => {
    try {
      localStorage.setItem('deepfocus_achievements', JSON.stringify(achievements.value))
      localStorage.setItem('deepfocus_consecutive_days', String(consecutiveDays.value))
    } catch (error) {
      console.error('Failed to save achievements:', error)
    }
  }

  // 计算连续打卡天数
  const calculateConsecutiveDays = () => {
    // 获取所有专注记录，按日期排序
    const focusRecords = recordsStore.records
      .filter((record) => record.type === 'focus')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    if (focusRecords.length === 0) {
      consecutiveDays.value = 0
      return
    }

    // 获取所有有专注记录的日期
    const focusDates = new Set<string>()
    focusRecords.forEach((record) => {
      const date = new Date(record.date)
      const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      focusDates.add(dateStr)
    })

    // 转换为日期数组并排序
    const sortedDates = Array.from(focusDates)
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => b.getTime() - a.getTime())

    // 计算连续天数
    let count = 1
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 检查今天是否有专注记录
    const todayStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
    if (!focusDates.has(todayStr)) {
      // 检查昨天是否有专注记录
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth() + 1}-${yesterday.getDate()}`

      if (!focusDates.has(yesterdayStr)) {
        count = 0
      } else {
        // 从昨天开始计算连续天数
        count = 1
        let currentDate = new Date(yesterday)

        for (let i = 1; i < sortedDates.length; i++) {
          const date = sortedDates[i]
          if (!date) break

          const prevDate = new Date(currentDate)
          prevDate.setDate(prevDate.getDate() - 1)

          if (date.toDateString() === prevDate.toDateString()) {
            count++
            currentDate = prevDate
          } else {
            break
          }
        }
      }
    } else {
      // 从今天开始计算连续天数
      let currentDate = new Date(today)

      for (let i = 1; i < sortedDates.length; i++) {
        const date = sortedDates[i]
        if (!date) break

        const prevDate = new Date(currentDate)
        prevDate.setDate(prevDate.getDate() - 1)

        if (date.toDateString() === prevDate.toDateString()) {
          count++
          currentDate = prevDate
        } else {
          break
        }
      }
    }

    consecutiveDays.value = count
  }

  // 检查并解锁成就
  const checkAchievements = () => {
    // 检查连续打卡成就
    const consecutiveAchievements = achievements.value.filter((ach) => ach.type === 'consecutive')
    consecutiveAchievements.forEach((achievement) => {
      achievement.progress = consecutiveDays.value
      if (achievement.progress >= achievement.target && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockDate = new Date()
        console.log(`解锁成就：${achievement.name}`)
      }
    })

    // 检查累计番茄数成就
    const totalFocusSessions = recordsStore.totalFocusSessions
    const totalAchievements = achievements.value.filter((ach) => ach.type === 'total')
    totalAchievements.forEach((achievement) => {
      achievement.progress = totalFocusSessions
      if (achievement.progress >= achievement.target && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockDate = new Date()
        console.log(`解锁成就：${achievement.name}`)
      }
    })

    saveAchievements()
  }

  // 解锁成就（手动）
  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.value.find((ach) => ach.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockDate = new Date()
      saveAchievements()
    }
  }

  // 获取已解锁的成就
  // 获取总专注次数
  const totalFocusCount = computed(() => {
    return recordsStore.totalFocusSessions
  })

  // 获取已解锁的成就
  const unlockedAchievements = computed(() => {
    return achievements.value.filter((ach) => ach.unlocked)
  })

  // 获取未解锁的成就
  const lockedAchievements = computed(() => {
    return achievements.value.filter((ach) => !ach.unlocked)
  })

  // 获取所有成就（按解锁状态和类型排序）
  const allAchievements = computed(() => {
    return [...achievements.value].sort((a, b) => {
      // 已解锁的排在前面
      if (a.unlocked && !b.unlocked) return -1
      if (!a.unlocked && b.unlocked) return 1
      // 相同状态下按类型排序
      if (a.type !== b.type) {
        return a.type === 'consecutive' ? -1 : 1
      }
      // 相同类型下按目标值排序
      return a.target - b.target
    })
  })

  // 初始化时加载成就
  loadAchievements()
  calculateConsecutiveDays()
  checkAchievements()

  return {
    achievements,
    consecutiveDays,
    loadAchievements,
    saveAchievements,
    calculateConsecutiveDays,
    checkAchievements,
    unlockAchievement,
    unlockedAchievements,
    lockedAchievements,
    allAchievements,
    totalFocusCount,
  }
})
