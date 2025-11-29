// API请求工具，用于在所有请求中自动添加认证令牌

// 获取认证令牌
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token')
}

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getAuthToken()
}

// 基础请求配置
interface RequestConfig extends RequestInit {
  params?: Record<string, unknown>
}

// API请求函数
export const apiRequest = async <T = unknown>(
  url: string,
  config: RequestConfig = {},
): Promise<T> => {
  // 构建完整URL（处理查询参数）
  let fullUrl = url
  if (config.params) {
    const searchParams = new URLSearchParams()
    Object.entries(config.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const paramsString = searchParams.toString()
    if (paramsString) {
      fullUrl += (url.includes('?') ? '&' : '?') + paramsString
    }
  }

  // 设置默认配置
  const defaultConfig: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    ...config,
  }

  // 添加认证令牌到请求头
  const token = getAuthToken()
  if (token && defaultConfig.headers) {
    ;(defaultConfig.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(fullUrl, defaultConfig)

    if (!response.ok) {
      // 处理401未授权情况
      if (response.status === 401) {
        // 清除本地存储的令牌
        localStorage.removeItem('auth_token')
        // 重定向到登录页面
        window.location.href = '/login'
        throw new Error('认证失败，请重新登录')
      }

      // 处理其他错误
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `请求失败: ${response.status}`)
    }

    // 解析响应数据
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

// 便捷方法
export const api = {
  get: <T = unknown>(url: string, config?: RequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'GET' }),

  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'POST', body: JSON.stringify(data) }),

  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'PUT', body: JSON.stringify(data) }),

  delete: <T = unknown>(url: string, config?: RequestConfig) =>
    apiRequest<T>(url, { ...config, method: 'DELETE' }),
}

// 清除认证信息
export const clearAuth = () => {
  localStorage.removeItem('auth_token')
}

// 登出函数
export const logout = () => {
  clearAuth()
  window.location.href = '/login'
}

export default api
