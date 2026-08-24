'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCreateBusinessMutation } from '@/features/business/api'
import type { BusinessCategory } from '@/entities/business/model'
import { useToast } from '@/hooks/use-toast'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES: Array<{ label: string; value: BusinessCategory }> = [
  { label: 'Motorcycle Brand', value: 'BRAND' },
  { label: 'Riding Gear', value: 'GEAR_SELLER' },
  { label: 'Helmets', value: 'HELMET_SELLER' },
  { label: 'Parts & Accessories', value: 'PARTS_SELLER' },
  { label: 'Marketplace Seller', value: 'MARKETPLACE_SELLER' },
  { label: 'Riding Club', value: 'CLUB' },
  { label: 'Service Store', value: 'SERVICE_STORE' },
  { label: 'Independent Mechanic', value: 'MECHANIC' },
  { label: 'Consultation', value: 'CONSULTATION' },
]

export default function CreateBusinessPage() {
  const router = useRouter()
  const { error: errorToast, loading: loadingToast, dismiss: dismissToast } = useToast()
  const [createBusiness, { isLoading: isSubmitting }] = useCreateBusinessMutation()
  const [category, setCategory] = useState<BusinessCategory | ''>('')
  const [displayName, setDisplayName] = useState('')
  const [tagline, setTagline] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!category || !displayName.trim()) return

    const toastId = loadingToast('Creating business...', {
      description: 'Saving your brand profile.',
    })

    try {
      const business = await createBusiness({
        categories: [category as BusinessCategory],
        displayName: displayName.trim(),
        tagline: tagline.trim() || undefined,
      }).unwrap()
      router.push(`/business/${business.id}`)
    } catch (err) {
      errorToast('Could not create business', {
        description: err instanceof Error ? err.message : 'Please try again.',
      })
    } finally {
      dismissToast(toastId)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link
        href="/business"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-4"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to portal
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a business profile</CardTitle>
          <CardDescription>
            Set up a public brand page for riders and marketplace buyers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Business category</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as BusinessCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Business name</Label>
              <Input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="e.g., 66 BHP Customs"
              />
            </div>

            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                placeholder="Short description for riders"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !category || !displayName.trim()}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Create business'
                )}
              </Button>
              <Button asChild variant="outline">
                <Link href="/business">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
