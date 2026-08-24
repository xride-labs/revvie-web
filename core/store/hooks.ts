import { useDispatch, useSelector, useStore } from 'react-redux'

import type { AppDispatch, AppStore, RootState } from './make-store'

/**
 * Pre-typed react-redux hooks. Components should reach for these rather than the raw
 * ones so `RootState` and thunk-aware dispatch types are never re-declared per call site.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()
export const useAppStore = useStore.withTypes<AppStore>()
