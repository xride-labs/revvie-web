import { describe, it, expect } from 'vitest'
import userReducer, {
  setProfile,
  updateProfileLocal,
  logout,
  addBikeLocal,
  removeBikeLocal,
} from './userSlice'
import type { UserProfile } from '@/entities/user/model'

/** Minimal valid profile — only the fields these reducer tests actually assert on. */
function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'u1',
    name: 'Rider One',
    username: 'rider1',
    avatar: null,
    coverImage: null,
    bio: null,
    location: null,
    bloodType: null,
    bikes: [],
    clubs: [],
    badges: [],
    ridesCompleted: 0,
    roles: [],
    onboardingCompleted: false,
    ...overrides,
  }
}

describe('web userSlice', () => {
  const initial = {
    profile: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
  }

  it('should handle setProfile', () => {
    const mockProfile = makeProfile()
    const state = userReducer(initial, setProfile(mockProfile))
    expect(state.profile).toEqual(mockProfile)
    expect(state.isAuthenticated).toBe(true)
  })

  it('should handle updateProfileLocal', () => {
    const startState = {
      profile: makeProfile({ name: 'Original', bio: 'Rider' }),
      isLoading: false,
      error: null,
      isAuthenticated: true,
    }
    const state = userReducer(startState, updateProfileLocal({ name: 'Updated Name' }))
    expect(state.profile?.name).toBe('Updated Name')
    expect(state.profile?.bio).toBe('Rider')
  })

  it('should handle addBikeLocal and removeBikeLocal', () => {
    const startState = {
      profile: makeProfile(),
      isLoading: false,
      error: null,
      isAuthenticated: true,
    }

    const newBike = {
      id: 'b1',
      make: 'Royal Enfield',
      model: 'Himalayan 450',
      year: 2024,
    }

    const added = userReducer(startState, addBikeLocal(newBike))
    expect(added.profile?.bikes).toHaveLength(1)
    expect(added.profile?.bikes?.[0].model).toBe('Himalayan 450')

    const removed = userReducer(added, removeBikeLocal('b1'))
    expect(removed.profile?.bikes).toHaveLength(0)
  })

  it('should handle logout', () => {
    const startState = {
      profile: makeProfile(),
      isLoading: false,
      error: null,
      isAuthenticated: true,
    }

    const state = userReducer(startState, logout())
    expect(state.profile).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })
})
