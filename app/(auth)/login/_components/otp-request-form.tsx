import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import type { LoginTab } from '../_lib/constants'
import { TAB_CONFIG } from '../_lib/constants'

export function OtpRequestForm({
  activeTab,
  email,
  onEmailChange,
  isLoading,
  onSubmit,
}: {
  activeTab: LoginTab
  email: string
  onEmailChange: (value: string) => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  const tab = TAB_CONFIG[activeTab]

  return (
    <motion.form
      key="otp-request"
      onSubmit={onSubmit}
      className="space-y-4"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.18 }}
    >
      <div className="space-y-1.5">
        <Label
          htmlFor="otp-email"
          className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
        >
          Email
        </Label>
        <Input
          id="otp-email"
          type="email"
          placeholder={tab.placeholder}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={isLoading}
          className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
        />
      </div>
      <p className="text-xs text-text-secondary/40 leading-relaxed">
        We&apos;ll send a 6-digit sign-in code. No password needed.
      </p>
      <Button
        type="submit"
        className={`w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-linear-to-r ${tab.accentClass} text-white transition-all hover:opacity-90`}
        disabled={isLoading || !email}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending…
          </>
        ) : (
          'Send Sign-In Code'
        )}
      </Button>
    </motion.form>
  )
}
