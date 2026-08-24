import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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

export interface ProductTableProps {
  products: BrandProduct[]
  isSelected: (id: string) => boolean
  allSelected: boolean
  onToggle: (id: string) => void
  onToggleAll: () => void
  onEdit: (p: BrandProduct) => void
  onToggleFeatured: (p: BrandProduct) => void
  onToggleActive: (p: BrandProduct) => void
  onDelete: (p: BrandProduct) => void
}

export function ProductTable({
  products,
  isSelected,
  allSelected,
  onToggle,
  onToggleAll,
  onEdit,
  onToggleFeatured,
  onToggleActive,
  onDelete,
}: ProductTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={onToggleAll}
                aria-label="Select all products"
              />
            </TableHead>
            <TableHead className="w-10" />
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Availability</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => {
            const avail = AVAILABILITY_CONFIG[p.availability]
            const catMeta = getCategoryMeta(p.category)
            const AvailIcon = avail.icon
            const stockQty = stockQtyOf(p)
            return (
              <TableRow key={p.id} className={!p.isActive ? 'opacity-60' : ''}>
                <TableCell>
                  <Checkbox
                    checked={isSelected(p.id)}
                    onCheckedChange={() => onToggle(p.id)}
                    aria-label={`Select ${p.title}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{catMeta?.emoji ?? '📦'}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    {p.isFeatured && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5 gap-0.5 mt-0.5">
                        <Star className="w-2.5 h-2.5 fill-white" /> Featured
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs">
                    {catMeta?.emoji} {catMeta?.label}
                  </span>
                </TableCell>
                <TableCell>
                  {p.sku ? (
                    <span className="text-xs font-mono text-muted-foreground">
                      {p.sku}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {p.price != null ? (
                    <span className="font-semibold text-amber-500 text-sm">
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {stockQty != null ? (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        stockQty === 0 ? 'text-destructive' : '',
                      )}
                    >
                      {stockQty}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium',
                      avail.bg,
                      avail.color,
                    )}
                  >
                    <AvailIcon className="w-3 h-3" />
                    {avail.label}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'text-xs font-medium',
                      p.isActive ? 'text-green-500' : 'text-muted-foreground',
                    )}
                  >
                    {p.isActive ? 'Visible' : 'Hidden'}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(p)}>
                        <Pencil className="w-4 h-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleFeatured(p)}>
                        <Star className="w-4 h-4 mr-2" />{' '}
                        {p.isFeatured ? 'Unfeature' : 'Feature'}
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
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => onDelete(p)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}
