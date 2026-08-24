// Re-export base utilities
export { apiAuthenticated, apiUnauthenticated } from './base'
export type { ApiResponse, PaginatedResponse, ApiError } from './base'

// Re-export auth API
export * from './auth'
export { authApi } from './auth'

// Re-export friend groups API
export * from './friend-groups'
export { friendGroupsApi } from './friend-groups'
