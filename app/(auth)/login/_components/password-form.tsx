import Link from 'next/link'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import type { LoginTab } from '../_lib/constants'
import { TAB_CONFIG } from '../_lib/constants'

export function PasswordForm({
  activeTab,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  isLoading,
  onSubmit,
}: {
  activeTab: LoginTab
  email: string
  onEmailChange: (value: string) => void
  password: string
  onPasswordChange: (value: string) => void
  showPassword: boolean
  onToggleShowPassword: () => void
  isLoading: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  const tab = TAB_CONFIG[activeTab]

  return (
    <motion.form
      key="password-form"
      onSubmit={onSubmit}
      className="space-y-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.18 }}
    >
      <div className="space-y-1.5">
        <Label
          htmlFor="email"
          className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
        >
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder={tab.placeholder}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={isLoading}
          className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
          >
            Password
          </Label>
          <Link
            href="/forgot-password"
            className="text-xs text-text-secondary/50 hover:text-white transition-colors underline underline-offset-2"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            required
            disabled={isLoading}
            className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 transition-colors"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary transition-colors"
            onClick={onToggleShowPassword}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className={`w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-linear-to-r ${tab.accentClass} text-white transition-all hover:opacity-90 mt-2`}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Signing in…
          </>
        ) : (
          `Sign In as ${tab.label}`
        )}
      </Button>
    </motion.form>
  )
}
