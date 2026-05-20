'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Bell,
  Store,
  Tag,
  CreditCard,
  Ticket,
  MessageCircle,
  Users,
  Wrench,
  ChevronDown,
  Star,
  ShoppingCart,
  Sparkles,
  HardHat,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth, hasAnyRole } from '@/lib/use-auth'
import { signOut } from '@/lib/auth-client'
import { useEffect } from 'react'
import { BoneyardLoadingState } from '@/components/loading/boneyard-loading-state'
import { useBusinessContext } from '@/contexts/business-context'
import type { BusinessCategory } from '@/lib/server/business'

const ONBOARD_PATH = '/brand/onboard'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const ALL_NAV: NavItem[] = [
  { name: 'Dashboard',   href: '/brand/dashboard',   icon: LayoutDashboard },
  { name: 'Messages',    href: '/brand/messages',    icon: MessageCircle },
  { name: 'Products',    href: '/brand/products',    icon: Package },
  { name: 'Services',    href: '/brand/services',    icon: Wrench },
  { name: 'Marketplace', href: '/brand/marketplace', icon: ShoppingCart },
  { name: 'Campaigns',   href: '/brand/campaigns',   icon: Tag },
  { name: 'Discounts',   href: '/brand/discounts',   icon: Ticket },
  { name: 'Analytics',   href: '/brand/analytics',   icon: BarChart3 },
  { name: 'Team',        href: '/brand/team',        icon: Users },
  { name: 'Billing',     href: '/brand/billing',     icon: CreditCard },
  { name: 'Settings',    href: '/brand/settings',    icon: Settings },
]

// Key items shown first in sidebar based on primary business category.
// Dashboard + Settings always anchor start/end; these are the middle items.
const CATEGORY_NAV_ORDER: Record<BusinessCategory, string[]> = {
  BRAND:             ['Products', 'Marketplace', 'Campaigns', 'Discounts', 'Analytics', 'Messages', 'Services', 'Team', 'Billing'],
  GEAR_SELLER:       ['Products', 'Marketplace', 'Campaigns', 'Discounts', 'Analytics', 'Messages', 'Services', 'Team', 'Billing'],
  HELMET_SELLER:     ['Products', 'Marketplace', 'Campaigns', 'Discounts', 'Analytics', 'Messages', 'Services', 'Team', 'Billing'],
  PARTS_SELLER:      ['Products', 'Marketplace', 'Campaigns', 'Discounts', 'Analytics', 'Messages', 'Services', 'Team', 'Billing'],
  MARKETPLACE_SELLER:['Marketplace', 'Products', 'Campaigns', 'Discounts', 'Analytics', 'Messages', 'Services', 'Team', 'Billing'],
  SERVICE_STORE:     ['Services', 'Messages', 'Campaigns', 'Analytics', 'Products', 'Discounts', 'Team', 'Billing'],
  MECHANIC:          ['Services', 'Messages', 'Campaigns', 'Analytics', 'Products', 'Discounts', 'Team', 'Billing'],
  CONSULTATION:      ['Services', 'Messages', 'Analytics', 'Campaigns', 'Products', 'Discounts', 'Team', 'Billing'],
  CLUB:              ['Messages', 'Products', 'Services', 'Campaigns', 'Analytics', 'Discounts', 'Team', 'Billing'],
}

// Icon and accent shown in the sidebar header per category
const CATEGORY_META: Record<BusinessCategory, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  BRAND:             { icon: Sparkles,   label: 'Brand',            color: 'from-amber-500 to-orange-500' },
  GEAR_SELLER:       { icon: ShoppingBag,label: 'Gear Seller',      color: 'from-amber-500 to-yellow-500' },
  HELMET_SELLER:     { icon: HardHat,    label: 'Helmet Seller',    color: 'from-amber-600 to-orange-500' },
  PARTS_SELLER:      { icon: Package,    label: 'Parts Seller',     color: 'from-orange-500 to-red-500' },
  MARKETPLACE_SELLER:{ icon: ShoppingCart,label: 'Marketplace',     color: 'from-blue-500 to-indigo-500' },
  SERVICE_STORE:     { icon: Store,      label: 'Service Store',    color: 'from-emerald-500 to-teal-500' },
  MECHANIC:          { icon: Wrench,     label: 'Mechanic',         color: 'from-slate-500 to-zinc-600' },
  CONSULTATION:      { icon: BookOpen,   label: 'Consultation',     color: 'from-purple-500 to-violet-500' },
  CLUB:              { icon: Users,      label: 'Club',             color: 'from-rose-500 to-pink-500' },
}

function getNavigation(categories: BusinessCategory[]): { sidebar: NavItem[]; mobile: NavItem[] } {
  const primary = categories[0] ?? 'BRAND'
  const order = CATEGORY_NAV_ORDER[primary] ?? CATEGORY_NAV_ORDER.BRAND
  const byName = Object.fromEntries(ALL_NAV.map((n) => [n.name, n]))

  const dashboard = byName['Dashboard']!
  const settings  = byName['Settings']!
  const middle = order.map((name) => byName[name]).filter(Boolean) as NavItem[]

  const sidebar: NavItem[] = [dashboard, ...middle, settings]
  // Mobile bottom bar: dashboard + first 3 priority items + settings
  const mobile: NavItem[] = [dashboard, ...middle.slice(0, 3), settings]
  return { sidebar, mobile }
}

