'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Store,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Wrench,
  ShoppingBag,
  Tag,
  Bike,
  Building2,
  Zap,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
} from '@/features/business/api'
import type { BusinessCategory } from '@/entities/business/model'
import { useBusinessContext } from '@/contexts/business-context'

const BRAND_TYPES: {
  value: BusinessCategory
  label: string
  description: string
  icon: React.ElementType
  color: string
  gradient: string
}[] = [
  {
    value: 'BRAND',
    label: 'Brand / Manufacturer',
    description: 'Motorcycle brands, OEMs, official distributors',
    icon: Building2,
    color: 'text-amber-400',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    value: 'GEAR_SELLER',
    label: 'Gear & Apparel',
    description: 'Jackets, gloves, riding pants, protective gear',
    icon: Tag,
    color: 'text-blue-400',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'HELMET_SELLER',
    label: 'Helmet Specialist',
    description: 'Safety helmets, visors, intercom accessories',
    icon: Zap,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-violet-500',
  },
  {
    value: 'PARTS_SELLER',
    label: 'Parts & Accessories',
    description: 'Spares, engine mods, performance upgrades',
    icon: Bike,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    value: 'SERVICE_STORE',
    label: 'Service & Workshop',
    description: 'Service centres, garages, authorised workshops',
    icon: Wrench,
    color: 'text-rose-400',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    value: 'MECHANIC',
    label: 'Independent Mechanic',
    description: 'Freelance technician, roadside assistance',
    icon: Wrench,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-amber-400',
  },
  {
    value: 'MARKETPLACE_SELLER',
    label: 'Marketplace Seller',
    description: 'Multi-category dealer, general merchandise',
    icon: ShoppingBag,
    color: 'text-teal-400',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    value: 'CONSULTATION',
    label: 'Consultation & Advisory',
    description: 'Riding coaches, tour planners, insurance advisors',
    icon: Zap,
    color: 'text-indigo-400',
    gradient: 'from-indigo-500 to-blue-500',
  },
]

type Step = 'type' | 'info' | 'contact' | 'done'

const STEPS: Step[] = ['type', 'info', 'contact', 'done']
const STEP_LABELS = ['Business Type', 'Brand Info', 'Contact', 'Complete']

// What each business type unlocks — shown in the done screen
const TYPE_HIGHLIGHTS: Partial<Record<BusinessCategory, string[]>> = {
  BRAND: ['Product catalogue', 'Ad campaigns', 'Analytics dashboard', 'Verified badge'],
  GEAR_SELLER: [
    'Gear catalogue',
    'Discount codes',
    'Marketplace listings',
    'Bulk inventory',
  ],
  HELMET_SELLER: [
    'Helmet catalogue',
    'Safety ratings',
    'Marketplace listings',
    'Campaigns',
  ],
  PARTS_SELLER: ['Parts catalogue', 'SKU management', 'Marketplace', 'Discounts'],
  SERVICE_STORE: [
    'Service listings',
    'Booking enquiries',
    'Team management',
    'Analytics',
  ],
  MECHANIC: ['Service menu', 'Enquiry inbox', 'Location on map', 'Rider reviews'],
  MARKETPLACE_SELLER: [
    'Multi-category listings',
    'Discount engine',
    'Campaigns',
    'Analytics',
  ],
  CONSULTATION: [
    'Service packages',
    'Enquiry management',
    'Profile discovery',
    'Analytics',
  ],
}

function launchConfetti() {
  // Dynamic import to avoid SSR issues
  import('canvas-confetti').then(({ default: confetti }) => {
    const count = 200
    const defaults = { origin: { y: 0.7 }, zIndex: 9999 }
    function fire(particleRatio: number, opts: Parameters<typeof confetti>[0]) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) })
    }
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#F59E0B', '#EF4444', '#10B981'],
    })
    fire(0.2, { spread: 60, colors: ['#F59E0B', '#F97316'] })
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#fff', '#F59E0B', '#c83737'],
    })
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 })
    fire(0.1, { spread: 120, startVelocity: 45, colors: ['#F59E0B', '#EF4444'] })
  })
}

