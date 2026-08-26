'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  Home,
  Users,
  MapPin,
  ShoppingBag,
  User,
  Plus,
  Bell,
  Search,
  LogOut,
  Shield,
  Store,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth, hasAnyRole } from '@/lib/use-auth'
import { signOut } from '@/lib/auth-client'
import { useEffect } from 'react'
import { PhantomLoader } from '@/components/loading/phantom-loader'
import { useClubContext } from '@/contexts/club-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'

const navigation = [
  { name: 'Feed', href: '/home', icon: Home },
  { name: 'Clubs', href: '/clubs', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Rides', href: '/rides', icon: MapPin },
  { name: 'Market', href: '/marketplace', icon: ShoppingBag },
  { name: 'Profile', href: '/profile', icon: User },
]

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, hasSession, isPending, error } = useAuth()
  const { club: activeClub, clubs, selectClub } = useClubContext()
  const debugAuth = process.env.NODE_ENV !== 'production'

  // Check if user has access to club management portal
  const hasManagerAccess = hasAnyRole(
    user,
    'CLUB_OWNER',
    'CLUB_ADMIN',
    'CLUB_MODERATOR',
    'BRAND_OWNER',
    'BRAND_ADMIN',
    'BRAND_MODERATOR',
    'CO_ADMIN',
    'ADMIN',
    'MODERATOR',
  )
  const isAdmin = hasAnyRole(user, 'ADMIN', 'CO_ADMIN', 'MODERATOR')
  const hasBrandAccess = hasAnyRole(
    user,
    'BRAND_OWNER',
    'BRAND_ADMIN',
    'BRAND_MODERATOR',
    'ADMIN',
    'CO_ADMIN',
  )

  useEffect(() => {
    if (debugAuth) {
      console.log('[AppLayout] auth guard', {
        pathname,
        isPending,
        hasSession,
        hasUser: !!user,
        hasManagerAccess,
        error,
        userRoles: user?.roles || [],
      })
    }

    if (isPending) return

    if (!hasSession) {
      if (debugAuth) {
        console.warn('[AppLayout] no session -> /login')
      }
      router.push('/login')
      return
    }

    if (!user) {
      if (debugAuth) {
        console.warn(
          '[AppLayout] session exists but profile missing; waiting for hydration',
        )
      }
      return
    }

    // If user doesn't have manager/admin access, redirect to login
    if (!hasManagerAccess) {
      if (debugAuth) {
        console.warn('[AppLayout] no manager access -> /')
      }
      router.push('/')
      return
    }
  }, [user, hasSession, isPending, router, hasManagerAccess, pathname, error, debugAuth])

  if (isPending || (hasSession && !user)) {
    return (
      <PhantomLoader loading>
        <div className="min-h-screen bg-background flex">
          <aside className="hidden lg:flex lg:w-72 lg:flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center gap-2 px-6 border-b border-border">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex-1 p-4 space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-2xl" />
              ))}
            </div>
          </aside>
          <main className="flex-1 p-6">
            <Skeleton className="h-10 w-48 mb-6" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          </main>
        </div>
      </PhantomLoader>
    )
  }

  if (!user || !hasManagerAccess) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:w-72 lg:flex-col border-r border-border bg-card">
        {/* Logo + Club Identity */}
        <div className="flex h-16 items-center gap-3 px-4 border-b border-border">
          {activeClub ? (
            <>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm">
                {activeClub.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold truncate leading-tight">
                  {activeClub.name}
                </p>
                <p className="text-[10px] text-muted-foreground">Club Management</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-base">⚡</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-wide leading-tight">
                  Revvie
                </p>
                <p className="text-[10px] text-muted-foreground">Club Portal</p>
              </div>
            </>
          )}
        </div>

        {/* Active Club Selector */}
        {clubs.length > 0 && (
          <div className="px-4 py-3 border-b border-border">
            {clubs.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-left">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {activeClub?.name ?? 'Select Club'}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {activeClub?.memberCount ?? 0} members
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Clubs
                  </p>
                  <DropdownMenuSeparator />
                  {clubs.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => selectClub(c.id)}
                      className={cn(
                        'flex items-center gap-2',
                        c.id === activeClub?.id && 'bg-muted',
                      )}
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.memberCount ?? 0} members
                        </p>
                      </div>
                      {c.id === activeClub?.id && (
                        <Badge variant="secondary" className="text-[10px] px-1.5">
                          Active
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/clubs/create')}>
                    <Plus className="w-4 h-4 mr-2" /> Create New Club
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{activeClub?.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {activeClub?.memberCount ?? 0} members
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/app' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all duration-300',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button asChild className="w-full justify-start gap-2" variant="outline">
            <Link href="/rides/create">
              <Plus className="w-4 h-4" />
              Create Ride
            </Link>
          </Button>
          <Button asChild className="w-full justify-start gap-2" variant="outline">
            <Link href="/marketplace/create">
              <ShoppingBag className="w-4 h-4" />
              New Listing
            </Link>
          </Button>
          <Button asChild className="w-full justify-start gap-2" variant="outline">
            <Link href="/clubs/create">
              <Users className="w-4 h-4" />
              Create Club
            </Link>
          </Button>
          {/* My Business — previously only reachable via a deep-link redirect.
              Surfaced here so owners can manage their businesses from the portal. */}
          <Button asChild className="w-full justify-start gap-2" variant="outline">
            <Link href="/business">
              <Store className="w-4 h-4" />
              My Business
            </Link>
          </Button>
          {hasBrandAccess && (
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              onClick={() => router.push('/brand/dashboard')}
            >
              <Store className="w-4 h-4" />
              Brand Portal
              <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
            </Button>
          )}
          {isAdmin && (
            <Button
              className="w-full justify-start gap-2"
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={() => signOut().then(() => router.push('/'))}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-muted transition-colors"
          >
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header - Mobile & Desktop */}
        <header className="sticky top-0 z-40 h-16 bg-background border-b-2 border-border">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile Logo */}
            <Link href="/home" className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">⚡</span>
              </div>
              <span className="text-lg font-bold text-foreground">Revvie</span>
            </Link>

            {/* Page Title - Desktop */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold">
                {navigation.find(
                  (n) =>
                    pathname === n.href ||
                    (n.href !== '/home' && pathname.startsWith(n.href)),
                )?.name || 'Revvie'}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 h-9 px-3"
                  onClick={() => router.push('/admin')}
                >
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="relative">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                  3
                </Badge>
              </Button>
              <Avatar className="lg:hidden">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  TR
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="pb-20 lg:pb-0">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border">
        <div className="flex items-center justify-around h-16">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/home' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground',
                )}
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