const VERIFICATION_BADGE: Record<string, string> = {
  PENDING:   'text-amber-400',
  SUBMITTED: 'text-blue-400',
  APPROVED:  'text-green-400',
  REJECTED:  'text-destructive',
}

export function BrandPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, hasSession, isPending, error } = useAuth()
  const { business, businesses, loading: businessLoading, selectBusiness } = useBusinessContext()

  const hasBrandAccess = hasAnyRole(user, 'BRAND_OWNER', 'BRAND_ADMIN', 'BRAND_MODERATOR', 'ADMIN', 'CO_ADMIN')
  const isAdmin = hasAnyRole(user, 'ADMIN', 'CO_ADMIN')
  const isOnboardPath = pathname === ONBOARD_PATH
  const hasOnboardedBusiness = businesses.some((b) => b.onboardingCompleted)

  const { sidebar: navigation, mobile: mobileNav } = getNavigation(
    (business?.categories ?? []) as BusinessCategory[]
  )

  const primaryCategory = (business?.categories?.[0] ?? 'BRAND') as BusinessCategory
  const catMeta = CATEGORY_META[primaryCategory] ?? CATEGORY_META.BRAND
  const CatIcon = catMeta.icon

  useEffect(() => {
    if (isPending || businessLoading) return
    if (!hasSession) { router.push('/login'); return }
    if (!user) return
    if (isOnboardPath) return
    if (!hasBrandAccess && !businessLoading) { router.push(ONBOARD_PATH); return }
    if (!businessLoading && !hasOnboardedBusiness && hasBrandAccess) { router.push(ONBOARD_PATH) }
  }, [user, hasSession, isPending, businessLoading, businesses, hasBrandAccess, hasOnboardedBusiness, isOnboardPath, router, error])

  if (isPending || (hasSession && !user) || businessLoading) {
    return (
      <BoneyardLoadingState
        name="brand-portal-layout-shell"
        fallback={
          <div className="min-h-screen bg-background flex">
            <aside className="hidden lg:flex lg:w-72 lg:flex-col border-r border-border bg-card">
              <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="flex-1 p-4 space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-2xl" />)}
              </div>
            </aside>
            <main className="flex-1 p-6">
              <Skeleton className="h-10 w-48 mb-6" />
              <div className="grid gap-4 md:grid-cols-3">
                {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            </main>
          </div>
        }
      />
    )
  }

  if (isOnboardPath) return <>{children}</>
  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-border bg-card">
        {/* Logo + Business Selector */}
        <div className="flex h-16 items-center gap-2 px-4 border-b border-border">
          <div className={cn('w-9 h-9 bg-linear-to-br rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.2)] shrink-0', catMeta.color)}>
            <CatIcon className="w-4 h-4 text-white" />
          </div>
          {businesses.length > 1 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 min-w-0 flex items-center gap-1 text-left hover:opacity-80 transition-opacity">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{business?.displayName ?? 'Brand Portal'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      <span className={VERIFICATION_BADGE[business?.verification ?? 'PENDING']}>
                        {business?.verification === 'APPROVED'  ? '✓ Verified' :
                         business?.verification === 'SUBMITTED' ? '⏳ Under Review' :
                         business?.verification === 'REJECTED'  ? '✗ Rejected' : catMeta.label}
                      </span>
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {businesses.map((b) => {
                  const bPrimary = (b.categories?.[0] ?? 'BRAND') as BusinessCategory
                  const bMeta = CATEGORY_META[bPrimary] ?? CATEGORY_META.BRAND
                  const BIcon = bMeta.icon
                  return (
                    <DropdownMenuItem
                      key={b.id}
                      onClick={() => selectBusiness(b.id)}
                      className={cn('flex items-center gap-2', b.id === business?.id && 'bg-muted')}
                    >
                      <div className={cn('w-7 h-7 rounded-lg bg-linear-to-br flex items-center justify-center shrink-0 opacity-80', bMeta.color)}>
                        <BIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{b.displayName}</p>
                        <p className="text-xs text-muted-foreground">{bMeta.label}</p>
                      </div>
                      {b.id === business?.id && <Badge variant="secondary" className="text-[10px] px-1.5">Active</Badge>}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{business?.displayName ?? 'Brand Portal'}</p>
              <p className="text-[10px] text-muted-foreground">{catMeta.label} · Zoomies</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/brand/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300',
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          {isAdmin && (
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => router.push('/admin')}>
              <Shield className="w-4 h-4" />
              Admin Portal
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => signOut().then(() => router.push('/login'))}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <Link href="/brand/settings" className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition-colors">
            <Avatar>
              <AvatarFallback className="bg-amber-500 text-white">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'B'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name || 'Brand Owner'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-40 h-16 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            <Link href="/brand/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className={cn('w-8 h-8 bg-linear-to-br rounded-xl flex items-center justify-center', catMeta.color)}>
                <CatIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">{business?.displayName ?? 'Brand Portal'}</span>
            </Link>

            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold">
                {navigation.find((n) => pathname === n.href || (n.href !== '/brand/dashboard' && pathname.startsWith(n.href)))?.name || 'Brand Portal'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" className="inline-flex items-center gap-2 h-9 px-3" onClick={() => router.push('/admin')}>
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border">
        <div className="flex items-center justify-around h-16">
          {mobileNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/brand/dashboard' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn('flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors', isActive ? 'text-amber-500' : 'text-muted-foreground')}
              >
                <item.icon className={cn('w-5 h-5', isActive && 'stroke-[2.5px]')} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
