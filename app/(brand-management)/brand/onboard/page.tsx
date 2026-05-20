'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { businessApi, type BusinessCategory } from '@/lib/server/business'
import { useBusinessContext } from '@/contexts/business-context'

const BRAND_TYPES: { value: BusinessCategory; label: string; description: string; icon: React.ElementType; color: string }[] = [
  {
    value: 'BRAND',
    label: 'Brand / Manufacturer',
    description: 'Motorcycle brands, OEMs, official distributors',
    icon: Building2,
    color: 'from-amber-500 to-orange-500',
  },
  {
    value: 'GEAR_SELLER',
    label: 'Gear & Apparel',
    description: 'Jackets, gloves, riding pants, apparel',
    icon: Tag,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    value: 'HELMET_SELLER',
    label: 'Helmet Specialist',
    description: 'Safety helmets, visors, accessories',
    icon: Zap,
    color: 'from-purple-500 to-violet-500',
  },
  {
    value: 'PARTS_SELLER',
    label: 'Parts & Accessories',
    description: 'Spares, mods, performance upgrades',
    icon: Bike,
    color: 'from-green-500 to-emerald-500',
  },
  {
    value: 'SERVICE_STORE',
    label: 'Service & Repair',
    description: 'Workshops, service centers, garages',
    icon: Wrench,
    color: 'from-rose-500 to-pink-500',
  },
  {
    value: 'MECHANIC',
    label: 'Independent Mechanic',
    description: 'Freelance technician, roadside help',
    icon: Wrench,
    color: 'from-orange-500 to-amber-400',
  },
  {
    value: 'MARKETPLACE_SELLER',
    label: 'Marketplace Seller',
    description: 'General merchandise, multi-category',
    icon: ShoppingBag,
    color: 'from-teal-500 to-cyan-500',
  },
  {
    value: 'CONSULTATION',
    label: 'Consultation & Advisory',
    description: 'Riding coaches, tour planners, advisors',
    icon: Zap,
    color: 'from-indigo-500 to-blue-500',
  },
]

type Step = 'type' | 'info' | 'contact' | 'done'

const STEPS: Step[] = ['type', 'info', 'contact', 'done']
const STEP_LABELS = ['Brand Type', 'Brand Info', 'Contact', 'Complete']

export default function BrandOnboardPage() {
  const router = useRouter()
  const { success: successToast, error: errorToast } = useToast()
  const { reload } = useBusinessContext()

  const [step, setStep] = useState<Step>('type')
  const [creating, setCreating] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)

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
    setCreating(true)
    try {
      const business = await businessApi.createBusiness({
        categories: form.categories,
        displayName: form.displayName,
        tagline: form.tagline || undefined,
      })
      // Update with contact details
      await businessApi.updateBusiness(business.id, {
        description: form.description || null,
        email: form.email || null,
        phone: form.phone || null,
        websiteUrl: form.websiteUrl || null,
        city: form.city || null,
        country: form.country || null,
        onboardingCompleted: true,
      })
      setCreatedId(business.id)
      await reload()
      goNext()
    } catch (err) {
      errorToast(err instanceof Error ? err.message : 'Failed to create brand')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-linear-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
          <Store className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold">Brand Portal Setup</p>
          <p className="text-xs text-muted-foreground">Zoomies for Business</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Step indicator */}
          {step !== 'done' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {STEPS.slice(0, -1).map((s, i) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        i < stepIndex
                          ? 'bg-amber-500 text-white'
                          : i === stepIndex
                          ? 'bg-amber-500 text-white ring-4 ring-amber-500/20'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {i < stepIndex ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:block ${
                        i <= stepIndex ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {STEP_LABELS[i]}
                    </span>
                    {i < STEPS.length - 2 && (
                      <div className={`flex-1 h-0.5 rounded-full ${i < stepIndex ? 'bg-amber-500' : 'bg-muted'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step content */}
          <AnimatePresence mode="wait">
            {step === 'type' && (
              <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">What type of brand are you?</h1>
                  <p className="text-muted-foreground text-sm mt-1">Select all that apply — you can always add more later.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {BRAND_TYPES.map((type) => {
                    const selected = form.categories.includes(type.value)
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => toggleCategory(type.value)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? 'border-amber-500 bg-amber-500/5'
                            : 'border-border hover:border-muted-foreground/40'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-linear-to-br ${type.color} flex items-center justify-center shrink-0`}>
                            <type.icon className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{type.description}</p>
                          </div>
                          {selected && (
                            <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                    disabled={form.categories.length === 0}
                    onClick={goNext}
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'info' && (
              <motion.div key="info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">Tell us about your brand</h1>
                  <p className="text-muted-foreground text-sm mt-1">This is how riders will discover and recognise you.</p>
                </div>
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label>Brand / Business Name <span className="text-destructive">*</span></Label>
                      <Input
                        placeholder="e.g. Thunder Gear Co., Royal Enfield, Steer Moto"
                        value={form.displayName}
                        onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tagline <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input
                        placeholder="e.g. Gear built for the road"
                        value={form.tagline}
                        onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Textarea
                        rows={4}
                        placeholder="Tell riders what makes your brand unique — your story, expertise, range of products or services..."
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                      />
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={goBack}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                    disabled={!form.displayName.trim()}
                    onClick={goNext}
                  >
                    Continue <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'contact' && (
              <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold">Contact & Location</h1>
                  <p className="text-muted-foreground text-sm mt-1">Help riders get in touch and find you. All fields optional.</p>
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
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Phone</Label>
                        <Input
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Website</Label>
                      <Input
                        placeholder="https://yourbrand.com"
                        value={form.websiteUrl}
                        onChange={(e) => setForm((f) => ({ ...f, websiteUrl: e.target.value }))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>City</Label>
                        <Input
                          placeholder="Mumbai"
                          value={form.city}
                          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Country</Label>
                        <Input
                          placeholder="India"
                          value={form.country}
                          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-6 flex justify-between">
                  <Button variant="outline" onClick={goBack} disabled={creating}>
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                    onClick={handleCreate}
                    disabled={creating}
                  >
                    {creating ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating brand…</>
                    ) : (
                      <>Launch Brand Portal <ChevronRight className="w-4 h-4 ml-1" /></>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">You&apos;re live!</h1>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Your brand portal is ready. Start adding products, services, and campaigns to reach thousands of riders on Zoomies.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    className="bg-amber-500 hover:bg-amber-600 text-white px-8"
                    onClick={() => router.push('/brand/dashboard?onboarding=1')}
                  >
                    Go to Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/brand/settings#verification')}>
                    Submit for Verification
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-6">
                  Get verified to appear in public discovery and unlock marketplace access.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
