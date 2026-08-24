'use client'

import '@aejkatappaja/phantom-ui'
import type { ReactNode } from 'react'

declare module 'react' {
  // Module augmentation of React's JSX namespace is the only way to type a custom
  // element; there is no ES-module equivalent to reach into it.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'phantom-ui': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        loading?: boolean
        animation?: string
        reveal?: number
        stagger?: number
        duration?: number
        count?: number
        debug?: boolean
      }
    }
  }
}

interface PhantomLoaderProps {
  loading: boolean
  children: ReactNode
  animation?: string
  reveal?: number
}

export function PhantomLoader({
  loading,
  children,
  animation = 'shimmer',
  reveal = 0.2,
}: PhantomLoaderProps) {
  return (
    <phantom-ui loading={loading || undefined} animation={animation} reveal={reveal}>
      {children}
    </phantom-ui>
  )
}
