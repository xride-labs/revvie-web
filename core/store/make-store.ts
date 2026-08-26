import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import userReducer from '@/store/slices/userSlice'

import {
  ALL_APIS,
  adminApi,
  businessApi,
  clubsApi,
  feedApi,
  marketplaceApi,
  mediaApi,
  ridesApi,
  userApi,
  eventsApi,
} from './api/services'

/**
 * A **factory**, never a singleton.
 *
 * A module-level `configureStore()` is evaluated once per server process and therefore
 * shared by every concurrent request. Whatever the first request dispatches — a session,
 * a club roster, an admin user list — stays in that store and renders into the next
 * visitor's HTML. `StoreProvider` calls this once per request instead.
 *
 * `userReducer` is the one remaining slice: `store/features/auth`'s selectors read
 * session state (`isAuthenticated`, `profile`, ...) directly off `state.user`, so it
 * stays even though the thunk-based data layer it used to belong to (clubs/feed/user
 * thunks) has been fully replaced by the RTK Query APIs above.
 */

const rootReducer = combineReducers({
  [clubsApi.reducerPath]: clubsApi.reducer,
  [ridesApi.reducerPath]: ridesApi.reducer,
  [marketplaceApi.reducerPath]: marketplaceApi.reducer,
  [feedApi.reducerPath]: feedApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [businessApi.reducerPath]: businessApi.reducer,
  [mediaApi.reducerPath]: mediaApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
  [eventsApi.reducerPath]: eventsApi.reducer,

  user: userReducer,
})

export function makeStore() {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(ALL_APIS.map((api) => api.middleware)),
    devTools: process.env.NODE_ENV !== 'production',
  })

  // Enables refetchOnFocus / refetchOnReconnect for endpoints that opt in.
  setupListeners(store.dispatch)

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
