import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 定义分享帖子接口
export interface Comment {
  id: string
  userId: string
  username: string
  avatar: string
  content: string
  date: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
}

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
  commentList?: Comment[]
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
  const isCommenting = ref(false)
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
      await new Promise((resolve) => setTimeout(resolve, 500))

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
          image: 'https://picsum.photos/id/100/600/400',
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
          isLiked: true,
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
          image: 'https://picsum.photos/id/200/600/400',
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
          isLiked: false,
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
          image: 'https://picsum.photos/id/300/600/400',
        },
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
      await new Promise((resolve) => setTimeout(resolve, 800))

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
        image: data.image,
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
      const post = posts.value.find((p) => p.id === postId)
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }

      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (err) {
      // 如果API请求失败，回滚本地状态
      const post = posts.value.find((p) => p.id === postId)
      if (post) {
        post.isLiked = !post.isLiked
        post.likes += post.isLiked ? 1 : -1
      }

      error.value = '操作失败，请稍后重试'
      console.error('切换点赞状态失败:', err)
    }
  }

  // 添加评论
  const addComment = (postId: string, content: string) => {
    // 模拟添加评论
    const post = posts.value.find((p) => p.id === postId)
    if (post) {
      // 创建新评论
      const newComment: Comment = {
        id: Date.now().toString(),
        userId: 'current-user',
        username: '当前用户',
        avatar: 'https://ui-avatars.com/api/?name=User&background=random',
        content,
        date: new Date().toISOString(),
        likes: 0,
        isLiked: false,
      }

      // 初始化评论列表
      if (!post.commentList) {
        post.commentList = []
      }

      // 添加到评论列表开头
      post.commentList.unshift(newComment)
      post.comments++
    }
  }

  const toggleCommentLike = (postId: string, commentId: string) => {
    // 模拟点赞评论
    const post = posts.value.find((p) => p.id === postId)
    if (post && post.commentList) {
      const findCommentInTree = (comments: Comment[], id: string): Comment | undefined => {
        for (const comment of comments) {
          if (comment.id === id) {
            return comment
          }
          if (comment.replies) {
            const found = findCommentInTree(comment.replies, id)
            if (found) {
              return found
            }
          }
        }
        return undefined
      }

      const comment = findCommentInTree(post.commentList, commentId)
      if (comment) {
        if (comment.isLiked) {
          comment.likes--
        } else {
          comment.likes++
        }
        comment.isLiked = !comment.isLiked
      }
    }
  }

  const getCommentsForPost = (postId: string) => {
    // 模拟获取帖子评论
    const post = posts.value.find((p) => p.id === postId)
    if (post && !post.commentList) {
      // 为没有评论的帖子添加模拟评论数据
      const generateMockComments = (post: SharePost): Comment[] => {
        const mockComments: Comment[] = [
          {
            id: 'comment-1',
            userId: 'user-2',
            username: '专注达人',
            avatar: 'https://ui-avatars.com/api/?name=Focus&background=random',
            content: '太棒了！我也要向你学习这种专注精神。',
            date: new Date(Date.now() - 3600000).toISOString(), // 1小时前
            likes: 5,
            isLiked: false,
          },
          {
            id: 'comment-2',
            userId: 'user-3',
            username: '番茄工作法爱好者',
            avatar: 'https://ui-avatars.com/api/?name=Tomato&background=random',
            content: '这个时长很厉害！能分享一下你的专注技巧吗？',
            date: new Date(Date.now() - 7200000).toISOString(), // 2小时前
            likes: 3,
            isLiked: true,
            replies: [
              {
                id: 'reply-1',
                userId: post.userId,
                username: post.username,
                avatar: post.avatar,
                content: '主要是使用番茄工作法，然后关闭所有干扰项。',
                date: new Date(Date.now() - 6000000).toISOString(), // 1.5小时前
                likes: 2,
                isLiked: false,
              },
            ],
          },
        ]
        return mockComments
      }

      post.commentList = generateMockComments(post)
    }
    return post?.commentList || []
  }

  const addReply = (postId: string, commentId: string, content: string) => {
    // 模拟添加回复
    const post = posts.value.find((p) => p.id === postId)
    if (post && post.commentList) {
      // 查找评论
      const findCommentInTree = (comments: Comment[], id: string): Comment | undefined => {
        for (const comment of comments) {
          if (comment.id === id) {
            return comment
          }
          if (comment.replies) {
            const found = findCommentInTree(comment.replies, id)
            if (found) {
              return found
            }
          }
        }
        return undefined
      }

      const parentComment = findCommentInTree(post.commentList, commentId)
      if (parentComment) {
        // 创建新回复
        const newReply: Comment = {
          id: Date.now().toString(),
          userId: 'current-user',
          username: '当前用户',
          avatar: 'https://ui-avatars.com/api/?name=User&background=random',
          content,
          date: new Date().toISOString(),
          likes: 0,
          isLiked: false,
        }

        // 初始化回复列表
        if (!parentComment.replies) {
          parentComment.replies = []
        }

        // 添加到回复列表开头
        parentComment.replies.unshift(newReply)
        post.comments++
      }
    }
  }

  return {
    // 状态
    posts,
    isLoading,
    isPosting,
    isCommenting,
    error,
    // 操作
    fetchPosts,
    createPost,
    toggleLike,
    addComment,
    toggleCommentLike,
    getCommentsForPost,
    addReply,
  }
})
