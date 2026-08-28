'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { authClient, resolveAuthCallbackURL } from '@/lib/auth-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: resolveAuthCallbackURL('/reset-password'),
      })
      if (resetError) {
        setError(resetError.message || 'Could not send reset email. Please try again.')
        return
      }
      setIsSubmitted(true)
    } catch (err: any) {
      console.error('Forgot password submission error:', err)
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden p-4">
      {/* Background decorations */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-brand-red-light/6 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-neon-green/5 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-3xl bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/[0.07] shadow-atmospheric overflow-hidden">
          <div className="h-px bg-linear-to-r from-transparent via-brand-red-light/50 to-transparent" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 mb-4"
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden border border-border shadow-[0_0_18px_rgba(229,0,0,0.2)]">
                  {}
                  <img
                    src="/revvie-logo.png"
                    alt="Revvie"
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>

              {isSubmitted ? (
                <>
                  <motion.div
                    className="w-16 h-16 bg-neon-green/10 border border-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <Mail className="w-7 h-7 text-neon-green" />
                  </motion.div>
                  <h1 className="text-xl font-bold text-white uppercase tracking-widest">
                    Check your email
                  </h1>
                  <p className="text-text-secondary/60 text-sm mt-2">
                    We&apos;ve sent a reset link to{' '}
                    <span className="font-medium text-brand-red-light">{email}</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-white uppercase tracking-widest">
                    Forgot password?
                  </h1>
                  <p className="text-text-secondary/60 text-sm mt-2">
                    No worries — we&apos;ll send you reset instructions
                  </p>
                </>
              )}
            </div>

            {isSubmitted ? (
              <div className="space-y-3">
                <p className="text-sm text-text-secondary/50 text-center">
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl bg-canvas border border-white/10 text-white/80 hover:bg-[#111] hover:text-white hover:border-white/15 transition-all"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full h-11 rounded-xl text-text-secondary/50 hover:text-white hover:bg-[#111] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-brand-red/10 text-brand-red-light text-sm p-3 rounded-xl text-center border border-brand-red/20">
                    {error}
                  </div>
                )}

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
                    placeholder="rider@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-11 rounded-xl bg-[#0d0d0d] border border-white/10 text-white placeholder:text-white/20 focus:border-white/20 focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-linear-to-r from-brand-red-light to-brand-red text-white font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full h-11 rounded-xl text-text-secondary/50 hover:text-white hover:bg-[#111] transition-colors"
                  >
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
