import { Users, Store } from 'lucide-react'
import { BRAND_PORTAL_ROLES, CLUB_PORTAL_ROLES } from '@/core/auth/roles'

export const PENDING_BRAND_KEY = 'revvie_pending_brand'

export type LoginTab = 'club' | 'brand'
export type AuthMode = 'password' | 'otp'
export type OtpStep = 'request' | 'verify'

export const TAB_CONFIG: Record<
  LoginTab,
  {
    label: string
    icon: React.ElementType
    description: string
    redirectTo: string
    roles: string[]
    registerHref: string
    registerLabel: string
    accentClass: string
    activeTabClass: string
    placeholder: string
  }
> = {
  club: {
    label: 'Club Manager',
    icon: Users,
    description: 'For club owners and organizers',
    redirectTo: '/home',
    // Pre-login there is no permission context — session roles stay the login
    // vocabulary, sourced from roles.ts so a rename is a compile error.
    roles: [...CLUB_PORTAL_ROLES],
    registerHref: '/signup',
    registerLabel: 'Register your club',
    accentClass: 'from-neon-green/80 to-neon-green',
    activeTabClass: 'bg-neon-green/10 border border-neon-green/30 text-neon-green',
    placeholder: 'club@revvie.com',
  },
  brand: {
    label: 'Brand Owner',
    icon: Store,
    description: 'For brands & marketplace sellers',
    redirectTo: '/brand/dashboard',
    roles: [...BRAND_PORTAL_ROLES],
    registerHref: '/brand-register',
    registerLabel: 'Register your brand',
    accentClass: 'from-primary to-primary',
    activeTabClass: 'bg-primary/10 border border-primary/30 text-primary',
    placeholder: 'brand@company.com',
  },
}

export const PORTAL_FEATURES = [
  'Manage riding clubs & member rosters',
  'Run events, challenges & leaderboards',
  'Track rides, stats & group activity',
  'Sell gear on the Revvie marketplace',
]
