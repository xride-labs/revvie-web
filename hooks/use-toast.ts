import { toast as sonnerToast } from 'sonner'
import type { ExternalToast } from 'sonner'
import { ReactNode, createElement } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'

interface CustomToastOptions extends ExternalToast {
  description?: ReactNode
  icon?: ReactNode
  id?: string | number
}

function showToast(
  message: string | ReactNode,
  type: ToastType = 'default',
  options?: CustomToastOptions,
) {
  const baseOptions: ExternalToast = { ...options }

  // Set default icons based on the toast type if none is provided via options
  if (!baseOptions.icon) {
    switch (type) {
      case 'success':
        baseOptions.icon = createElement(CheckCircle2, {
          className: 'w-5 h-5 text-green-500',
        })
        break
      case 'error':
        baseOptions.icon = createElement(XCircle, { className: 'w-5 h-5 text-red-500' })
        break
      case 'warning':
        baseOptions.icon = createElement(AlertCircle, {
          className: 'w-5 h-5 text-yellow-500',
        })
        break
      case 'info':
        baseOptions.icon = createElement(Info, { className: 'w-5 h-5 text-blue-500' })
        break
      case 'loading':
        baseOptions.icon = createElement(Loader2, {
          className: 'w-5 h-5 text-muted-foreground animate-spin',
        })
        break
    }
  }

  switch (type) {
    case 'success':
      return sonnerToast.success(message, baseOptions)
    case 'error':
      return sonnerToast.error(message, baseOptions)
    case 'warning':
      return sonnerToast.warning(message, baseOptions)
    case 'info':
      return sonnerToast.info(message, baseOptions)
    case 'loading':
      return sonnerToast.loading(message, {
        ...baseOptions,
        // usually loading toasts don't auto-dismiss
        duration: Infinity,
      })
    default:
      return sonnerToast(message, baseOptions)
  }
}

/**
 * Defined once at module scope, not rebuilt per render.
 *
 * Callers put these functions in `useCallback`/`useEffect` dependency arrays. If the hook
 * returned fresh closures each render, every one of those deps would change on every
 * render and the effect would re-run forever. Nothing here closes over component state,
 * so a single frozen object is correct.
 */
const toastApi = Object.freeze({
  toast: (message: string | ReactNode, options?: CustomToastOptions) =>
    showToast(message, 'default', options),
  success: (message: string | ReactNode, options?: CustomToastOptions) =>
    showToast(message, 'success', options),
  error: (message: string | ReactNode, options?: CustomToastOptions) =>
    showToast(message, 'error', options),
  warning: (message: string | ReactNode, options?: CustomToastOptions) =>
    showToast(message, 'warning', options),
  info: (message: string | ReactNode, options?: CustomToastOptions) =>
    showToast(message, 'info', options),
  loading: (message: string | ReactNode, options?: CustomToastOptions) =>
    showToast(message, 'loading', options),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
})

/**
 * A centralized custom toast hook wrapping Sonner.
 * Allows easy dynamic configurations of titles, descriptions, icons, and colors.
 */
export function useToast() {
  return toastApi
}
