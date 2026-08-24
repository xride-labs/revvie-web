'use client'

import { useState, type ReactNode } from 'react'
import { Provider } from 'react-redux'

import { makeStore, type AppStore } from './make-store'

/**
 * Mounts a per-request store.
 *
 * Rendered once per request on the server and possibly re-rendered many times on the
 * client — the lazy `useState` initializer is what guarantees a single instance either
 * way. `useRef` would be wrong here: React forbids reading a ref during render, and this
 * value is needed *in* render.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState<AppStore>(makeStore)

  return <Provider store={store}>{children}</Provider>
}
