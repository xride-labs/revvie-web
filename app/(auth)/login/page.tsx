'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye, EyeOff, Loader2, Shield, Users, Store, Mail, Lock, Check,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@/store/features/user'
import { useAuth } from '@/store/features/auth'
import { useToast } from '@/hooks/use-toast'
import {
  signIn as betterAuthSignIn,
  resolveAuthCallbackURL,
} from '@/lib/auth-client'
import { sendEmailOtp, signInWithEmailOtp } from '@/lib/server/auth'
import { businessApi } from '@/lib/server/business'

const PENDING_BRAND_KEY = 'revvie_pending_brand'

type LoginTab = 'club' | 'brand' | 'admin'
type AuthMode = 'password' | 'otp'
type OtpStep = 'request' | 'verify'

const TAB_CONFIG: Record<LoginTab, {
  label: string
  icon: React.ElementType
  description: string
  redirectTo: string
  roles: string[]
  registerHref: string
  registerLabel: string
  accentClass: string
  activeTabClass: string
  placeholder: string
}> = {
  club: {
    label: 'Club Manager',
    icon: Users,
    description: 'For club owners and organizers',
    redirectTo: '/home',
    roles: ['CLUB_OWNER', 'CLUB_ADMIN', 'CLUB_MODERATOR', 'ADMIN', 'CO_ADMIN', 'MODERATOR'],
    registerHref: '/signup',
    registerLabel: 'Register your club',
    accentClass: 'from-neon-green/80 to-neon-green',
    activeTabClass: 'bg-neon-green/10 border border-neon-green/30 text-neon-green',
    placeholder: 'club@revvie.com',
  },
  brand: {
    label: 'Brand Owner',
    icon: Store,
    description: 'For brands & marketplace sellers',
    redirectTo: '/brand/dashboard',
    roles: ['BRAND_OWNER', 'BRAND_ADMIN', 'BRAND_MODERATOR', 'ADMIN', 'CO_ADMIN'],
    registerHref: '/brand-register',
    registerLabel: 'Register your brand',
    accentClass: 'from-amber-500 to-orange-500',
    activeTabClass: 'bg-amber-500/10 border border-amber-500/30 text-amber-400',
    placeholder: 'brand@company.com',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    description: 'Platform administrators only',
    redirectTo: '/admin',
    roles: ['ADMIN', 'CO_ADMIN'],
    registerHref: '',
    registerLabel: '',
    accentClass: 'from-brand-red-light to-brand-red',
    activeTabClass: 'bg-brand-red-light/10 border border-brand-red-light/30 text-brand-red-light',
    placeholder: 'admin@revvie.com',
  },
}

const PORTAL_FEATURES = [
  'Manage riding clubs & member rosters',
  'Run events, challenges & leaderboards',
  'Track rides, stats & group activity',
  'Sell gear on the Revvie marketplace',
]

