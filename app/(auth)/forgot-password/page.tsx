'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas relative overflow-hidden p-4">
      {/* Background decorations */}
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
          {/* Top gradient bar */}
          <div className="h-1 bg-linear-to-r from-teal via-neon-green to-brand-red-light" />

          <div className="p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 mb-4"
              >
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(200,55,55,0.3)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/revvie-logo.png" alt="Revvie" className="w-full h-full object-cover" />
                </div>
              </Link>

              {isSubmitted ? (
                <>
                  <motion.div
                    className="w-16 h-16 bg-neon-green/15 rounded-full flex items-center justify-center mx-auto mb-4"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                  >
                    <Mail className="w-8 h-8 text-neon-green" />
                  </motion.div>
                  <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
                    Check your email
                  </h1>
                  <p className="text-text-secondary text-sm mt-2">
                    We&apos;ve sent a password reset link to{' '}
                    <span className="font-medium text-teal">{email}</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white uppercase tracking-wide">
                    Forgot password?
                  </h1>
                  <p className="text-text-secondary text-sm mt-2">
                    No worries, we&apos;ll send you reset instructions
                  </p>
                </>
              )}
            </div>

            {isSubmitted ? (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary/60 text-center">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white hover:bg-[#252525] hover:text-white transition-colors"
                  onClick={() => setIsSubmitted(false)}
                >
                  Try another email
                </Button>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-2xl text-text-secondary hover:text-white hover:bg-[#1a1a1a] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-brand-red/15 text-brand-red-light text-sm p-3 rounded-2xl text-center border border-brand-red/20">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-text-secondary text-sm">
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
                    className="h-12 rounded-2xl bg-[#1a1a1a] border-[#444444]/50 text-white placeholder:text-text-secondary/40 focus:border-teal/60 focus:ring-teal/30"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-2xl bg-linear-to-r from-brand-red-light to-brand-red text-white font-bold uppercase tracking-wide text-sm hover:shadow-[0_10px_30px_rgba(200,55,55,0.3)] transition-shadow"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>

                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-2xl text-text-secondary hover:text-white hover:bg-[#1a1a1a] transition-colors"
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
