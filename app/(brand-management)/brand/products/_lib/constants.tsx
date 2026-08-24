import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'
import type {
  BrandProductCategory,
  ProductAvailability,
} from '@/entities/business/model'

export const PRODUCT_CATEGORIES: {
  value: BrandProductCategory
  label: string
  emoji: string
}[] = [
  { value: 'MOTORCYCLE', label: 'Motorcycle', emoji: '🏍️' },
  { value: 'HELMET', label: 'Helmet', emoji: '⛑️' },
  { value: 'JACKET', label: 'Jacket', emoji: '🧥' },
  { value: 'GEAR', label: 'Gear', emoji: '🥊' },
  { value: 'GLOVES', label: 'Gloves', emoji: '🧤' },
  { value: 'BOOTS', label: 'Boots', emoji: '🥾' },
  { value: 'PANTS', label: 'Pants', emoji: '👖' },
  { value: 'PARTS', label: 'Parts', emoji: '⚙️' },
  { value: 'ACCESSORIES', label: 'Accessories', emoji: '🔧' },
  { value: 'TYRES', label: 'Tyres', emoji: '🔵' },
  { value: 'ELECTRONICS', label: 'Electronics', emoji: '📱' },
  { value: 'LIGHTING', label: 'Lighting', emoji: '💡' },
  { value: 'LUBRICANTS', label: 'Lubricants', emoji: '🛢️' },
  { value: 'TOOLS', label: 'Tools', emoji: '🔨' },
  { value: 'APPAREL', label: 'Apparel', emoji: '👕' },
  { value: 'MEMORABILIA', label: 'Memorabilia', emoji: '🏆' },
  { value: 'OTHER', label: 'Other', emoji: '📦' },
]

export const AVAILABILITY_CONFIG: Record<
  ProductAvailability,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  IN_STOCK: {
    label: 'In Stock',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10 border-green-500/20',
    icon: CheckCircle2,
  },
  OUT_OF_STOCK: {
    label: 'Out of Stock',
    color: 'text-red-600 dark:text-destructive',
    bg: 'bg-destructive/10 border-destructive/20',
    icon: XCircle,
  },
  PRE_ORDER: {
    label: 'Pre-Order',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    icon: Clock,
  },
  DISCONTINUED: {
    label: 'Discontinued',
    color: 'text-muted-foreground',
    bg: 'bg-muted border-border',
    icon: AlertCircle,
  },
}

export const EMPTY_FORM = {
  title: '',
  description: '',
  sku: '',
  category: 'OTHER' as BrandProductCategory,
  price: '',
  currency: 'INR',
  availability: 'IN_STOCK' as ProductAvailability,
  tags: '',
  stockQty: '',
}

/** Copy varies by the seller's primary business category — a helmet seller sees
 *  "Helmet Inventory", a mechanic sees "Parts & Products", etc. */
export const TYPE_COPY: Record<
  string,
  {
    title: string
    subtitle: string
    addLabel: string
    emptyTitle: string
    emptyBody: string
  }
> = {
  BRAND: {
    title: 'Catalogue',
    subtitle: 'Manage your official product lineup',
    addLabel: 'Add Product',
    emptyTitle: 'Build your catalogue',
    emptyBody:
      "Add your brand's products — helmets, jackets, bikes — to the Revvie marketplace.",
  },
  GEAR_SELLER: {
    title: 'Gear Inventory',
    subtitle: 'Manage your gear & apparel stock',
    addLabel: 'Add Gear',
    emptyTitle: 'List your gear',
    emptyBody: 'Add riding gear, apparel, and accessories to start selling.',
  },
  HELMET_SELLER: {
    title: 'Helmet Inventory',
    subtitle: 'Manage your helmet catalogue',
    addLabel: 'Add Helmet',
    emptyTitle: 'Add your helmets',
    emptyBody: 'List your helmet models with specs, certifications, and pricing.',
  },
  PARTS_SELLER: {
    title: 'Parts Inventory',
    subtitle: 'SKU-tracked parts & accessories',
    addLabel: 'Add Part',
    emptyTitle: 'Add your parts',
    emptyBody: 'Add spares, performance parts, and accessories with SKU tracking.',
  },
  SERVICE_STORE: {
    title: 'Products & Parts',
    subtitle: 'Retail products and accessories sold at your workshop',
    addLabel: 'Add Product',
    emptyTitle: 'No products yet',
    emptyBody: 'Add retail products or parts you sell at your service centre.',
  },
  MECHANIC: {
    title: 'Parts & Products',
    subtitle: 'Parts and tools you stock',
    addLabel: 'Add Product',
    emptyTitle: 'No products listed',
    emptyBody: 'Add the parts and products you stock and sell to riders.',
  },
  MARKETPLACE_SELLER: {
    title: 'Listings',
    subtitle: 'Your multi-category product listings',
    addLabel: 'Add Listing',
    emptyTitle: 'No listings yet',
    emptyBody: 'Add products across categories to start selling on Revvie.',
  },
  CONSULTATION: {
    title: 'Products & Resources',
    subtitle: 'Merchandise and resources for your advisory',
    addLabel: 'Add Item',
    emptyTitle: 'No items yet',
    emptyBody: 'Add courses, merchandise, or resources riders can purchase.',
  },
}

export function getCategoryMeta(cat: BrandProductCategory) {
  return PRODUCT_CATEGORIES.find((c) => c.value === cat)
}
