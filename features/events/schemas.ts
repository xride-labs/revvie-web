
export interface TicketTier {
  id: string
  name: string
  description?: string | null
  price: number
  quantity: number
  availableQuantity: number
  maxPerUser: number
}

export interface EventOrder {
  id: string
  orderNumber: string
  eventId: string
  userId: string
  totalAmount: number
  commissionRate: number
  platformFee: number
  organiserEarnings: number
  paymentMethod: 'UPI' | 'CASH' | 'FREE'
  paymentStatus: 'COMPLETED' | 'PENDING_CASH' | 'FAILED' | 'REFUNDED'
  upiTransactionRef?: string | null
  createdAt: string
  user?: {
    id: string
    name?: string | null
    avatar?: string | null
    username?: string | null
  }
}

export interface EventTicket {
  id: string
  ticketCode: string
  orderId: string
  eventId: string
  userId: string
  tierId?: string | null
  status: 'BOOKED' | 'USED' | 'CANCELLED'
  scannedAt?: string | null
  scannedById?: string | null
  createdAt: string
  tier?: TicketTier | null
  order?: EventOrder | null
  event?: EventItem
  user?: {
    id: string
    name?: string | null
    avatar?: string | null
    username?: string | null
    phone?: string | null
  }
}

export interface EventItem {
  id: string
  title: string
  description?: string | null
  location?: string | null
  latitude?: number | null
  longitude?: number | null
  scheduledAt: string
  endedAt?: string | null
  status: 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  isFeatured: boolean
  bannerImage?: string | null
  ticketUrl?: string | null
  visibility: 'PUBLIC' | 'CLUB_ONLY' | 'PRIVATE'
  category?: string | null
  price?: number | null
  maxAttendees?: number | null
  creatorId: string
  clubId?: string | null
  creator?: {
    id: string
    name?: string | null
    avatar?: string | null
    username?: string | null
  }
  club?: {
    id: string
    name: string
    image?: string | null
    memberCount?: number
    ownerId?: string
  } | null
  ticketTiers?: TicketTier[]
  isAttending?: boolean
  isHost?: boolean
  participantCount: number
  ticketsSold?: number
  myTickets?: EventTicket[]
  attendees?: Array<{
    id: string
    name?: string | null
    avatar?: string | null
    username?: string | null
  }>
  createdAt?: string
}

export interface CreateTicketTierInput {
  name: string
  description?: string
  price: number
  quantity: number
  maxPerUser?: number
}

export interface CreateEventInput {
  title: string
  description?: string
  location?: string
  latitude?: number
  longitude?: number
  scheduledAt: string
  endedAt?: string
  clubId?: string
  bannerImage?: string
  ticketUrl?: string
  visibility?: 'PUBLIC' | 'CLUB_ONLY' | 'PRIVATE'
  category?: string
  price?: number
  maxAttendees?: number
  tiers?: CreateTicketTierInput[]
}

export interface BookTicketInput {
  tierId?: string
  quantity: number
  paymentMethod: 'UPI' | 'CASH' | 'FREE'
  upiTransactionRef?: string
}

export interface ValidateTicketResult {
  valid: boolean
  alreadyUsed: boolean
  scannedAt?: string | null
  ticket?: EventTicket
  attendee?: {
    id: string
    name?: string | null
    avatar?: string | null
    username?: string | null
    phone?: string | null
  }
}

export interface EventMetrics {
  totalTicketsSold: number
  totalOrders: number
  checkedInCount: number
  grossRevenue: number
  platformFee: number
  commissionRatePercent: string
  netOrganiserEarnings: number
  tiers: TicketTier[]
  recentTickets: EventTicket[]
  recentOrders: EventOrder[]
}

export interface EventsResponse {
  events: EventItem[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}
