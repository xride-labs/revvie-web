'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/use-auth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const NAV_LINKS = [
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Events', href: '/events', icon: Calendar },
]

/**
 * Header for the public browsing pages (`/marketplace`, `/events`). Much
 * lighter than `AppLayout` — no sidebar, no manager-only gate — since anyone,
 * signed in or not, can be here.
 */
export function PublicHeader() {
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuth()

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <img src="/revvie-logo.png" alt="Revvie" className="h-8 w-8 rounded-lg" />
            <span className="hidden text-lg font-bold sm:inline">Revvie</span>
          </Link>

          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{link.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {isAuthenticated ? (
          <Link href="/home" className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || <User className="h-4 w-4" />}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Button asChild size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