export default function BrandOnboardPage() {
  const router = useRouter()
  const { success: successToast, error: errorToast } = useToast()
  const { reload } = useBusinessContext()
  const [createBusiness, { isLoading: creating }] = useCreateBusinessMutation()
  const [updateBusiness] = useUpdateBusinessMutation()

  const [step, setStep] = useState<Step>('type')

  const [form, setForm] = useState({
    categories: [] as BusinessCategory[],
    displayName: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    websiteUrl: '',
    city: '',
    country: 'India',
  })

  const stepIndex = STEPS.indexOf(step)

  const toggleCategory = (cat: BusinessCategory) => {
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter((c) => c !== cat)
        : [...f.categories, cat],
    }))
  }

  const goNext = () => setStep(STEPS[stepIndex + 1])
  const goBack = () => setStep(STEPS[stepIndex - 1])

  const handleCreate = async () => {
    try {
      const business = await createBusiness({
        categories: form.categories,
        displayName: form.displayName,
        tagline: form.tagline || undefined,
      }).unwrap()
      await updateBusiness({
        id: business.id,
        data: {
          description: form.description || null,
          email: form.email || null,
          phone: form.phone || null,
          websiteUrl: form.websiteUrl || null,
          city: form.city || null,
          country: form.country || null,
          onboardingCompleted: true,
        },
      }).unwrap()
      await reload()
      goNext()
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create brand')
    }
  }

  // Fire confetti when we land on done
  useEffect(() => {
    if (step === 'done') {
      launchConfetti()
    }
  }, [step])

  const primaryType = form.categories[0]
  const highlights = primaryType ? (TYPE_HIGHLIGHTS[primaryType] ?? []) : []

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold">Brand Portal Setup</p>
          <p className="text-xs text-muted-foreground">Revvie for Business</p>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {step !== 'done' && `Step ${stepIndex + 1} of ${STEPS.length - 1}`}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Step progress bar */}
          {step !== 'done' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {STEPS.slice(0, -1).map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                        i < stepIndex
                          ? 'bg-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : i === stepIndex
                            ? 'bg-amber-500 text-white ring-4 ring-amber-500/20'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {STEP_LABELS[i]}
                    </span>
                    {i < STEPS.length - 2 && (
                      <div
                        className={`flex-1 h-0.5 rounded-full transition-colors duration-500 ${i < stepIndex ? 'bg-amber-500' : 'bg-muted'}`}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Mini progress bar */}
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(stepIndex / (STEPS.length - 2)) * 100}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          <AnimatePresence mode="wait">
            {/* ─── STEP 1: Type Selection ─────────────────────── */}
            {step === 'type' && (
              <motion.div
                key="type"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">What type of business are you?</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    Select all that apply — you can always update later.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRAND_TYPES.map((type) => {
                    const selected = form.categories.includes(type.value)
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleCategory(type.value)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                          selected
                            ? 'border-amber-500 bg-amber-500/5 shadow-[0_0_0_1px_rgba(245,158,11,0.2)]'
                            : 'border-border hover:border-muted-foreground/40 hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl bg-linear-to-br ${type.gradient} flex items-center justify-center shrink-0`}
                          >
                            <type.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {type.description}
                            </p>
                          </div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: selected ? 1 : 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0 mt-0.5"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {form.categories.length > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 text-xs text-amber-500 font-medium"
                  >
                    {form.categories.length} type{form.categories.length !== 1 ? 's' : ''}{' '}
                    selected
                  </motion.p>
                )}
                <div className="mt-6 flex justify-end">
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 gap-2"
                    disabled={form.categories.length === 0}
                    onClick={goNext}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: Brand Info ─────────────────────────── */}
            {step === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">Tell us about your brand</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    This is how riders will discover and recognise you on Revvie.
                  </p>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label>
                        {form.categories.includes('MECHANIC')
                          ? 'Mechanic / Shop Name'
                          : form.categories.includes('SERVICE_STORE')
                            ? 'Workshop / Service Centre Name'
                            : 'Brand / Business Name'}{' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        autoFocus
                        placeholder={
                          form.categories.includes('MECHANIC')
                            ? 'e.g. Ramesh Two-Wheeler Works'
                            : form.categories.includes('SERVICE_STORE')
                              ? 'e.g. Moto Care Service Centre'
                              : 'e.g. Thunder Gear Co., Royal Enfield'
                        }
                        value={form.displayName}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, displayName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Tagline{' '}
                        <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Input
                        placeholder={
                          form.categories.includes('SERVICE_STORE') ||
                          form.categories.includes('MECHANIC')
                            ? 'e.g. Your bike, our passion'
                            : 'e.g. Gear built for the road'
                        }
                        value={form.tagline}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, tagline: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>
                        Description{' '}
                        <span className="text-muted-foreground text-xs">(optional)</span>
                      </Label>
                      <Textarea
                        rows={4}
                        placeholder={
                          form.categories.includes('MECHANIC') ||
                          form.categories.includes('SERVICE_STORE')
                            ? 'List your specialties, bikes you work on, years of experience...'
                            : 'Tell riders what makes your brand unique — your story, range of products...'
                        }
                        value={form.description}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, description: e.target.value }))
                        }
                      />
                    </div>
                    {/* Character count hint */}
                    {form.description.length > 0 && (
                      <p className="text-xs text-muted-foreground text-right">
                        {form.description.length} chars
                      </p>
                    )}
                  </CardContent>
                </Card>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={goBack} className="gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 gap-2"
                    disabled={!form.displayName.trim()}
                    onClick={goNext}
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: Contact ────────────────────────────── */}
            {step === 'contact' && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">Contact & Location</h1>
                  <p className="text-muted-foreground text-sm mt-1">
                    {form.categories.includes('MECHANIC') ||
                    form.categories.includes('SERVICE_STORE')
                      ? 'Help riders find your workshop and book appointments.'
                      : 'Help riders get in touch with you. All fields are optional.'}
                  </p>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="contact@yourbrand.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, email: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>
                          Phone
                          {(form.categories.includes('MECHANIC') ||
                            form.categories.includes('SERVICE_STORE')) && (
                            <span className="ml-1 text-[10px] text-amber-500 font-medium">
                              Recommended
                            </span>
                          )}
                        </Label>
                        <Input
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, phone: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Website</Label>
                      <Input
                        placeholder="https://yourbrand.com"
                        value={form.websiteUrl}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, websiteUrl: e.target.value }))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>
                          City
                          {(form.categories.includes('MECHANIC') ||
                            form.categories.includes('SERVICE_STORE')) && (
                            <span className="ml-1 text-[10px] text-amber-500 font-medium">
                              Required
                            </span>
                          )}
                        </Label>
                        <Input
                          placeholder="Mumbai"
                          value={form.city}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, city: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Country</Label>
                        <Input
                          placeholder="India"
                          value={form.country}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, country: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-6 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={creating}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 gap-2"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Setting up portal…
                      </>
                    ) : (
                      <>
                        Launch Brand Portal <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 4: Done / Celebration ─────────────────── */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                  className="w-24 h-24 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(245,158,11,0.5)]"
                >
                  <Check className="w-12 h-12 text-white" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl font-bold mb-2">
                    {form.displayName ? `${form.displayName} is live!` : "You're live!"}
                  </h1>
                  <p className="text-muted-foreground max-w-md mx-auto text-sm">
                    Your brand portal is ready. Get verified to appear in discovery and
                    start reaching thousands of riders.
                  </p>
                </motion.div>

                {/* What you unlocked */}
                {highlights.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="mt-6 grid grid-cols-2 gap-2 max-w-sm mx-auto"
                  >
                    {highlights.map((h, i) => (
                      <motion.div
                        key={h}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.07 }}
                        className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border text-left"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-amber-500" />
                        </div>
                        <p className="text-xs font-medium">{h}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
                >
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8 gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                    onClick={() => router.push('/brand/dashboard?onboarding=1')}
                  >
                    <Store className="w-4 h-4" /> Go to Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/brand/settings#verification')}
                    className="gap-2"
                  >
                    <ExternalLink className="w-4 h-4" /> Get Verified
                  </Button>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-xs text-muted-foreground mt-6"
                >
                  Get verified to appear in public discovery and unlock marketplace
                  access.
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
