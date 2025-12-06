import { defineStore } from 'pinia'

interface Settings {
  focusTime: number
  shortBreakTime: number
  longBreakTime: number
  longBreakInterval: number
  theme: 'light' | 'dark'
  soundEnabled: boolean
  volume: number
  notificationsEnabled: boolean
  accentColor: string
}

const DEFAULT_SETTINGS: Settings = {
  focusTime: 25,
  shortBreakTime: 5,
  longBreakTime: 15,
  longBreakInterval: 4,
  theme: 'dark',
  soundEnabled: true,
  volume: 70,
  notificationsEnabled: true,
  accentColor: '#3b82f6'
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
    getTheme: (state) => state.theme,
    getSoundEnabled: (state) => state.soundEnabled,
    getVolume: (state) => state.volume,
    getNotificationsEnabled: (state) => state.notificationsEnabled,
    getAccentColor: (state) => state.accentColor
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

        // 加载声音设置
        const savedSoundEnabled = localStorage.getItem('deepfocus-sound-enabled')
        if (savedSoundEnabled !== null) {
          this.soundEnabled = savedSoundEnabled === 'true'
        }

        const savedVolume = localStorage.getItem('deepfocus-volume')
        if (savedVolume) {
          this.volume = parseInt(savedVolume)
        }

        // 加载通知设置
        const savedNotificationsEnabled = localStorage.getItem('deepfocus-notifications-enabled')
        if (savedNotificationsEnabled !== null) {
          this.notificationsEnabled = savedNotificationsEnabled === 'true'
        }

        // 加载强调色设置
        const savedAccentColor = localStorage.getItem('deepfocus-accent-color')
        if (savedAccentColor) {
          this.accentColor = savedAccentColor
        }

        // 应用主题
        this.applyTheme()
        // 应用强调色
        this.applyAccentColor()
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

        // 保存声音设置
        localStorage.setItem('deepfocus-sound-enabled', String(this.soundEnabled))
        localStorage.setItem('deepfocus-volume', String(this.volume))

        // 保存通知设置
        localStorage.setItem('deepfocus-notifications-enabled', String(this.notificationsEnabled))

        // 保存强调色设置
        localStorage.setItem('deepfocus-accent-color', this.accentColor)
      } catch (error) {
        console.error('保存设置失败:', error)
      }
    },

    resetSettings() {
      try {
        // 重置为默认设置
        Object.assign(this, DEFAULT_SETTINGS)
        // 应用设置
        this.applyTheme()
        this.applyAccentColor()
        // 保存到localStorage
        this.saveSettings()
      } catch (error) {
        console.error('重置设置失败:', error)
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

    setSoundEnabled(enabled: boolean) {
      this.soundEnabled = enabled
      this.saveSettings()
    },

    setVolume(volume: number) {
      this.volume = volume
      this.saveSettings()
    },

    setNotificationsEnabled(enabled: boolean) {
      this.notificationsEnabled = enabled
      this.saveSettings()
    },

    setAccentColor(color: string) {
      this.accentColor = color
      this.applyAccentColor()
      this.saveSettings()
    },

    applyAccentColor() {
      document.documentElement.style.setProperty('--primary-color', this.accentColor)
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
