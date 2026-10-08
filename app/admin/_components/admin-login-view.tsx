'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Terminal,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/store/features/auth'
import { useLazyGetMyProfileQuery } from '@/features/user/api'
import { useToast } from '@/hooks/use-toast'
import { signIn as betterAuthSignIn, resolveAuthCallbackURL } from '@/lib/auth-client'
import { sendEmailOtp, signInWithEmailOtp } from '@/lib/server/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ADMIN_ROLES } from '@/core/auth/roles'

type AdminAuthMode = 'password' | 'otp'
type AdminOtpStep = 'request' | 'verify'

export function AdminLoginView() {
  const router = useRouter()
  const [fetchMe] = useLazyGetMyProfileQuery()
  const { login } = useAuth()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<AdminAuthMode>('password')
  const [otpStep, setOtpStep] = useState<AdminOtpStep>('request')

  // OTP inputs state
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''))
  const otpRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null))

  useEffect(() => {
    if (otpStep === 'verify') {
      const timeout = setTimeout(() => otpRefs.current[0]?.focus(), 150)
      return () => clearTimeout(timeout)
    }
  }, [otpStep])

  const verifyAdminAccess = async (): Promise<boolean> => {
    try {
      const result = await fetchMe().unwrap()
      const roles: string[] = (result?.user?.roles || []).map((r: string) => r.toUpperCase())
      return roles.some((role) => (ADMIN_ROLES as readonly string[]).includes(role))
    } catch {
      return false
    }
  }

  const completeAdminSignIn = async () => {
    const hasAdminAccess = await verifyAdminAccess()
    if (!hasAdminAccess) {
      errorToast('Access Denied', {
        description: 'This account does not have administrative clearance.',
      })
      return
    }

    successToast('Access Granted', {
      description: 'Welcome to the Revvie Admin Command Center.',
    })
    // Hard refresh/navigation so server layout re-evaluates the session cookie
    router.replace('/admin')
  }

  // ── Password Submit ────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsLoading(true)
    const toastId = loadingToast('Authenticating operator...', {
      description: 'Verifying credentials against security policy.',
    })

    try {
      await login({ email: email.trim(), password })
      await completeAdminSignIn()
    } catch (err: unknown) {
      errorToast(err instanceof Error ? err.message : 'Invalid operator credentials', {
        description: 'Verify your administrative email and password.',
      })
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
  }

  // ── OTP Request ───────────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    const toastId = loadingToast('Dispatching verification code...', {
      description: `Sending one-time security code to ${email}`,
    })

    try {
      await sendEmailOtp(email.trim())
      setOtpStep('verify')
      setOtpDigits(Array(6).fill(''))
      successToast('Code Dispatched', {
        description: `Check ${email} for your 6-digit administrative code.`,
      })
    } catch (err: unknown) {
      errorToast('Failed to send code', {
        description: err instanceof Error ? err.message : 'Please check the address and try again.',
      })
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
  }

  // ── OTP Verification ──────────────────────────────────────────────────────
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const code = otpDigits.join('')
    if (code.length < 6) return

    setIsLoading(true)
    const toastId = loadingToast('Validating security code...', {
      description: 'Checking cryptographic session validity.',
    })

    try {
      await signInWithEmailOtp(email.trim(), code)
      await completeAdminSignIn()
    } catch (err: unknown) {
      errorToast('Invalid Security Code', {
        description: err instanceof Error ? err.message : 'The code is invalid or has expired.',
      })
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
  }

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1)
    const next = [...otpDigits]
    next[index] = clean
    setOtpDigits(next)

    if (clean && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleDigitPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const next = Array(6).fill('')
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i]
    }
    setOtpDigits(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ── Google Workspace Sign-In ──────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const toastId = loadingToast('Connecting to Google Workspace...', {
      description: 'Authorizing through organizational SSO.',
    })

    try {
      await betterAuthSignIn.social({
        provider: 'google',
        callbackURL: resolveAuthCallbackURL('/admin'),
        errorCallbackURL: resolveAuthCallbackURL('/admin'),
      })
    } catch {
      dismissToast(toastId)
      errorToast('SSO Authorization Failed', {
        description: 'Please try again or use your administrative email.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#050505] text-white selection:bg-brand-red selection:text-white">
      {/* ── LEFT HALF: Terminal & Infrastructure Identity ── */}
      <aside className="hidden lg:flex flex-col justify-between w-full min-h-screen bg-[#030303] border-r border-white/[0.08] relative overflow-hidden px-12 xl:px-20 py-16">
        {/* Deep ambient red aura */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-red-light/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-red-950/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-red to-red-900 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-950/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-[0.2em] uppercase text-white">
                  Revvie
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-brand-red-light/20 text-brand-red-light border border-brand-red-light/30">
                  Internal
                </span>
              </div>
              <p className="text-xs text-text-secondary/60 font-mono tracking-wide">
                OPERATIONAL SECURITY CONSOLE
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Hero Identity */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-text-secondary mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span>ENCRYPTED OPERATOR GATEWAY</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            Restricted Admin
            <br />
            <span className="bg-linear-to-r from-brand-red-light via-rose-500 to-primary bg-clip-text text-transparent">
              Command Center.
            </span>
          </h1>

          <p className="text-text-secondary text-base leading-relaxed mb-10">
            Dedicated administrative portal for platform governance, rider safety telemetry,
            membership verification, and marketplace compliance monitoring.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-6 h-6 rounded-lg bg-brand-red-light/10 border border-brand-red-light/30 flex items-center justify-center shrink-0 mt-0.5">
                <Terminal className="w-3.5 h-3.5 text-brand-red-light" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide uppercase">
                  Role-Enforced Infrastructure
                </p>
                <p className="text-xs text-text-secondary/70 mt-0.5">
                  Access requires explicit assignment of Super Administrator, Administrator, or Moderator privileges.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-6 h-6 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide uppercase">
                  Cryptographic Session Auditing
                </p>
                <p className="text-xs text-text-secondary/70 mt-0.5">
                  Every console action, record mutation, and policy update is logged in immutable audit streams.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Warning banner */}
        <div className="relative z-10 pt-6 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 text-xs text-text-secondary/50 font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-primary/80 shrink-0" />
            <span>Notice: Unauthorized access attempts are monitored and logged to SIEM.</span>
          </div>
        </div>
      </aside>

      {/* ── RIGHT HALF: Operator Login Form ── */}
      <main className="w-full flex items-center justify-center p-6 sm:p-10 xl:p-16 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-brand-red-light/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-2">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-brand-red to-red-900 border border-red-500/30 flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-[0.2em] uppercase text-white">
                Revvie
              </span>
            </div>
            <p className="text-xs text-brand-red-light font-mono font-semibold uppercase tracking-wider">
              Admin Console Gateway
            </p>
          </div>

          {/* ── Auth Card ── */}
          <div className="rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
            {/* Top crimson glowing accent line */}
            <div className="h-0.5 bg-linear-to-r from-transparent via-brand-red-light to-transparent" />

            <div className="p-7 sm:p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-2 h-2 rounded-full bg-brand-red-light animate-ping" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-red-light">
                    Restricted Area
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {otpStep === 'verify' ? 'Verify Security Code' : 'Admin Sign In'}
                </h2>
                <p className="text-text-secondary text-sm mt-1">
                  {otpStep === 'verify'
                    ? `One-time authorization code sent to ${email}`
                    : 'Authenticate to access the administrative dashboard'}
                </p>
              </div>

              {/* Google Workspace Button */}
              {otpStep !== 'verify' && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 text-white font-medium text-xs uppercase tracking-wider transition-all disabled:opacity-50 mb-5 group cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign in with Google Workspace</span>
                  </button>

                  {/* Divider */}
                  <div className="relative mb-5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/[0.08]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#0a0a0a] px-3 text-[11px] text-text-secondary/50 uppercase tracking-widest font-mono">
                        or operator credentials
                      </span>
                    </div>
                  </div>

                  {/* Auth Mode Toggle */}
                  <div className="flex rounded-xl bg-[#111111] p-1 gap-1 mb-5 border border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setAuthMode('password')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold tracking-wider uppercase transition-all ${
                        authMode === 'password'
                          ? 'bg-brand-red text-white shadow-md'
                          : 'text-text-secondary/60 hover:text-white'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Password
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('otp')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-semibold tracking-wider uppercase transition-all ${
                        authMode === 'otp'
                          ? 'bg-brand-red text-white shadow-md'
                          : 'text-text-secondary/60 hover:text-white'
                      }`}
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      Magic Code
                    </button>
                  </div>
                </>
              )}

              {/* ── FORMS ── */}
              <AnimatePresence mode="wait">
                {/* 1. Password Mode */}
                {authMode === 'password' && otpStep !== 'verify' && (
                  <motion.form
                    key="admin-password-form"
                    onSubmit={handlePasswordSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="admin-email"
                        className="text-text-secondary/80 text-[11px] font-mono uppercase tracking-wider"
                      >
                        Administrative Email
                      </Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@revvie.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder:text-white/20 focus:border-brand-red focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label
                          htmlFor="admin-password"
                          className="text-text-secondary/80 text-[11px] font-mono uppercase tracking-wider"
                        >
                          Password
                        </Label>
                        <Link
                          href="/forgot-password"
                          className="text-xs text-text-secondary/40 hover:text-white transition-colors underline underline-offset-2"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="admin-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          disabled={isLoading}
                          className="h-11 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder:text-white/20 focus:border-brand-red focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 transition-colors"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary transition-colors"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || !email || !password}
                      className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-linear-to-r from-brand-red-light to-brand-red text-white hover:opacity-90 transition-all shadow-lg shadow-red-950/50 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Authenticating…
                        </>
                      ) : (
                        <>
                          <span>Authenticate & Enter</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}

                {/* 2. OTP Request Mode */}
                {authMode === 'otp' && otpStep === 'request' && (
                  <motion.form
                    key="admin-otp-request-form"
                    onSubmit={handleSendOtp}
                    className="space-y-4"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="admin-otp-email"
                        className="text-text-secondary/80 text-[11px] font-mono uppercase tracking-wider"
                      >
                        Administrative Email
                      </Label>
                      <Input
                        id="admin-otp-email"
                        type="email"
                        placeholder="admin@revvie.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                        className="h-11 rounded-xl bg-[#0e0e0e] border border-white/10 text-white placeholder:text-white/20 focus:border-brand-red focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                      />
                    </div>
                    <p className="text-xs text-text-secondary/50 leading-relaxed font-mono">
                      A 6-digit cryptographic verification code will be dispatched to your registered address.
                    </p>
                    <Button
                      type="submit"
                      disabled={isLoading || !email}
                      className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-linear-to-r from-brand-red-light to-brand-red text-white hover:opacity-90 transition-all shadow-lg shadow-red-950/50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Dispatching Code…
                        </>
                      ) : (
                        'Send Administrative Code'
                      )}
                    </Button>
                  </motion.form>
                )}

                {/* 3. OTP Verify Mode */}
                {otpStep === 'verify' && (
                  <motion.form
                    key="admin-otp-verify-form"
                    onSubmit={handleVerifyOtp}
                    className="space-y-5"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.16 }}
                  >
                    <div className="text-center space-y-1">
                      <p className="text-xs text-text-secondary/50 font-mono uppercase tracking-wider">
                        Code Dispatched To
                      </p>
                      <p className="text-brand-red-light font-semibold text-sm">{email}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpStep('request')
                          setOtpDigits(Array(6).fill(''))
                        }}
                        className="text-xs text-text-secondary/40 hover:text-white underline transition-colors"
                      >
                        Change address
                      </button>
                    </div>

                    {/* 6 Digits Boxes */}
                    <div className="flex gap-2 justify-center" onPaste={handleDigitPaste}>
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
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleDigitKeyDown(i, e)}
                          disabled={isLoading}
                          className={`w-11 h-14 text-center text-xl font-bold rounded-xl border text-white focus:outline-none transition-colors disabled:opacity-50 font-mono ${
                            digit
                              ? 'bg-brand-red-light/10 border-brand-red-light/50'
                              : 'bg-[#0e0e0e] border-white/10 focus:border-brand-red'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading || otpDigits.join('').length < 6}
                      className="w-full h-11 rounded-xl font-bold uppercase tracking-widest text-xs bg-linear-to-r from-brand-red-light to-brand-red text-white hover:opacity-90 transition-all shadow-lg shadow-red-950/50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Validating…
                        </>
                      ) : (
                        'Verify & Enter Console'
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="text-xs text-text-secondary/40 hover:text-white underline transition-colors disabled:opacity-40"
                      >
                        Didn&apos;t receive code? Resend
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* No Register Notice — Strictly restricted */}
              <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
                <p className="text-[11px] font-mono text-text-secondary/40">
                  Revvie Security Clearance Level 4 • No public registration
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