export default function LoginPage() {
  const router = useRouter()
  const { fetchMe } = useUser()
  const { login } = useAuth()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const [activeTab, setActiveTab] = useState<LoginTab>('club')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('password')
  const [otpStep, setOtpStep] = useState<OtpStep>('request')
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  const tab = TAB_CONFIG[activeTab]

  const fetchUserRoles = async (): Promise<string[]> => {
    try {
      const user = await fetchMe()
      return user?.roles || []
    } catch {
      return []
    }
  }

  const completePendingBrandSetup = async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false
    const raw = localStorage.getItem(PENDING_BRAND_KEY)
    if (!raw) return false
    try {
      const data = JSON.parse(raw)
      await businessApi.createBusiness(data)
      localStorage.removeItem(PENDING_BRAND_KEY)
      return true
    } catch {
      localStorage.removeItem(PENDING_BRAND_KEY)
      return false
    }
  }

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode)
    setOtpStep('request')
    setOtpDigits(Array(6).fill(''))
  }

  // ── Password sign-in ───────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const toastId = loadingToast('Signing you in...', {
      description: 'Verifying credentials and loading your role access.',
    })
    try {
      await login({ email, password })
      const completedBrandSetup = await completePendingBrandSetup()
      const roles = await fetchUserRoles()
      if (completedBrandSetup) {
        successToast('Brand setup complete!', { description: 'Welcome to your brand portal.' })
        router.push('/brand/dashboard?onboarding=1')
        return
      }
      const hasAccess = roles.some((r) => tab.roles.includes(r))
      if (!hasAccess) {
        errorToast('Access denied', { description: `${tab.label} account required.` })
        return
      }
      successToast('Welcome back')
      router.push(tab.redirectTo)
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Invalid email or password', {
        description: 'Please try again.',
      })
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
  }

  // ── OTP: send code ─────────────────────────────────────────────────────────
  const doSendOtp = async () => {
    if (!email) return
    setIsLoading(true)
    const toastId = loadingToast('Sending code...', {
      description: `We'll send a 6-digit code to ${email}`,
    })
    try {
      await sendEmailOtp(email)
      setOtpStep('verify')
      setOtpDigits(Array(6).fill(''))
      setTimeout(() => otpRefs.current[0]?.focus(), 120)
      successToast('Code sent!', { description: `Check ${email} for your sign-in code.` })
    } catch (err) {
      errorToast('Failed to send code', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    await doSendOtp()
  }

  // ── OTP: verify code ───────────────────────────────────────────────────────
  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otp = otpDigits.join('')
    if (otp.length < 6) return
    setIsLoading(true)
    const toastId = loadingToast('Verifying code...', { description: 'Almost there!' })
    try {
      await signInWithEmailOtp(email, otp)
      const completedBrandSetup = await completePendingBrandSetup()
      const roles = await fetchUserRoles()
      if (completedBrandSetup) {
        successToast('Brand setup complete!', { description: 'Welcome to your brand portal.' })
        router.push('/brand/dashboard?onboarding=1')
        return
      }
      const hasAccess = roles.some((r) => tab.roles.includes(r))
      if (!hasAccess) {
        errorToast('Access denied', { description: `${tab.label} account required.` })
        return
      }
      successToast('Welcome back')
      router.push(tab.redirectTo)
    } catch (err) {
      errorToast('Invalid code', {
        description: err instanceof Error ? err.message : 'Please check and try again.',
      })
      setOtpDigits(Array(6).fill(''))
      otpRefs.current[0]?.focus()
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
  }

  // ── OTP digit helpers ──────────────────────────────────────────────────────
  const handleOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = Array(6).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtpDigits(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ── Google ─────────────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const toastId = loadingToast('Connecting to Google...', {
      description: 'You will be redirected to complete authentication.',
    })
    try {
      await betterAuthSignIn.social({
        provider: 'google',
        callbackURL: resolveAuthCallbackURL(tab.redirectTo),
      })
    } catch {
      dismissToast(toastId)
      errorToast('Google sign-in failed', {
        description: 'Please try again or continue with email.',
      })
      setIsLoading(false)
    }
  }

  const pageTitle = otpStep === 'verify' ? 'Check your email' : 'Welcome back'
  const pageSubtitle = otpStep === 'verify'
    ? `We sent a 6-digit code to ${email}`
    : 'Sign in to the Revvie portal'

  return (
    <div className="min-h-screen flex bg-canvas overflow-hidden">

      {/* ── LEFT PANEL: brand identity (desktop only) ── */}
      <aside className="hidden lg:flex flex-col w-[400px] shrink-0 min-h-screen bg-[#050505] border-r border-border relative overflow-hidden">
        {/* Atmospheric glow */}
        <div className="absolute top-1/3 left-0 w-72 h-72 bg-brand-red-light/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-48 h-48 bg-neon-green/6 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col flex-1 items-start justify-center px-12 py-16 relative z-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 mb-16 group">
            <div className="w-11 h-11 rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/revvie-logo.png" alt="Revvie" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-bold text-white tracking-[0.2em] uppercase">Revvie</span>
          </Link>

          {/* Headline */}
          <h1 className="text-[2.4rem] font-bold text-white leading-[1.15] mb-5 tracking-tight">
            The portal for<br />
            <span className="text-brand-red-light">riders who build.</span>
          </h1>
          <p className="text-text-secondary text-[0.95rem] mb-12 leading-relaxed max-w-[280px]">
            Manage clubs, run events, track your community, and sell on the marketplace — all from one dashboard.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {PORTAL_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-neon-green/12 border border-neon-green/25 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-neon-green" />
                </div>
                <span className="text-sm text-text-secondary">{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom hint */}
        <div className="px-12 pb-10 relative z-10">
          <p className="text-xs text-text-secondary/40 leading-relaxed">
            A rider? Download the{' '}
            <span className="text-neon-green font-medium">Revvie mobile app</span>{' '}
            instead — clubs, rides & more in your pocket.
          </p>
        </div>
      </aside>

      {/* ── RIGHT PANEL: auth form ── */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-brand-red-light/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo — hidden on desktop (left panel shows it) */}
          <div className="lg:hidden text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/revvie-logo.png" alt="Revvie" className="w-full h-full object-cover" />
              </div>
              <span className="text-lg font-bold text-white tracking-[0.2em] uppercase">Revvie</span>
            </Link>
          </div>

          {/* ── Card ── */}
          <div className="rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.07] overflow-hidden shadow-atmospheric">
            {/* Top accent line — centered red fade */}
            <div className="h-px bg-linear-to-r from-transparent via-brand-red-light/50 to-transparent" />

            <div className="p-7">
              {/* Page title */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white tracking-wide">{pageTitle}</h2>
                <p className="text-text-secondary text-sm mt-1">{pageSubtitle}</p>
              </div>

              {/* Portal tabs */}
              <div className="flex rounded-2xl bg-canvas p-1 gap-1 mb-6">
                {(Object.keys(TAB_CONFIG) as LoginTab[]).map((key) => {
                  const cfg = TAB_CONFIG[key]
                  const Icon = cfg.icon
                  const isActive = activeTab === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                        isActive ? cfg.activeTabClass : 'text-text-secondary/50 hover:text-text-secondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-text-secondary/50 text-center mb-6">{tab.description}</p>

              {/* Google */}
              <Button
                variant="outline"
                className="w-full h-11 rounded-2xl bg-canvas border border-white/10 text-white/80 hover:bg-[#111] hover:text-white hover:border-white/15 transition-all mb-5"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>

              {/* Divider */}
              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#0a0a0a] px-3 text-xs text-text-secondary/40 uppercase tracking-wider">
                    or with email
                  </span>
                </div>
              </div>

              {/* Auth mode toggle */}
              <div className="flex rounded-xl bg-canvas p-1 gap-1 mb-5">
                {(['password', 'otp'] as AuthMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => switchMode(mode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      authMode === mode
                        ? 'bg-[#161616] text-white border border-white/10 shadow-sm'
                        : 'text-text-secondary/50 hover:text-text-secondary'
                    }`}
                  >
                    {mode === 'password' ? (
                      <><Lock className="w-3.5 h-3.5" />Password</>
                    ) : (
                      <><Mail className="w-3.5 h-3.5" />Magic Code</>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Forms ── */}
              <AnimatePresence mode="wait">
                {/* Password form */}
                {authMode === 'password' && (
                  <motion.form
                    key="password-form"
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={tab.placeholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase">
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
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 transition-colors"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary transition-colors"
                          onClick={() => setShowPassword(!showPassword)}
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
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</>
                      ) : (
                        `Sign In as ${tab.label}`
                      )}
                    </Button>
                  </motion.form>
                )}

                {/* OTP: request */}
                {authMode === 'otp' && otpStep === 'request' && (
                  <motion.form
                    key="otp-request"
                    onSubmit={handleSendOtp}
                    className="space-y-4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="space-y-1.5">
                      <Label htmlFor="otp-email" className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase">
                        Email
                      </Label>
                      <Input
                        id="otp-email"
                        type="email"
                        placeholder={tab.placeholder}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
                      ) : (
                        'Send Sign-In Code'
                      )}
                    </Button>
                  </motion.form>
                )}

                {/* OTP: verify */}
                {authMode === 'otp' && otpStep === 'verify' && (
                  <motion.form
                    key="otp-verify"
                    onSubmit={handleOtpVerify}
                    className="space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="text-center space-y-1">
                      <p className="text-xs text-text-secondary/50 uppercase tracking-wider">Code sent to</p>
                      <p className="text-brand-red-light font-semibold text-sm">{email}</p>
                      <button
                        type="button"
                        onClick={() => setOtpStep('request')}
                        className="text-xs text-text-secondary/40 hover:text-text-secondary underline transition-colors"
                      >
                        Change email
                      </button>
                    </div>

                    {/* OTP boxes — white on dark */}
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigit(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
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
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying…</>
                      ) : (
                        'Verify & Sign In'
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={doSendOtp}
                        disabled={isLoading}
                        className="text-xs text-text-secondary/40 hover:text-text-secondary underline transition-colors disabled:opacity-40"
                      >
                        Didn&apos;t get it? Resend code
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {tab.registerHref && (
                <p className="text-center text-xs text-text-secondary/40 mt-6">
                  New here?{' '}
                  <Link
                    href={tab.registerHref}
                    className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
                  >
                    {tab.registerLabel}
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* Mobile bottom hint */}
          <p className="lg:hidden text-center text-xs text-text-secondary/30 mt-6">
            A rider? Download the{' '}
            <span className="font-medium text-neon-green">Revvie mobile app</span>{' '}
            instead.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
