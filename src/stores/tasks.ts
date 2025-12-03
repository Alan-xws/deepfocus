import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 任务接口定义
export interface Task {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
}

// 默认任务列表
const DEFAULT_TASKS: Task[] = [
  { id: 1, name: '默认任务', createdAt: new Date(), updatedAt: new Date() },
  { id: 2, name: '学习编程', createdAt: new Date(), updatedAt: new Date() },
  { id: 3, name: '健身', createdAt: new Date(), updatedAt: new Date() },
  { id: 4, name: '阅读', createdAt: new Date(), updatedAt: new Date() },
]

export const useTasksStore = defineStore('tasks', () => {
  // 任务列表
  const tasks = ref<Task[]>([])

  // 加载任务列表
  const loadTasks = () => {
    try {
      const savedTasks = localStorage.getItem('deepfocus_tasks')
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)
        // 转换日期字符串为Date对象
        tasks.value = parsedTasks.map((task: Task) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
        }))
      } else {
        // 如果没有保存的任务，使用默认任务
        tasks.value = DEFAULT_TASKS
        saveTasks()
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
      tasks.value = DEFAULT_TASKS
      saveTasks()
    }
  }

  // 保存任务列表到localStorage
  const saveTasks = () => {
    try {
      localStorage.setItem('deepfocus_tasks', JSON.stringify(tasks.value))
    } catch (error) {
      console.error('Failed to save tasks:', error)
    }
  }

  // 获取任务列表（计算属性）
  const taskList = computed(() => tasks.value)

  // 添加新任务
  const addTask = (name: string): Task => {
    const newTask: Task = {
      id: Date.now(), // 使用时间戳作为唯一ID
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    tasks.value.push(newTask)
    saveTasks()
    return newTask
  }

  // 更新任务名称
  const updateTask = (id: number, name: string): boolean => {
    const taskIndex = tasks.value.findIndex((task) => task.id === id)
    if (taskIndex !== -1) {
      // 使用非空断言操作符，因为我们已经检查过taskIndex是有效的
      const existingTask = tasks.value[taskIndex]!
      tasks.value[taskIndex] = {
        id: existingTask.id,
        name,
        createdAt: existingTask.createdAt,
        updatedAt: new Date(),
      }
      saveTasks()
      return true
    }
    return false
  }

  // 删除任务
  const deleteTask = (id: number): boolean => {
    const taskIndex = tasks.value.findIndex((task) => task.id === id)
    if (taskIndex !== -1) {
      tasks.value.splice(taskIndex, 1)
      saveTasks()
      return true
    }
    return false
  }

  // 根据ID获取任务
  const getTaskById = (id: number): Task | undefined => {
    return tasks.value.find((task) => task.id === id)
  }

  // 获取默认任务
  const getDefaultTask = (): Task => {
    const defaultTask = tasks.value.find((task) => task.name === '默认任务')
    const firstTask = tasks.value[0]
    // 确保返回一个有效的Task对象
    return defaultTask! || firstTask!
  }

  // 初始化时加载任务
  loadTasks()

  return {
    tasks,
    taskList,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getDefaultTask,
    loadTasks,
  }
})
