import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Filter, LayoutGrid, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  BrandProductCategory,
  ProductAvailability,
} from '@/entities/business/model'
import { AVAILABILITY_CONFIG, PRODUCT_CATEGORIES } from '../_lib/constants'

export interface ProductFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  filterAvail: ProductAvailability | 'ALL'
  onFilterAvailChange: (value: ProductAvailability | 'ALL') => void
  view: 'grid' | 'table'
  onViewChange: (view: 'grid' | 'table') => void
  filterCategory: BrandProductCategory | 'ALL'
  onFilterCategoryChange: (value: BrandProductCategory | 'ALL') => void
  usedCategories: typeof PRODUCT_CATEGORIES
  categoryCounts: Map<BrandProductCategory, number>
  totalCount: number
}

export function ProductFilters({
  search,
  onSearchChange,
  filterAvail,
  onFilterAvailChange,
  view,
  onViewChange,
  filterCategory,
  onFilterCategoryChange,
  usedCategories,
  categoryCounts,
  totalCount,
}: ProductFiltersProps) {
  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filterAvail}
          onValueChange={(v) => onFilterAvailChange(v as ProductAvailability | 'ALL')}
        >
          <SelectTrigger className="w-40">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            <SelectValue placeholder="Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All availability</SelectItem>
            {(Object.keys(AVAILABILITY_CONFIG) as ProductAvailability[]).map((a) => (
              <SelectItem key={a} value={a}>
                {AVAILABILITY_CONFIG[a].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange('grid')}
            className={cn(
              'p-2 transition-colors',
              view === 'grid' ? 'bg-muted' : 'hover:bg-muted/50',
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={cn(
              'p-2 transition-colors',
              view === 'table' ? 'bg-muted' : 'hover:bg-muted/50',
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Category filter pills */}
      {usedCategories.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
          <button
            onClick={() => onFilterCategoryChange('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all',
              filterCategory === 'ALL'
                ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'border-border text-muted-foreground hover:border-amber-500/40',
            )}
          >
            All ({totalCount})
          </button>
          {usedCategories.map((c) => (
            <button
              key={c.value}
              onClick={() => onFilterCategoryChange(c.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border whitespace-nowrap transition-all',
                filterCategory === c.value
                  ? 'border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  : 'border-border text-muted-foreground hover:border-amber-500/40',
              )}
            >
              {c.emoji} {c.label} ({categoryCounts.get(c.value) ?? 0})
            </button>
          ))}
        </div>
      )}
    </>
  )
}
