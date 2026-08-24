'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { PortalBackdropArt } from '@/components/auth/portal-backdrop-art'
import { Eye, EyeOff, Loader2, Check, Shield } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '@/store/features/auth'
import { useToast } from '@/hooks/use-toast'
import { signIn as betterAuthSignIn, resolveAuthCallbackURL } from '@/lib/auth-client'

export default function SignupPage() {
  const router = useRouter()
  const { register } = useAuth()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
  ]

  const isPasswordValid = passwordRequirements.every((req) => req.met)
  const doPasswordsMatch =
    formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      errorToast('Please meet all password requirements', {
        description: 'Check the requirements list below.',
      })
      return
    }
    if (!doPasswordsMatch) {
      errorToast("Passwords don't match", {
        description: 'Please make sure your passwords match.',
      })
      return
    }
    if (!agreedToTerms) {
      errorToast('Please agree to the terms and conditions', {
        description: 'You must agree before continuing.',
      })
      return
    }

    setIsLoading(true)
    const loadingToastId = loadingToast('Creating your account...', {
      description: 'Setting up your profile and access permissions.',
    })
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })
      successToast('Account created successfully!', {
        description: `Welcome ${formData.name}!`,
      })
      router.push('/home')
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create account', {
        description: 'Please check your information and try again.',
      })
    } finally {
      dismissToast(loadingToastId)
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    const loadingToastId = loadingToast('Connecting to Google...', {
      description: 'You will be redirected to complete authentication.',
    })
    try {
      await betterAuthSignIn.social({
        provider: 'google',
        callbackURL: resolveAuthCallbackURL('/home'),
      })
    } catch {
      dismissToast(loadingToastId)
      errorToast('Google sign-up failed', {
        description: 'Please try again or continue with email signup.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden p-4 py-12">
      <PortalBackdropArt />

      {/* Background decoration */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-neon-green/6 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-brand-red-light/8 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.07] shadow-atmospheric overflow-hidden">
          <div className="h-px bg-linear-to-r from-transparent via-brand-red-light/50 to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-7">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 mb-4"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-border">
                  {}
                  <img
                    src="/revvie-logo.png"
                    alt="Revvie"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
              <h1 className="text-xl font-bold text-white uppercase tracking-widest">
                Create account
              </h1>
              <p className="text-text-secondary/60 text-sm mt-2">
                Join the Revvie portal as a club manager
              </p>
            </div>

            {/* Role notice */}
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/3 p-4 flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/50 shrink-0" />
              <div>
                <p className="text-sm font-medium text-white/80">Club Manager Account</p>
                <p className="text-xs text-text-secondary/50 mt-0.5">
                  Create & manage riding clubs. For marketplace access, use the Revvie
                  mobile app.
                </p>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              variant="outline"
              className="w-full h-11 rounded-2xl bg-canvas border border-white/10 text-white/80 hover:bg-[#111] hover:text-white hover:border-white/15 transition-all mb-5"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
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
                  or continue with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Rider"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="manager@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
                >
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 pr-10 transition-colors"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/40 hover:text-text-secondary transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <ul className="space-y-1 pt-1">
                    {passwordRequirements.map((req, i) => (
                      <li
                        key={i}
                        className={`text-xs flex items-center gap-2 ${req.met ? 'text-neon-green' : 'text-text-secondary/40'}`}
                      >
                        {req.met ? (
                          <Check className="w-3 h-3 shrink-0" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-current shrink-0" />
                        )}
                        {req.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-text-secondary/80 text-xs font-medium tracking-wide uppercase"
                >
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className={`h-11 rounded-xl bg-[#0d0d0d] border text-white placeholder:text-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors ${
                    doPasswordsMatch
                      ? 'border-neon-green/30'
                      : 'border-white/10 focus:border-white/20'
                  }`}
                />
                {formData.confirmPassword.length > 0 && (
                  <p
                    className={`text-xs ${doPasswordsMatch ? 'text-neon-green' : 'text-brand-red-light'}`}
                  >
                    {doPasswordsMatch ? 'Passwords match ✓' : "Passwords don't match"}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-3 pt-1">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  disabled={isLoading}
                  className="border-white/20 data-[state=checked]:bg-brand-red-light data-[state=checked]:border-brand-red-light mt-0.5"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-text-secondary/50 leading-tight cursor-pointer"
                >
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 rounded-xl bg-linear-to-r from-brand-red-light to-brand-red text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all mt-1"
                disabled={
                  isLoading || !isPasswordValid || !doPasswordsMatch || !agreedToTerms
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Create Club Manager Account'
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-text-secondary/40 mt-6">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-white/60 hover:text-white transition-colors underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>

            <p className="text-center text-xs text-text-secondary/30 mt-3">
              A rider? Download the{' '}
              <span className="font-medium text-neon-green">Revvie mobile app</span> to
              start riding.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
