<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 登录表单状态
const username = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

// 处理登录
const handleLogin = async () => {
  // 表单验证
  if (!username.value.trim() || !password.value.trim()) {
    error.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    // 模拟登录请求
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 模拟生成令牌
    const token = `token_${Date.now()}`

    // 存储令牌到localStorage
    localStorage.setItem('auth_token', token)

    // 登录成功后跳转到计时器页面
    router.push('/timer')
  } catch (err) {
    error.value = '登录失败，请重试'
    console.error('登录错误:', err)
  } finally {
    isLoading.value = false
  }
}

// 跳转到注册页面（暂时不实现注册功能）
const goToRegister = () => {
  alert('注册功能即将上线')
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <h1>DeepFocus</h1>
        <p>专注让效率倍增</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="请输入用户名"
            :disabled="isLoading"
          />
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            :disabled="isLoading"
          />
        </div>

        <p v-if="error" class="error-message">{{ error }}</p>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>

        <div class="links">
          <button type="button" class="link-btn" @click="goToRegister">注册账号</button>
          <a href="#" class="link">忘记密码？</a>
        </div>
      </form>
    </div>

    <!-- 背景装饰 -->
    <div class="background-shape shape-1"></div>
    <div class="background-shape shape-2"></div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
  padding: 20px;
}

.background-shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.shape-1 {
  width: 400px;
  height: 400px;
  background: #60a5fa;
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 500px;
  height: 500px;
  background: #a78bfa;
  bottom: -200px;
  right: -200px;
}

.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 10;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.4);
}

.logo {
  text-align: center;
  margin-bottom: 30px;
}

.logo h1 {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 10px 0;
}

.logo p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.input-group input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  color: white;
  font-size: 16px;
  transition: all 0.3s ease;
}

.input-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.input-group input:focus {
  outline: none;
  border-color: #60a5fa;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.input-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #f87171;
  font-size: 14px;
  margin: 0;
  text-align: center;
}

.login-btn {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(96, 165, 250, 0.4);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.links {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.link-btn,
.link {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 14px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-decoration: none;
}

.link-btn:hover,
.link:hover {
  background: rgba(96, 165, 250, 0.1);
  color: #93c5fd;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-card {
    padding: 30px 20px;
  }

  .logo h1 {
    font-size: 28px;
  }

  .background-shape {
    filter: blur(60px);
  }

  .shape-1 {
    width: 300px;
    height: 300px;
  }

  .shape-2 {
    width: 350px;
    height: 350px;
  }
}
</style>
