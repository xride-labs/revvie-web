import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import type { UserProfile, Bike } from '@/entities/user/model'

// Domain types now live in entities/. Re-exported so existing importers of this
// module keep working while the RTK Query migration proceeds.
export type { UserProfile, Bike, ClubBadge } from '@/entities/user/model'

interface UserState {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
      state.isAuthenticated = true
      state.error = null
    },
    updateProfileLocal: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.isLoading = false
    },
    clearError: (state) => {
      state.error = null
    },
    logout: (state) => {
      state.profile = null
      state.isAuthenticated = false
      state.error = null
    },
    addBikeLocal: (state, action: PayloadAction<Bike>) => {
      if (state.profile) {
        state.profile.bikes = state.profile.bikes || []
        state.profile.bikes.push(action.payload)
      }
    },
    removeBikeLocal: (state, action: PayloadAction<string>) => {
      if (state.profile) {
        state.profile.bikes = (state.profile.bikes || []).filter(
          (bike) => bike.id !== action.payload,
        )
      }
    },
  },
})

export const {
  setLoading,
  setProfile,
  updateProfileLocal,
  setError,
  clearError,
  logout,
  addBikeLocal,
  removeBikeLocal,
} = userSlice.actions

export default userSlice.reducer
