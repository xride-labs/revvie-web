'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PortalBackdropArt } from '@/components/auth/portal-backdrop-art'
import { Eye, EyeOff, Loader2, Shield, Users, Store, Mail, Lock } from 'lucide-react'
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

const PENDING_BRAND_KEY = 'zoomies_pending_brand'

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
    accentClass: 'from-teal to-teal/70',
    placeholder: 'club@zoomies.com',
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
    placeholder: 'admin@zoomies.com',
  },
}

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

  // After login, check if the user came from brand-register with email
  // verification required. If so, complete the business creation now that
  // a session exists and assign the BRAND_OWNER role.
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

  // ── Password sign-in ──────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const toastId = loadingToast('Signing you in...', {
      description: 'Verifying credentials and loading your role access.',
    })

    try {
      await login({ email, password })

      // Complete any pending brand setup before fetching roles, so the new
      // BRAND_OWNER role is already in the DB when we check access.
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

  // ── OTP: send code (core logic) ──────────────────────────────────────────
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

  // ── OTP: verify code ──────────────────────────────────────────────────────
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

  // ── OTP digit input helpers ───────────────────────────────────────────────
  const handleOtpDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = digit
    setOtpDigits(next)
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
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
    const focusIdx = Math.min(pasted.length, 5)
    otpRefs.current[focusIdx]?.focus()
  }

  // ── Google ────────────────────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden p-4">
      <PortalBackdropArt accent={activeTab === 'admin' ? 'red' : 'teal'} />

      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-brand-red-light/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-teal/10 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-3xl bg-surface/80 backdrop-blur-xl border border-[#444444]/50 shadow-atmospheric overflow-hidden">
          <div className="h-1 bg-linear-to-r from-brand-red-light via-neon-green to-teal" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(200,55,55,0.3)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/zoomies-logo.png" alt="Zoomies" className="w-full h-full object-cover" />
                </div>
              </Link>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
                Welcome back
              </h1>
              <p className="text-text-secondary text-sm mt-2">
                Sign in to the Zoomies portal
              </p>
            </div>

            {/* Portal Tabs */}
            <div className="flex rounded-2xl bg-[#1a1a1a] p-1 gap-1 mb-2">
              {(Object.keys(TAB_CONFIG) as LoginTab[]).map((key) => {
                const cfg = TAB_CONFIG[key]
                const Icon = cfg.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-xs font-medium transition-all ${
                      activeTab === key
                        ? key === 'admin'
                          ? 'bg-linear-to-r from-brand-red-light to-brand-red text-white shadow-md'
                          : key === 'brand'
                          ? 'bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-md'
                          : 'bg-surface text-white shadow-md'
                        : 'text-text-secondary/60 hover:text-text-secondary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-text-secondary/60 text-center mb-6">
              {tab.description}
            </p>

            {/* Google Sign In */}
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white hover:bg-[#252525] hover:text-white transition-colors"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#444444]/50" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-surface/80 px-3 text-xs text-text-secondary/50 uppercase tracking-wider">
                  or continue with email
                </span>
              </div>
            </div>

            {/* Auth method toggle */}
            <div className="flex rounded-xl bg-[#1a1a1a] p-1 gap-1 mb-5">
              {(['password', 'otp'] as AuthMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => switchMode(mode)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    authMode === mode
                      ? 'bg-surface text-white shadow'
                      : 'text-text-secondary/60 hover:text-text-secondary'
                  }`}
                >
                  {mode === 'password' ? (
                    <><Lock className="w-3.5 h-3.5" /> Password</>
                  ) : (
                    <><Mail className="w-3.5 h-3.5" /> Email Code</>
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* ── Password form ── */}
              {authMode === 'password' && (
                <motion.form
                  key="password-form"
                  onSubmit={handlePasswordSubmit}
                  className="space-y-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-secondary text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={tab.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:border-teal/60 focus:ring-teal/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-text-secondary text-sm">Password</Label>
                      <Link href="/forgot-password" className="text-sm text-teal hover:text-teal/80 transition-colors">
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
                        className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:border-teal/60 focus:ring-teal/30 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-white transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full h-12 rounded-2xl font-bold uppercase tracking-wide text-sm bg-linear-to-r ${tab.accentClass} text-white transition-shadow`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
                    ) : (
                      `Sign In as ${tab.label}`
                    )}
                  </Button>
                </motion.form>
              )}

              {/* ── OTP: request step ── */}
              {authMode === 'otp' && otpStep === 'request' && (
                <motion.form
                  key="otp-request"
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="otp-email" className="text-text-secondary text-sm">Email</Label>
                    <Input
                      id="otp-email"
                      type="email"
                      placeholder={tab.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:border-teal/60 focus:ring-teal/30"
                    />
                  </div>
                  <p className="text-xs text-text-secondary/50">
                    We&apos;ll send a 6-digit sign-in code to your email. No password needed.
                  </p>
                  <Button
                    type="submit"
                    className={`w-full h-12 rounded-2xl font-bold uppercase tracking-wide text-sm bg-linear-to-r ${tab.accentClass} text-white transition-shadow`}
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                    ) : (
                      'Send Sign-In Code'
                    )}
                  </Button>
                </motion.form>
              )}

              {/* ── OTP: verify step ── */}
              {authMode === 'otp' && otpStep === 'verify' && (
                <motion.form
                  key="otp-verify"
                  onSubmit={handleOtpVerify}
                  className="space-y-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center space-y-1">
                    <p className="text-sm text-text-secondary">Code sent to</p>
                    <p className="text-teal font-semibold text-sm">{email}</p>
                    <button
                      type="button"
                      onClick={() => setOtpStep('request')}
                      className="text-xs text-text-secondary/50 hover:text-text-secondary underline transition-colors"
                    >
                      Change email
                    </button>
                  </div>

                  {/* 6-digit OTP boxes */}
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
                        className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-[#1a1a1a] border border-[#444444]/50 text-white focus:border-teal/60 focus:ring-1 focus:ring-teal/30 focus:outline-none transition-colors disabled:opacity-50"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className={`w-full h-12 rounded-2xl font-bold uppercase tracking-wide text-sm bg-linear-to-r ${tab.accentClass} text-white transition-shadow`}
                    disabled={isLoading || otpDigits.join('').length < 6}
                  >
                    {isLoading ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
                    ) : (
                      'Verify & Sign In'
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={doSendOtp}
                      disabled={isLoading}
                      className="text-xs text-text-secondary/50 hover:text-teal transition-colors disabled:opacity-40"
                    >
                      Didn&apos;t get it? Resend code
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {tab.registerHref && (
              <p className="text-center text-sm text-text-secondary/60 mt-6">
                New here?{' '}
                <Link href={tab.registerHref} className="text-teal font-medium hover:text-teal/80 transition-colors">
                  {tab.registerLabel}
                </Link>
              </p>
            )}

            <p className="text-center text-xs text-text-secondary/40 mt-4">
              Riders? Download the{' '}
              <span className="font-medium text-neon-green">Zoomies mobile app</span>{' '}
              instead.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
