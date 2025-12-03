import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from './tasks'

// 专注记录接口定义
export interface FocusRecord {
  id: number
  taskId: number
  taskName: string
  duration: number // 专注时长（秒）
  date: Date
  type: 'focus' | 'short-break' | 'long-break'
}

export const useRecordsStore = defineStore('records', () => {
  // 专注记录列表
  const records = ref<FocusRecord[]>([])

  // 加载记录
  const loadRecords = () => {
    try {
      const savedRecords = localStorage.getItem('deepfocus_records')
      if (savedRecords) {
        const parsedRecords = JSON.parse(savedRecords)
        // 转换日期字符串为Date对象
        records.value = parsedRecords.map((record: FocusRecord) => ({
          ...record,
          date: new Date(record.date),
        }))
      }
    } catch (error) {
      console.error('Failed to load records:', error)
      records.value = []
    }
  }

  // 保存记录到localStorage
  const saveRecords = () => {
    try {
      localStorage.setItem('deepfocus_records', JSON.stringify(records.value))
    } catch (error) {
      console.error('Failed to save records:', error)
    }
  }

  // 添加专注记录
  const addRecord = (
    task: Task,
    duration: number,
    type: 'focus' | 'short-break' | 'long-break' = 'focus',
  ): FocusRecord => {
    const newRecord: FocusRecord = {
      id: Date.now(), // 使用时间戳作为唯一ID
      taskId: task.id,
      taskName: task.name,
      duration,
      date: new Date(),
      type,
    }

    records.value.push(newRecord)
    saveRecords()
    return newRecord
  }

  // 根据日期范围获取记录
  const getRecordsByDateRange = (startDate: Date, endDate: Date): FocusRecord[] => {
    return records.value.filter((record) => {
      const recordDate = new Date(record.date)
      return recordDate >= startDate && recordDate <= endDate
    })
  }

  // 根据任务ID获取记录
  const getRecordsByTaskId = (taskId: number): FocusRecord[] => {
    return records.value.filter((record) => record.taskId === taskId)
  }

  // 统计今日专注时长（秒）
  const todayFocusDuration = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return records.value
      .filter(
        (record) =>
          record.type === 'focus' &&
          new Date(record.date) >= today &&
          new Date(record.date) < tomorrow,
      )
      .reduce((total, record) => total + record.duration, 0)
  })

  // 统计本周专注时长（秒）
  const weekFocusDuration = computed(() => {
    const today = new Date()
    const firstDayOfWeek = new Date(today)
    firstDayOfWeek.setDate(today.getDate() - today.getDay()) // 本周第一天（周日）
    firstDayOfWeek.setHours(0, 0, 0, 0)

    const firstDayOfNextWeek = new Date(firstDayOfWeek)
    firstDayOfNextWeek.setDate(firstDayOfNextWeek.getDate() + 7)

    return records.value
      .filter(
        (record) =>
          record.type === 'focus' &&
          new Date(record.date) >= firstDayOfWeek &&
          new Date(record.date) < firstDayOfNextWeek,
      )
      .reduce((total, record) => total + record.duration, 0)
  })

  // 统计本月专注时长（秒）
  const monthFocusDuration = computed(() => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    return records.value
      .filter(
        (record) =>
          record.type === 'focus' &&
          new Date(record.date) >= firstDayOfMonth &&
          new Date(record.date) < firstDayOfNextMonth,
      )
      .reduce((total, record) => total + record.duration, 0)
  })

  // 统计每个任务的专注时长（秒）
  const taskFocusDuration = computed(() => {
    const result: Record<number, { name: string; duration: number }> = {}

    records.value
      .filter((record) => record.type === 'focus')
      .forEach((record) => {
        if (!result[record.taskId]) {
          result[record.taskId] = { name: record.taskName, duration: 0 }
        }
        // 使用非空断言操作符，因为我们已经检查过该属性存在
        result[record.taskId]!.duration += record.duration
      })

    return result
  })

  // 获取专注总次数
  const totalFocusSessions = computed(() => {
    return records.value.filter((record) => record.type === 'focus').length
  })

  // 初始化时加载记录
  loadRecords()

  return {
    records,
    addRecord,
    getRecordsByDateRange,
    getRecordsByTaskId,
    todayFocusDuration,
    weekFocusDuration,
    monthFocusDuration,
    taskFocusDuration,
    totalFocusSessions,
  }
})
