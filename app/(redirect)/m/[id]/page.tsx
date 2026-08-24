import type { Metadata } from 'next'
import { ShareRedirect } from '@/components/share/share-redirect'

interface PageProps {
  params: Promise<{ id: string }>
}

interface ListingPreview {
  id: string
  title: string
  price: number
  currency: string
  condition: string | null
  image: string | null
  category: string | null
  status: string
}

async function fetchListingPreview(id: string): Promise<ListingPreview | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) return null
  try {
    const res = await fetch(`${apiUrl}/public/marketplace/${id}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await fetchListingPreview(id)
  const title = listing ? listing.title : 'A listing on Revvie Marketplace'
  const description = listing
    ? `${formatPrice(listing.price, listing.currency)}${listing.condition ? ` · ${listing.condition}` : ''}${listing.category ? ` · ${listing.category}` : ''} — Open Revvie to see photos and message the seller.`
    : 'Someone shared a marketplace listing with you. Open the Revvie app to see photos, price, and message the seller.'
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://revvie.xride-labs.in/m/${id}`,
      ...(listing?.image ? { images: [{ url: listing.image }] } : {}),
    },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function ListingSharePage({ params }: PageProps) {
  const { id } = await params
  const listing = await fetchListingPreview(id)
  const title = listing ? listing.title : 'Check out this listing'
  const description = listing
    ? `${formatPrice(listing.price, listing.currency)}${listing.condition ? ` · ${listing.condition}` : ''} — Open Revvie to see photos and chat with the seller.`
    : 'A rider shared a marketplace listing with you. Open Revvie to see photos, price, and chat with the seller.'
  return (
    <ShareRedirect
      kind="listing"
      id={id}
      title={title}
      description={description}
      imageUrl={listing?.image}
      meta={
        listing
          ? [
              { label: 'Price', value: formatPrice(listing.price, listing.currency) },
              ...(listing.condition
                ? [{ label: 'Condition', value: listing.condition }]
                : []),
              ...(listing.category
                ? [{ label: 'Category', value: listing.category }]
                : []),
            ]
          : undefined
      }
    />
  )
}
