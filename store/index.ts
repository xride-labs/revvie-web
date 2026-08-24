/**
 * Transitional barrel.
 *
 * Store infrastructure moved to `core/store/`; the thunk-based `features/` and `slices/`
 * modules here are replaced feature-by-feature during the RTK Query migration. New code
 * should import from `@/core/store/*` and `@/features/<domain>/api` directly.
 */
export { makeStore } from '@/core/store/make-store'
export type { AppStore, RootState, AppDispatch } from '@/core/store/make-store'
export { StoreProvider } from '@/core/store/store-provider'
export { useAppDispatch, useAppSelector, useAppStore } from '@/core/store/hooks'

export * from './features'
