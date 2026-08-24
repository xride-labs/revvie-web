import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { LoginTab } from '../_lib/constants'
import { TAB_CONFIG } from '../_lib/constants'

export interface OtpVerifyFormHandle {
  reset: () => void
}

export function OtpVerifyForm({
  activeTab,
  email,
  isLoading,
  onChangeEmail,
  onResend,
  onVerify,
}: {
  activeTab: LoginTab
  email: string
  isLoading: boolean
  onChangeEmail: () => void
  onResend: () => void
  onVerify: (code: string) => void
}) {
  const tab = TAB_CONFIG[activeTab]
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  // Auto-focus the first box whenever this form mounts (i.e. right after a code is sent).
  useEffect(() => {
    const timeout = setTimeout(() => otpRefs.current[0]?.focus(), 120)
    return () => clearTimeout(timeout)
  }, [])

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((ch, i) => {
      next[i] = ch
    })
    setOtpDigits(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = otpDigits.join('')
    if (code.length < 6) return
    onVerify(code)
  }

  return (
    <motion.form
      key="otp-verify"
      onSubmit={handleSubmit}
      className="space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.18 }}
    >
      <div className="text-center space-y-1">
        <p className="text-xs text-text-secondary/50 uppercase tracking-wider">
          Code sent to
        </p>
        <p className="text-brand-red-light font-semibold text-sm">{email}</p>
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-xs text-text-secondary/40 hover:text-text-secondary underline transition-colors"
        >
          Change email
        </button>
      </div>

      {/* OTP boxes — white on dark */}
      <div className="flex gap-2 justify-center" onPaste={handlePaste}>
        {otpDigits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              otpRefs.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={isLoading}
            className={`w-11 h-14 text-center text-xl font-bold rounded-xl border text-white focus:outline-none transition-colors disabled:opacity-50 ${
              digit
                ? 'bg-white/[0.06] border-white/30'
                : 'bg-[#0d0d0d] border-white/10 focus:border-white/25'
            }`}
          />
        ))}
      </div>

      <Button
        type="submit"
        className={`w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-linear-to-r ${tab.accentClass} text-white transition-all hover:opacity-90`}
        disabled={isLoading || otpDigits.join('').length < 6}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Verifying…
          </>
        ) : (
          'Verify & Sign In'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          disabled={isLoading}
          className="text-xs text-text-secondary/40 hover:text-text-secondary underline transition-colors disabled:opacity-40"
        >
          Didn&apos;t get it? Resend code
        </button>
      </div>
    </motion.form>
  )
}
