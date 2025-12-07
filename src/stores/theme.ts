import { defineStore } from 'pinia'

interface ThemeState {
  isDarkMode: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    // 默认使用深色主题
    isDarkMode: true
  }),
  
  getters: {
    // 获取当前主题模式
    theme: (state) => state.isDarkMode ? 'dark' : 'light',
    
    // 获取当前主题对应的类名
    themeClass: (state) => state.isDarkMode ? 'dark-theme' : 'light-theme'
  },
  
  actions: {
    // 初始化主题
    initTheme() {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark'
      }
      this.applyTheme()
    },
    
    // 切换主题
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      this.saveTheme()
      this.applyTheme()
    },
    
    // 设置指定主题
    setTheme(isDark: boolean) {
      this.isDarkMode = isDark
      this.saveTheme()
      this.applyTheme()
    },
    
    // 保存主题到本地存储
    saveTheme() {
      localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light')
    },
    
    // 应用主题到DOM
    applyTheme() {
      const html = document.documentElement
      
      // 移除旧主题类
      html.classList.remove('light-theme', 'dark-theme')
      
      // 添加新主题类
      html.classList.add(this.isDarkMode ? 'dark-theme' : 'light-theme')
      
      // 设置暗色模式的系统偏好
      if (this.isDarkMode) {
        html.setAttribute('data-theme', 'dark')
        document.body.style.colorScheme = 'dark'
      } else {
        html.setAttribute('data-theme', 'light')
        document.body.style.colorScheme = 'light'
      }
    }
  }
})

// 导出主题配置常量（方便在CSS中使用）
export const themeConfig = {
  // 深色主题颜色
  dark: {
    background: {
      primary: '#1a1a2e',
      secondary: '#16213e',
      card: 'rgba(15, 23, 42, 0.95)',
      cardLight: 'rgba(255, 255, 255, 0.05)'
    },
    text: {
      primary: 'white',
      secondary: 'rgba(255, 255, 255, 0.8)',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    border: 'rgba(255, 255, 255, 0.1)',
    accent: {
      primary: '#60a5fa',
      secondary: '#a78bfa',
      hover: 'rgba(96, 165, 250, 0.2)'
    },
    error: {
      light: '#fca5a5',
      main: '#ef4444',
      background: 'rgba(239, 68, 68, 0.1)'
    }
  },
  
  // 浅色主题颜色
  light: {
    background: {
      primary: '#fafbfc',
      secondary: '#f3f4f6',
      card: 'rgba(255, 255, 255, 0.95)',
      cardLight: 'rgba(59, 130, 246, 0.05)'
    },
    text: {
      primary: '#111827',
      secondary: 'rgba(17, 24, 39, 0.65)',
      disabled: 'rgba(17, 24, 39, 0.4)'
    },
    border: 'rgba(17, 24, 39, 0.1)',
    accent: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      hover: 'rgba(37, 99, 235, 0.08)'
    },
    error: {
      light: '#fee2e2',
      main: '#dc2626',
      background: 'rgba(220, 38, 38, 0.05)'
    }
  }
}

export default useThemeStore