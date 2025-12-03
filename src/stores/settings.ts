import { defineStore } from 'pinia'

interface Settings {
  focusTime: number
  shortBreakTime: number
  longBreakTime: number
  longBreakInterval: number
  theme: 'light' | 'dark'
}

const DEFAULT_SETTINGS: Settings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  theme: 'dark'
}

export const useSettingsStore = defineStore('settings', {
  state: (): Settings => {
    return {
      ...DEFAULT_SETTINGS
    }
  },

  getters: {
    getFocusTime: (state) => state.focusTime,
    getShortBreakTime: (state) => state.shortBreakTime,
    getLongBreakTime: (state) => state.longBreakTime,
    getLongBreakInterval: (state) => state.longBreakInterval,
    getTheme: (state) => state.theme
  },

  actions: {
    loadSettings() {
      try {
        // 加载时间设置
        const savedFocusTime = localStorage.getItem('deepfocus-focus-time')
        const savedShortBreak = localStorage.getItem('deepfocus-short-break')
        const savedLongBreak = localStorage.getItem('deepfocus-long-break')
        const savedInterval = localStorage.getItem('deepfocus-interval')

        if (savedFocusTime) this.focusTime = parseInt(savedFocusTime)
        if (savedShortBreak) this.shortBreakTime = parseInt(savedShortBreak)
        if (savedLongBreak) this.longBreakTime = parseInt(savedLongBreak)
        if (savedInterval) this.longBreakInterval = parseInt(savedInterval)

        // 加载主题设置
        const savedTheme = localStorage.getItem('deepfocus-theme')
        if (savedTheme) {
          this.theme = savedTheme as 'light' | 'dark'
        }

        // 应用主题
        this.applyTheme()
      } catch (error) {
        console.error('加载设置失败:', error)
      }
    },

    saveSettings() {
      try {
        // 保存时间设置
        localStorage.setItem('deepfocus-focus-time', String(this.focusTime))
        localStorage.setItem('deepfocus-short-break', String(this.shortBreakTime))
        localStorage.setItem('deepfocus-long-break', String(this.longBreakTime))
        localStorage.setItem('deepfocus-interval', String(this.longBreakInterval))

        // 保存主题设置
        localStorage.setItem('deepfocus-theme', this.theme)
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },

    setFocusTime(time: number) {
      this.focusTime = time
      this.saveSettings()
    },

    setShortBreakTime(time: number) {
      this.shortBreakTime = time
      this.saveSettings()
    },

    setLongBreakTime(time: number) {
      this.longBreakTime = time
      this.saveSettings()
    },

    setLongBreakInterval(interval: number) {
      this.longBreakInterval = interval
      this.saveSettings()
    },

    setTheme(theme: 'light' | 'dark') {
      this.theme = theme
      this.applyTheme()
      this.saveSettings()
    },

    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark-theme')
        document.documentElement.classList.remove('light-theme')
      } else {
        document.documentElement.classList.add('light-theme')
        document.documentElement.classList.remove('dark-theme')
      }
    }
  }
})
