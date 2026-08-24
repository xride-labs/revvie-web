import { listListings } from '@/features/marketplace/server'
import { MarketplaceBrowser } from './_components/marketplace-browser'

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const { items } = await listListings({ category, limit: 40 })

  return <MarketplaceBrowser listings={items} activeCategory={category ?? 'all'} />
}
