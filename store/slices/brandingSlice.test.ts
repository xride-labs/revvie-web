import { describe, it, expect } from 'vitest'
import brandingReducer, {
  setBrandingTokens,
  resetBrandingTokens,
  DEFAULT_BRANDING,
  selectBranding,
  selectBrandColors,
} from './brandingSlice'

describe('brandingSlice', () => {
  it('returns DEFAULT_BRANDING as initial state', () => {
    const state = brandingReducer(undefined, { type: 'unknown' })
    expect(state.current).toEqual(DEFAULT_BRANDING)
    expect(state.isLoading).toBe(false)
  })

  it('updates branding tokens via setBrandingTokens', () => {
    const customBranding = {
      ...DEFAULT_BRANDING,
      siteName: 'CustomRevvie',
      primaryColor: '#00ffcc',
    }
    const state = brandingReducer(undefined, setBrandingTokens(customBranding))
    expect(state.current.siteName).toBe('CustomRevvie')
    expect(state.current.primaryColor).toBe('#00ffcc')
  })

  it('resets branding tokens via resetBrandingTokens', () => {
    const customBranding = {
      ...DEFAULT_BRANDING,
      siteName: 'CustomRevvie',
    }
    const modifiedState = brandingReducer(undefined, setBrandingTokens(customBranding))
    const resetState = brandingReducer(modifiedState, resetBrandingTokens())
    expect(resetState.current).toEqual(DEFAULT_BRANDING)
  })

  it('selectors read branding and brand colors correctly', () => {
    const rootState = {
      branding: {
        current: {
          ...DEFAULT_BRANDING,
          primaryColor: '#123456',
          deepColor: '#654321',
        },
        isLoading: false,
        error: null,
      },
    }
    expect(selectBranding(rootState).primaryColor).toBe('#123456')
    expect(selectBrandColors(rootState)).toEqual({
      primary: '#123456',
      deep: '#654321',
      canvas: DEFAULT_BRANDING.canvasColor,
      surface: DEFAULT_BRANDING.surfaceColor,
      border: DEFAULT_BRANDING.borderColor,
    })
  })
})
