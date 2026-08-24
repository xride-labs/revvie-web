import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2, Pencil, Star, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BrandProduct } from '@/entities/business/model'
import { AVAILABILITY_CONFIG, getCategoryMeta } from '../_lib/constants'

function stockQtyOf(p: BrandProduct): number | undefined {
  const qty = p.specs?.stockQty
  return typeof qty === 'number' ? qty : undefined
}

export function ProductCard({
  product: p,
  onEdit,
  onToggleFeatured,
  onToggleActive,
  onDelete,
}: {
  product: BrandProduct
  onEdit: (p: BrandProduct) => void
  onToggleFeatured: (p: BrandProduct) => void
  onToggleActive: (p: BrandProduct) => void
  onDelete: (p: BrandProduct) => void
}) {
  const avail = AVAILABILITY_CONFIG[p.availability]
  const catMeta = getCategoryMeta(p.category)
  const AvailIcon = avail.icon
  const stockQty = stockQtyOf(p)

  return (
    <Card
      className={cn(
        'overflow-hidden group transition-all hover:shadow-md',
        !p.isActive && 'opacity-60',
      )}
    >
      {/* Image */}
      <div className="relative">
        {p.images?.[0] ? (
          <img src={p.images[0]} alt={p.title} className="w-full h-44 object-cover" />
        ) : (
          <div className="w-full h-44 bg-muted flex items-center justify-center">
            <span className="text-4xl">{catMeta?.emoji ?? '📦'}</span>
          </div>
        )}
        {/* Availability chip on image */}
        <div
          className={cn(
            'absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold backdrop-blur-sm',
            avail.bg,
            avail.color,
          )}
        >
          <AvailIcon className="w-3 h-3" />
          {avail.label}
        </div>
        {p.isFeatured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-amber-500 text-white text-[10px] px-1.5 gap-0.5">
              <Star className="w-2.5 h-2.5 fill-white" /> Featured
            </Badge>
          </div>
        )}
        {!p.isActive && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="bg-background text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" /> Hidden
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug truncate">{p.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                {catMeta?.emoji} {catMeta?.label ?? p.category}
              </span>
              {p.sku && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {p.sku}
                </span>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 -mr-1 -mt-0.5"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(p)}>
                <Pencil className="w-4 h-4 mr-2" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleFeatured(p)}>
                <Star className="w-4 h-4 mr-2" /> {p.isFeatured ? 'Unfeature' : 'Feature'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggleActive(p)}>
                {p.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" /> Hide
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" /> Show
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(p)}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {p.price != null ? (
            <p className="text-base font-bold text-amber-500">
              ₹{p.price.toLocaleString('en-IN')}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">No price set</p>
          )}
          {stockQty != null && (
            <span
              className={cn(
                'text-xs font-medium',
                stockQty === 0 ? 'text-destructive' : 'text-muted-foreground',
              )}
            >
              Qty: {stockQty}
            </span>
          )}
        </div>

        {p.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {p.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground"
              >
                {t}
              </span>
            ))}
            {p.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{p.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
