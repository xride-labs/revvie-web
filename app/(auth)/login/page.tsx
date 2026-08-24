'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/store/features/auth'
import { useLazyGetMyProfileQuery } from '@/features/user/api'
import { useToast } from '@/hooks/use-toast'
import { signIn as betterAuthSignIn, resolveAuthCallbackURL } from '@/lib/auth-client'
import { sendEmailOtp, signInWithEmailOtp } from '@/lib/server/auth'
import { useCreateBusinessMutation } from '@/features/business/api'
import { BrandPanel } from './_components/brand-panel'
import { GoogleSignInButton } from './_components/google-signin-button'
import { PasswordForm } from './_components/password-form'
import { OtpRequestForm } from './_components/otp-request-form'
import { OtpVerifyForm } from './_components/otp-verify-form'
import { PENDING_BRAND_KEY, TAB_CONFIG } from './_lib/constants'
import type { LoginTab, AuthMode, OtpStep } from './_lib/constants'

export default function LoginPage() {
  const router = useRouter()
  const [fetchMe] = useLazyGetMyProfileQuery()
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
  const [createBusiness] = useCreateBusinessMutation()

  const tab = TAB_CONFIG[activeTab]

  const fetchUserRoles = async (): Promise<string[]> => {
    try {
      const { user } = await fetchMe().unwrap()
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
      await createBusiness(data).unwrap()
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
  }

  const finishSignIn = async () => {
    const completedBrandSetup = await completePendingBrandSetup()
    const roles = await fetchUserRoles()
    if (completedBrandSetup) {
      successToast('Brand setup complete!', {
        description: 'Welcome to your brand portal.',
      })
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
      await finishSignIn()
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
  const handleOtpVerify = async (otp: string) => {
    setIsLoading(true)
    const toastId = loadingToast('Verifying code...', { description: 'Almost there!' })
    try {
      await signInWithEmailOtp(email, otp)
      await finishSignIn()
    } catch (err) {
      errorToast('Invalid code', {
        description: err instanceof Error ? err.message : 'Please check and try again.',
      })
    } finally {
      dismissToast(toastId)
      setIsLoading(false)
    }
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
  const pageSubtitle =
    otpStep === 'verify'
      ? `We sent a 6-digit code to ${email}`
      : 'Sign in to the Revvie portal'

  return (
    <div className="min-h-screen flex bg-canvas overflow-hidden">
      <BrandPanel />

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
                {}
                <img
                  src="/revvie-logo.png"
                  alt="Revvie"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold text-white tracking-[0.2em] uppercase">
                Revvie
              </span>
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
                        isActive
                          ? cfg.activeTabClass
                          : 'text-text-secondary/50 hover:text-text-secondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-text-secondary/50 text-center mb-6">
                {tab.description}
              </p>

              <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isLoading} />

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
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        Password
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5" />
                        Magic Code
                      </>
                    )}
                  </button>
                ))}
              </div>

              {/* ── Forms ── */}
              <AnimatePresence mode="wait">
                {authMode === 'password' && (
                  <PasswordForm
                    activeTab={activeTab}
                    email={email}
                    onEmailChange={setEmail}
                    password={password}
                    onPasswordChange={setPassword}
                    showPassword={showPassword}
                    onToggleShowPassword={() => setShowPassword((v) => !v)}
                    isLoading={isLoading}
                    onSubmit={handlePasswordSubmit}
                  />
                )}

                {authMode === 'otp' && otpStep === 'request' && (
                  <OtpRequestForm
                    activeTab={activeTab}
                    email={email}
                    onEmailChange={setEmail}
                    isLoading={isLoading}
                    onSubmit={handleSendOtp}
                  />
                )}

                {authMode === 'otp' && otpStep === 'verify' && (
                  <OtpVerifyForm
                    activeTab={activeTab}
                    email={email}
                    isLoading={isLoading}
                    onChangeEmail={() => setOtpStep('request')}
                    onResend={doSendOtp}
                    onVerify={handleOtpVerify}
                  />
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
            <span className="font-medium text-neon-green">Revvie mobile app</span> instead.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
