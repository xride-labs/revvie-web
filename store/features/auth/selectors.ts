import type { RootState } from '@/core/store/make-store'

export const selectUser = (state: RootState) => state.user
export const selectUserProfile = (state: RootState) => state.user.profile
export const selectUserLoading = (state: RootState) => state.user.isLoading
export const selectUserError = (state: RootState) => state.user.error
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated
export const selectUserBikes = (state: RootState) => state.user.profile?.bikes ?? []
export const selectUserClubs = (state: RootState) => state.user.profile?.clubs ?? []
