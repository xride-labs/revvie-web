'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { authClient } from '@/lib/auth-client'

function ResetPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const linkError = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
  ]
  const isValid = requirements.every((r) => r.met)
  const matches = password === confirm && confirm.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (!isValid) { setError('Password does not meet the requirements.'); return }
    if (!matches) { setError('Passwords do not match.'); return }

    setIsLoading(true)
    setError('')
    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      })
      if (resetError) {
        setError(resetError.message || 'Could not reset password. The link may have expired.')
        return
      }
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const invalidLink = !token || linkError

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden p-4">
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-teal/8 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-brand-red-light/10 rounded-full blur-3xl"
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
          <div className="h-1 bg-linear-to-r from-teal via-neon-green to-brand-red-light" />

          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(200,55,55,0.3)] mx-auto mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/zoomies-logo.png" alt="Zoomies" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
                {done ? 'Password reset' : 'Set a new password'}
              </h1>
              <p className="text-text-secondary text-sm mt-2">
                {done
                  ? 'Redirecting you to sign in…'
                  : 'Choose a strong password for your account'}
              </p>
            </div>

            {invalidLink ? (
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-brand-red/15 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-brand-red-light" />
                </div>
                <p className="text-sm text-text-secondary">
                  This reset link is invalid or has expired. Request a new one.
                </p>
                <Link href="/forgot-password">
                  <Button className="w-full h-12 rounded-2xl bg-linear-to-r from-brand-red-light to-brand-red text-white font-bold uppercase tracking-wide text-sm">
                    Request new link
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="ghost" className="w-full h-12 rounded-2xl text-text-secondary hover:text-white hover:bg-[#1a1a1a]">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            ) : done ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-brand-red/15 text-brand-red-light text-sm p-3 rounded-2xl text-center border border-brand-red/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-text-secondary text-sm">New password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary/50 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="space-y-1 pt-1">
                    {requirements.map((req) => (
                      <div key={req.label} className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-neon-green' : 'bg-[#333]'}`}>
                          {req.met && <Check className="w-2.5 h-2.5 text-black" />}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-neon-green' : 'text-text-secondary/50'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-text-secondary text-sm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder="••••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    disabled={isLoading}
                    className={`h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 ${matches ? 'border-neon-green/50' : ''}`}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-linear-to-r from-brand-red-light to-brand-red text-white font-bold uppercase tracking-wide text-sm hover:shadow-[0_10px_30px_rgba(200,55,55,0.3)] transition-shadow"
                  disabled={isLoading || !isValid || !matches}
                >
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting…</>
                  ) : (
                    'Reset password'
                  )}
                </Button>

                <Link href="/login">
                  <Button variant="ghost" className="w-full h-12 rounded-2xl text-text-secondary hover:text-white hover:bg-[#1a1a1a]">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <Loader2 className="w-8 h-8 animate-spin text-brand-red-light" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  )
}
