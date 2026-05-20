import { apiAuthenticated } from '../base'
import type { Post, PostType } from '@/store/slices/feedSlice'

// Re-export types from slice
export type { Post, PostType }

export interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
  }
  createdAt: string
}

export interface CreatePostData {
  content: string
  type?: PostType
  images?: string[]
  clubId?: string
  isAnnouncement?: boolean
  isPinned?: boolean
  expiresAt?: string | null
}

export interface GetFeedParams {
  page?: number
  clubId?: string
}

export interface CreateReportData {
  type: 'post' | 'comment' | 'ride' | 'club' | 'listing' | 'user' | 'message'
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  reportedItemId: string
  reportedItemType?: string
}

// ============ Feed API ============

/**
 * Get feed posts — optionally scoped to a club
 */
export async function getFeed(params: GetFeedParams | number = 1): Promise<{ posts: Post[]; hasMore: boolean }> {
  const page = typeof params === 'number' ? params : (params.page ?? 1)
  const clubId = typeof params === 'object' ? params.clubId : undefined
  const qs = new URLSearchParams({ page: String(page) })
  if (clubId) qs.set('clubId', clubId)
  return apiAuthenticated.get<{ posts: Post[]; hasMore: boolean }>(`/feed?${qs}`)
}

/**
 * Get a single post by ID
 */
export async function getPost(postId: string): Promise<Post> {
  return apiAuthenticated.get<Post>(`/posts/${postId}`)
}

/**
 * Create a new post
 */
export async function createPost(data: CreatePostData): Promise<Post> {
  return apiAuthenticated.post<Post>('/posts', data)
}

/**
 * Update a post
 */
export async function updatePost(
  postId: string,
  data: Partial<CreatePostData>,
): Promise<Post> {
  return apiAuthenticated.patch<Post>(`/posts/${postId}`, data)
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/posts/${postId}`)
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<void> {
  return apiAuthenticated.post<void>(`/posts/${postId}/like`)
}

/**
 * Unlike a post
 */
export async function unlikePost(postId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/posts/${postId}/like`)
}

/**
 * Save a post
 */
export async function savePost(postId: string): Promise<void> {
  return apiAuthenticated.post<void>(`/posts/${postId}/save`)
}

/**
 * Unsave a post
 */
export async function unsavePost(postId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/posts/${postId}/save`)
}

/**
 * Get comments on a post
 */
export async function getComments(
  postId: string,
  page = 1,
): Promise<{ comments: Comment[]; hasMore: boolean }> {
  return apiAuthenticated.get<{ comments: Comment[]; hasMore: boolean }>(
    `/posts/${postId}/comments?page=${page}`,
  )
}

/**
 * Add a comment to a post
 */
export async function addComment(postId: string, content: string): Promise<Comment> {
  return apiAuthenticated.post<Comment>(`/posts/${postId}/comments`, {
    content,
  })
}

/**
 * Delete a comment
 */
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/posts/${postId}/comments/${commentId}`)
}

/**
 * Get posts by a specific user
 */
export async function getUserPosts(
  userId: string,
  page = 1,
): Promise<{ posts: Post[]; hasMore: boolean }> {
  return apiAuthenticated.get<{ posts: Post[]; hasMore: boolean }>(
    `/users/${userId}/posts?page=${page}`,
  )
}

/**
 * Submit a moderation report for user-generated content.
 */
export async function submitReport(data: CreateReportData): Promise<{
  id: string
  status: string
}> {
  return apiAuthenticated.post<{ id: string; status: string }>('/feed/reports', data)
}

// Export all as feedApi object
export const feedApi = {
  getFeed,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  savePost,
  unsavePost,
  getComments,
  addComment,
  deleteComment,
  getUserPosts,
  submitReport,
}
