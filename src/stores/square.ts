import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 定义分享帖子接口
export interface SharePost {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  duration: number
  date: string
  likes: number
  comments: number
  isLiked: boolean
  image?: string
}

// 定义发布分享的请求接口
interface CreateShareRequest {
  content: string
  duration: number
  image?: string
}

export const useSquareStore = defineStore('square', () => {
  // 状态
  const posts = ref<SharePost[]>([])
  const isLoading = ref(false)
  const isPosting = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const sortedPosts = computed(() => {
    return [...posts.value].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
  })

  // 操作
  // 获取广场帖子列表
  const fetchPosts = async () => {
    isLoading.value = true
    error.value = null
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // 模拟数据
      const mockPosts: SharePost[] = [
        {
          id: '1',
          userId: 'user1',
          username: '专注大师',
          avatar: 'https://picsum.photos/id/1/40/40',
          content: '今天完成了3小时的深度工作，感觉很棒！',
          duration: 180,
          date: '2025-04-29',
          likes: 42,
          comments: 5,
          isLiked: false,
          image: 'https://picsum.photos/id/100/600/400'
        },
        {
          id: '2',
          userId: 'user2',
          username: '学习达人',
          avatar: 'https://picsum.photos/id/2/40/40',
          content: '坚持每天专注学习2小时，积少成多！',
          duration: 120,
          date: '2025-04-29',
          likes: 28,
          comments: 3,
          isLiked: true
        },
        {
          id: '3',
          userId: 'user3',
          username: '工作效率王',
          avatar: 'https://picsum.photos/id/3/40/40',
          content: '使用番茄工作法，效率提升了30%！',
          duration: 210,
          date: '2025-04-28',
          likes: 65,
          comments: 8,
          isLiked: false,
          image: 'https://picsum.photos/id/200/600/400'
        },
        {
          id: '4',
          userId: 'user4',
          username: '生活平衡家',
          avatar: 'https://picsum.photos/id/4/40/40',
          content: '合理安排工作和休息时间，才能保持长期的专注状态！',
          duration: 150,
          date: '2025-04-28',
          likes: 35,
          comments: 4,
          isLiked: false
        },
        {
          id: '5',
          userId: 'user5',
          username: '编程爱好者',
          avatar: 'https://picsum.photos/id/5/40/40',
          content: '今天攻克了一个技术难题，专注的感觉真爽！',
          duration: 195,
          date: '2025-04-27',
          likes: 52,
          comments: 6,
          isLiked: true,
          image: 'https://picsum.photos/id/300/600/400'
        }
      ]
      
      posts.value = mockPosts
    } catch (err) {
      error.value = '获取帖子失败，请稍后重试'
      console.error('获取帖子失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 发布新帖子
  const createPost = async (data: CreateShareRequest) => {
    isPosting.value = true
    error.value = null
    try {
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 模拟创建的帖子数据
      const newPost: SharePost = {
        id: Date.now().toString(),
        userId: 'currentUser', // 当前登录用户ID
        username: '当前用户', // 当前登录用户名
        avatar: 'https://picsum.photos/id/100/40/40', // 当前用户头像
        content: data.content,
        duration: data.duration,
        date: new Date().toISOString().split('T')[0] || new Date().toLocaleDateString(),
        likes: 0,
        comments: 0,
        isLiked: false,
        image: data.image
      }
      
      // 添加到帖子列表开头
      posts.value.unshift(newPost)
      
      return newPost
    } catch (err) {
      error.value = '发布帖子失败，请稍后重试'
      console.error('发布帖子失败:', err)
      throw err
    } finally {
      isPosting.value = false
    }
  }

  // 切换点赞状态
  const toggleLike = async (postId: string) => {
    try {
      // 先在本地更新状态（乐观更新）
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }
      
      // 模拟API请求
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (err) {
      // 如果API请求失败，回滚本地状态
      const post = posts.value.find(p => p.id === postId)
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }
      
      error.value = '操作失败，请稍后重试'
      console.error('切换点赞状态失败:', err)
    }
  }

  return {
    // 状态
    posts,
    sortedPosts,
    isLoading,
    isPosting,
    error,
    // 操作
    fetchPosts,
    createPost,
    toggleLike
  }
})
