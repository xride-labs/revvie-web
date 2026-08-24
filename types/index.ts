// API Response wrapper types
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: {
    code: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data?: {
    items: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
}

// User roles matching Prisma schema
export type UserRole = 'ADMIN' | 'CO_ADMIN' | 'CLUB_OWNER' | 'RIDER'

export type ClubMemberRole = 'MEMBER' | 'OFFICER' | 'ADMIN' | 'FOUNDER'

export type RideStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export type RideParticipantStatus =
  'REQUESTED' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED'

export type ListingStatus = 'ACTIVE' | 'SOLD' | 'INACTIVE'

export type PostType = 'ride' | 'content' | 'listing' | 'club-activity'

// User interface
export interface User {
  id: string
  username: string | null
  name: string | null
  email: string | null
  dob?: Date | null
  bloodType: string | null
  emailVerified: boolean | null
  avatar: string | null
  coverImage?: string | null
  phone: string | null
  phoneVerified: boolean | null
  bio: string | null
  location: string | null
  ridesCompleted?: number | null
  xpPoints?: number | null
  level?: number | null
  levelTitle?: string | null
  reputationScore?: number | null
  activityLevel?: string | null
  roles?: UserRole[]
  role?: UserRole[]
  experience?: {
    xpPoints: number
    level: number
    levelTitle: string
    nextLevelXp: number
    progressPercent: number
    reputationScore: number
    activityLevel: string
  } | null
  bikes?: Bike[]
  clubs?: Array<{
    id: string
    name: string
    role: ClubMemberRole
    joinedAt: Date
    memberCount: number
    logo: string | null
  }>
  rideStats?: {
    totalDistanceKm: number
    longestRideKm: number
    nightRides: number
    weekendRides: number
  } | null
  badges?: Array<{
    id: string
    title: string
    auraPoints: number
    icon: string | null
    earnedAt: Date
  }>
  social?: {
    followers: number
    following: number
    friends: number
  }
  safety?: {
    emergencyContacts: {
      count: number
      items: EmergencyContact[]
    }
    helmetVerified: boolean
    lastSafetyCheck: Date | null
  }
  preferences?: UserPreferences | null
  createdAt: Date
  updatedAt: Date
}

// Bike interface for user profile
export interface Bike {
  id: string
  make: string
  model: string
  year: number
  type?: string
  engineCc?: number
  color?: string | null
  odo?: number
  ownerSince?: Date | null
  modifications?: Record<string, unknown> | null
  isPrimary?: boolean
  image?: string | null
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  relationship?: string | null
  isPrimary: boolean
}

export interface UserPreferences {
  rideReminders: boolean
  serviceReminderKm: number
  darkMode: boolean
  units: string
  openToInvite: boolean
  pushNotifications?: boolean
  emailNotifications?: boolean
  smsNotifications?: boolean
  profileVisibility?: string
  showLocation?: boolean
  showBikes?: boolean
  showStats?: boolean
}

// Club interfaces
export interface Club {
  id: string
  name: string
  description: string | null
  location: string | null
  establishedAt: Date | null
  verified: boolean
  image: string | null
  coverImage: string | null
  clubType: string | null
  isPublic: boolean
  memberCount: number
  trophies: string[]
  trophyCount: number
  gallery: string[]
  reputation: number | null
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface ClubMember {
  id: string
  clubId: string
  userId: string
  role: ClubMemberRole
  joinedAt: Date
  user?: User
}

export interface ClubWithDetails extends Club {
  owner: User
  members: ClubMember[]
  pendingRequests?: ClubMember[]
}

// Ride interfaces
export interface Ride {
  id: string
  title: string
  description: string | null
  startLocation: string
  endLocation: string | null
  experienceLevel: string | null
  xpRequired: number | null
  pace: string | null
  distance: number | null
  duration: number | null
  scheduledAt: Date | null
  status: RideStatus
  chatGroupId: string | null
  chatLocked: boolean
  creatorId: string
  createdAt: Date
  updatedAt: Date
}

export interface RideParticipant {
  id: string
  rideId: string
  userId: string
  status: RideParticipantStatus
  joinedAt: Date
  user?: User
}

export interface RideWithDetails extends Ride {
  creator: User
  participants: RideParticipant[]
  participantCount: number
}

// Marketplace interfaces
export interface MarketplaceListing {
  id: string
  title: string
  description: string | null
  price: number
  currency: string
  images: string[]
  category: string | null
  subcategory: string | null
  specifications: string | null
  condition: string | null
  status: ListingStatus
  sellerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  listingId: string
  reviewerId: string
  rating: number
  comment: string | null
  createdAt: Date
  updatedAt: Date
  reviewer?: User
}

export interface ListingWithDetails extends MarketplaceListing {
  seller: User
  reviews: Review[]
  averageRating: number
  reviewCount: number
}

// Post interfaces
export interface Post {
  id: string
  type: PostType
  content: string | null
  images: string[]
  authorId: string
  rideId: string | null
  listingId: string | null
  clubId: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Like {
  id: string
  postId: string
  userId: string
  createdAt: Date
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  content: string
  createdAt: Date
  updatedAt: Date
  author?: User
}

export interface PostWithDetails extends Post {
  author: User
  likes: Like[]
  comments: Comment[]
  likeCount: number
  commentCount: number
  isLiked: boolean
}

// Follow interface
export interface Follow {
  id: string
  followerId: string
  followingId: string
  createdAt: Date
}

// Chat interface
export interface ChatMessage {
  id: string
  chatGroupId: string
  senderId: string
  content: string
  timestamp: Date
  sender?: User
}

// Admin dashboard stats
export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalClubs: number
  totalRides: number
  totalListings: number
  newUsersToday: number
  newUsersThisWeek: number
  revenue: number
}

// Notification interface
export interface Notification {
  id: string
  userId: string
  type:
    'ride_invite' | 'club_request' | 'follow' | 'like' | 'comment' | 'message' | 'system'
  title: string
  message: string
  read: boolean
  data?: Record<string, unknown>
  createdAt: Date
}
