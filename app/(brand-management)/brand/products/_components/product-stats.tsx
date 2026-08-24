import { Card, CardContent } from '@/components/ui/card'

export interface ProductStatsData {
  total: number
  inStock: number
  outOfStock: number
  hidden: number
  featured: number
}

export function ProductStats({ stats }: { stats: ProductStatsData }) {
  const tiles = [
    { label: 'Total', value: stats.total, color: 'text-foreground' },
    { label: 'In Stock', value: stats.inStock, color: 'text-green-500' },
    { label: 'Out of Stock', value: stats.outOfStock, color: 'text-destructive' },
    { label: 'Hidden', value: stats.hidden, color: 'text-muted-foreground' },
    { label: 'Featured', value: stats.featured, color: 'text-amber-500' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {tiles.map((s) => (
        <Card key={s.label}>
          <CardContent className="py-3 px-4">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
