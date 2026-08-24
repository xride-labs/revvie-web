import { Shield, Users, Store } from 'lucide-react'

export const PENDING_BRAND_KEY = 'revvie_pending_brand'

export type LoginTab = 'club' | 'brand' | 'admin'
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
    roles: ['CLUB_OWNER', 'CLUB_ADMIN', 'CLUB_MODERATOR', 'ADMIN', 'CO_ADMIN', 'MODERATOR'],
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
    roles: ['BRAND_OWNER', 'BRAND_ADMIN', 'BRAND_MODERATOR', 'ADMIN', 'CO_ADMIN'],
    registerHref: '/brand-register',
    registerLabel: 'Register your brand',
    accentClass: 'from-amber-500 to-orange-500',
    activeTabClass: 'bg-amber-500/10 border border-amber-500/30 text-amber-400',
    placeholder: 'brand@company.com',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    description: 'Platform administrators only',
    redirectTo: '/admin',
    roles: ['ADMIN', 'CO_ADMIN'],
    registerHref: '',
    registerLabel: '',
    accentClass: 'from-brand-red-light to-brand-red',
    activeTabClass:
      'bg-brand-red-light/10 border border-brand-red-light/30 text-brand-red-light',
    placeholder: 'admin@revvie.com',
  },
}

export const PORTAL_FEATURES = [
  'Manage riding clubs & member rosters',
  'Run events, challenges & leaderboards',
  'Track rides, stats & group activity',
  'Sell gear on the Revvie marketplace',
]
