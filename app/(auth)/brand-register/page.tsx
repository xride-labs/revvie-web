'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PortalBackdropArt } from '@/components/auth/portal-backdrop-art'
import { Eye, EyeOff, Loader2, Check, Store, ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'
import { useAuth } from '@/store/features/auth'
import { useToast } from '@/hooks/use-toast'
import { signIn as betterAuthSignIn, resolveAuthCallbackURL } from '@/lib/auth-client'
import { useCreateBusinessMutation } from '@/features/business/api'
import type { BusinessCategory } from '@/entities/business/model'

const BRAND_CATEGORIES = [
  {
    value: 'BRAND',
    label: 'Brand / Manufacturer',
    description: 'Motorcycle brands & OEMs',
  },
  {
    value: 'GEAR_SELLER',
    label: 'Gear & Apparel',
    description: 'Helmets, jackets, gloves, boots',
  },
  {
    value: 'PARTS_SELLER',
    label: 'Parts & Accessories',
    description: 'Motorcycle parts & mods',
  },
  {
    value: 'MARKETPLACE_SELLER',
    label: 'Marketplace Seller',
    description: 'General merchandise',
  },
  {
    value: 'SERVICE_STORE',
    label: 'Service & Repair',
    description: 'Workshops and mechanics',
  },
  {
    value: 'MECHANIC',
    label: 'Independent Mechanic',
    description: 'Freelance technician',
  },
]

type Step = 'account' | 'brand'

export default function BrandRegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const {
    success: successToast,
    error: errorToast,
    loading: loadingToast,
    dismiss: dismissToast,
  } = useToast()

  const [step, setStep] = useState<Step>('account')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    brandName: '',
    category: '',
    tagline: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [createBusiness] = useCreateBusinessMutation()

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One number', met: /[0-9]/.test(formData.password) },
  ]
  const isPasswordValid = passwordRequirements.every((r) => r.met)
  const doPasswordsMatch =
    formData.password === formData.confirmPassword && formData.confirmPassword.length > 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid) {
      errorToast('Weak password', { description: 'Meet all password requirements.' })
      return
    }
    if (!doPasswordsMatch) {
      errorToast('Passwords do not match')
      return
    }
    setStep('brand')
  }

  const PENDING_KEY = 'revvie_pending_brand'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category) {
      errorToast('Select a brand category')
      return
    }
    if (!formData.brandName.trim()) {
      errorToast('Enter your brand name')
      return
    }

    setIsLoading(true)
    const tid = loadingToast('Creating your brand account...', {
      description: 'Setting up your portal access.',
    })
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      // Store the pending brand data so post-login can pick it up if the
      // session isn't established yet (email verification required in prod).
      const pendingData = {
        categories: [formData.category],
        displayName: formData.brandName,
        tagline: formData.tagline || undefined,
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(PENDING_KEY, JSON.stringify(pendingData))
      }

      // Attempt immediate creation. In dev (no email verification) this
      // succeeds and assigns BRAND_OWNER. In prod the session may not exist
      // yet — the login page picks up the localStorage key after verification.
      try {
        await createBusiness({
          categories: [formData.category as BusinessCategory],
          displayName: formData.brandName,
          tagline: formData.tagline || undefined,
        }).unwrap()
        // Success — clear the pending marker since it's no longer needed.
        if (typeof window !== 'undefined') localStorage.removeItem(PENDING_KEY)
        successToast('Brand account created!', {
          description: 'Complete your brand profile in the portal.',
        })
        router.push('/brand/dashboard?onboarding=1')
      } catch {
        // Business creation failed — likely because email verification is
        // required and no session cookie exists yet. The pending data saved
        // above will be consumed by the login page after verification.
        successToast('Account created!', {
          description:
            'Check your email to verify your account, then sign in to complete your brand setup.',
        })
        router.push('/login?pendingBrand=1')
      }
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Registration failed', {
        description: 'Please try again.',
      })
    } finally {
      dismissToast(tid)
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      await betterAuthSignIn.social({
        provider: 'google',
        callbackURL: resolveAuthCallbackURL('/brand/dashboard?onboarding=1'),
      })
    } catch {
      errorToast('Google sign-in failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden p-4">
      <PortalBackdropArt />

      <motion.div
        className="absolute top-20 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 9, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="rounded-3xl bg-surface/80 backdrop-blur-xl border border-[#444444]/50 shadow-atmospheric overflow-hidden">
          <div className="h-1 bg-linear-to-r from-amber-500 via-orange-500 to-amber-400" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Store className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
                Register Your Brand
              </h1>
              <p className="text-text-secondary text-sm mt-2">
                Sell on Revvie marketplace &amp; reach riders
              </p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              <div
                className={`flex-1 h-1 rounded-full transition-colors ${step === 'account' || step === 'brand' ? 'bg-amber-500' : 'bg-[#333]'}`}
              />
              <div
                className={`flex-1 h-1 rounded-full transition-colors ${step === 'brand' ? 'bg-amber-500' : 'bg-[#333]'}`}
              />
            </div>

            {step === 'account' ? (
              <>
                {/* Google Sign Up */}
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white hover:bg-[#252525] hover:text-white mb-4"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
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
                  Sign up with Google
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#444444]/50" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-surface/80 px-3 text-xs text-text-secondary/50 uppercase tracking-wider">
                      or with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-text-secondary text-sm">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-text-secondary text-sm">
                      Business Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="you@brand.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-text-secondary text-sm">
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
                        className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 pr-10"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="space-y-1">
                      {passwordRequirements.map((req) => (
                        <div key={req.label} className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-amber-500' : 'bg-[#333]'}`}
                          >
                            {req.met && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span
                            className={`text-xs ${req.met ? 'text-amber-400' : 'text-text-secondary/50'}`}
                          >
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-text-secondary text-sm"
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
                      className={`h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 ${doPasswordsMatch ? 'border-amber-500/50' : ''}`}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 rounded-2xl font-bold uppercase tracking-wide bg-linear-to-r from-amber-500 to-orange-500 text-white"
                    disabled={isLoading}
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </form>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="brandName" className="text-text-secondary text-sm">
                    Brand / Business Name
                  </Label>
                  <Input
                    id="brandName"
                    name="brandName"
                    placeholder="e.g. Thunder Gear Co."
                    value={formData.brandName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-text-secondary text-sm">Category</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {BRAND_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat.value })}
                        className={`text-left px-4 py-3 rounded-2xl border transition-all ${formData.category === cat.value ? 'border-amber-500 bg-amber-500/10' : 'border-[#444444]/50 bg-[#1a1a1a] hover:border-[#666]'}`}
                      >
                        <div className="font-medium text-sm text-white">{cat.label}</div>
                        <div className="text-xs text-text-secondary/60 mt-0.5">
                          {cat.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline" className="text-text-secondary text-sm">
                    Tagline <span className="text-text-secondary/40">(optional)</span>
                  </Label>
                  <Input
                    id="tagline"
                    name="tagline"
                    placeholder="e.g. Gear built for the road"
                    value={formData.tagline}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl"
                    onClick={() => setStep('account')}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 rounded-2xl font-bold bg-linear-to-r from-amber-500 to-orange-500 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Create Brand'
                    )}
                  </Button>
                </div>
              </form>
            )}

            <p className="text-center text-sm text-text-secondary/60 mt-6">
              Already registered?{' '}
              <Link
                href="/login"
                className="text-amber-400 font-medium hover:text-amber-300 transition-colors"
              >
                Sign in as Brand Owner
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
