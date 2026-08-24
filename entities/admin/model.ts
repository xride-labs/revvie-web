import { z } from 'zod'

/**
 * Admin domain — spot-checked against a live backend (seeded admin session, 2026-08-23)
 * and `backend/src/routes/admin/admin.routes.ts`. Unlike clubs/rides/marketplace/feed,
 * the primary CRUD list endpoints here (stats, users, clubs, rides, marketplace,
 * settings, notifications, ad-campaigns) matched the old `lib/server/admin` types almost
 * exactly — that domain reads as having been built with real care.
 *
 * The exception is `/admin/approvals`: its old `PendingClub`/`PendingRideRequest` types
 * were wrong (`PendingClub` claimed `location`/`clubType`/`memberCount`, none of which
 * exist; `PendingRideRequest` was declared flat — `rideId`/`rideTitle`/`userName` — but
 * the real response nests `ride: {id,title,status}` and `user: {id,name,email,avatar}`
 * with a `status` field the old type didn't have at all). Rebuilt from the route
 * handler's own Prisma `select` clause, which is unambiguous ground truth.
 */

export const adminStatsSchema = z.object({
  overview: z.object({
    totalUsers: z.number(),
    totalRides: z.number(),
    totalClubs: z.number(),
    totalListings: z.number(),
    activeRides: z.number(),
    completedRides: z.number(),
    verifiedClubs: z.number(),
    pendingReports: z.number(),
    highPriorityReports: z.number(),
  }),
  recent: z.object({
    newUsersLast7Days: z.number(),
    newRidesLast7Days: z.number(),
    reportsLast7Days: z.number(),
  }),
  breakdown: z.object({
    usersByRole: z.record(z.string(), z.number()),
    ridesByStatus: z.record(z.string(), z.number()),
  }),
})

export const adminWeeklyActivitySchema = z.object({
  days: z.number(),
  activity: z.array(
    z.object({
      label: z.string(),
      date: z.string(),
      usersRegistered: z.number(),
      ridesCreated: z.number(),
      clubsCreated: z.number(),
      listingsCreated: z.number(),
      reportsCreated: z.number(),
    }),
  ),
})

const trimmedActorSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  // Sometimes an explicit `null`, sometimes the key is missing entirely — both observed
  // live across rides/clubs/listings admin records.
  image: z.string().nullable().optional(),
})

export const adminUserRecordSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  username: z.string().nullable().optional(),
  image: z.string().nullable(),
  coverImage: z.string().nullable().optional(),
  phone: z.string().nullable(),
  bio: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  activityLevel: z.string().optional(),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
  status: z.enum(['active', 'pending']).optional(),
  lastActive: z.string().optional(),
  roles: z.array(z.string()),
  ridesCompleted: z.number().nullable(),
  createdAt: z.string(),
  _count: z.object({
    createdRides: z.number(),
    createdClubs: z.number(),
  }),
})

/**
 * `GET /admin/users/:id` — NOT a superset of `adminUserRecordSchema` despite the old
 * type's `extends`. Verified live: the detail response has no `ridesCompleted` and no
 * `_count` field at all, so those cannot be required here.
 */
export const adminUserDetailSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  username: z.string().nullable(),
  image: z.string().nullable(),
  coverImage: z.string().nullable(),
  phone: z.string().nullable(),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  activityLevel: z.string(),
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  status: z.enum(['active', 'pending']),
  lastActive: z.string().nullable(),
  roles: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  dob: z.string().nullable(),
  bloodType: z.string().nullable(),
  interests: z.array(z.string()),
  onboardingCompleted: z.boolean(),
  xpPoints: z.number().nullable(),
  level: z.number(),
  levelTitle: z.string(),
  reputationScore: z.number().nullable(),
  helmetVerified: z.boolean(),
  lastSafetyCheck: z.string().nullable(),
  subscriptionTier: z.string().nullable(),
  rideStats: z
    .object({
      totalDistanceKm: z.number(),
      longestRideKm: z.number(),
      totalRides: z.number(),
      nightRides: z.number(),
      weekendRides: z.number(),
      soloRides: z.number(),
      groupRides: z.number(),
      avgRideDistanceKm: z.number(),
      totalRideTimeMin: z.number(),
    })
    .nullable(),
  preferences: z
    .object({
      rideReminders: z.boolean(),
      serviceReminderKm: z.number(),
      darkMode: z.boolean(),
      units: z.string(),
      openToInvite: z.boolean(),
      pushNotifications: z.boolean(),
      emailNotifications: z.boolean(),
      smsNotifications: z.boolean(),
      profileVisibility: z.string(),
      showLocation: z.boolean(),
      showBikes: z.boolean(),
      lowDataMode: z.boolean(),
      showStats: z.boolean(),
    })
    .nullable(),
  emergencyContacts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      phone: z.string(),
      relationship: z.string().nullable(),
      isPrimary: z.boolean(),
    }),
  ),
  badges: z.array(
    z.object({
      earnedAt: z.string(),
      badge: z.object({
        id: z.string(),
        name: z.string(),
        icon: z.string().nullable(),
        category: z.string().nullable(),
        requirement: z.string().nullable(),
        auraPoints: z.number(),
      }),
    }),
  ),
  counts: z.object({
    createdRides: z.number(),
    createdClubs: z.number(),
    posts: z.number(),
    comments: z.number(),
    followers: z.number(),
    following: z.number(),
    marketplaceListings: z.number(),
    clubMemberships: z.number(),
    rideParticipations: z.number(),
    eventParticipations: z.number(),
    notifications: z.number(),
  }),
  unreadNotifications: z.number(),
})

export const adminRideRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startLocation: z.string(),
  endLocation: z.string().nullable(),
  experienceLevel: z.string().nullable(),
  pace: z.string().nullable(),
  distance: z.number().nullable(),
  duration: z.number().nullable(),
  scheduledAt: z.string().nullable(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  creator: trimmedActorSchema,
  _count: z.object({ participants: z.number() }),
})

export const adminClubRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  establishedAt: z.string().nullable(),
  verified: z.boolean(),
  image: z.string().nullable(),
  coverImage: z.string().nullable(),
  clubType: z.string().nullable(),
  isPublic: z.boolean(),
  memberCount: z.number(),
  trophies: z.array(z.string()),
  trophyCount: z.number(),
  gallery: z.array(z.string()),
  reputation: z.number().nullable(),
  owner: trimmedActorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  _count: z.object({ members: z.number() }),
})

export const adminListingRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  price: z.number(),
  currency: z.string(),
  images: z.array(z.string()),
  category: z.string().nullable(),
  subcategory: z.string().nullable(),
  specifications: z.string().nullable(),
  condition: z.string().nullable(),
  status: z.string(),
  seller: trimmedActorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const adminReportRecordSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  description: z.string().optional(),
  reportedItem: z.object({ id: z.string(), name: z.string(), type: z.string() }),
  reporter: z.object({ id: z.string(), name: z.string() }),
  status: z.string(),
  priority: z.string(),
  createdAt: z.string(),
})

export const adminNotificationRecordSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string().nullable().optional(),
  relatedType: z.string().nullable().optional(),
  relatedId: z.string().nullable().optional(),
  isRead: z.boolean(),
  readAt: z.string().nullable(),
  sentViaEmail: z.boolean(),
  sentViaPush: z.boolean(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
})

export const adminSettingsSchema = z.object({
  siteName: z.string(),
  siteUrl: z.string(),
  supportEmail: z.string(),
  timezone: z.string(),
  defaultCurrency: z.string(),
  maintenanceMode: z.boolean(),
  allowRegistration: z.boolean(),
  marketplaceEnabled: z.boolean(),
  clubCreationEnabled: z.boolean(),
  requireAdmin2FA: z.boolean(),
  sessionTimeoutMinutes: z.number(),
  passwordStrength: z.enum(['basic', 'medium', 'strong']),
  loginAttempts: z.number(),
  notifyNewUser: z.boolean(),
  notifyNewReports: z.boolean(),
  notifyClubVerification: z.boolean(),
  notifySystemAlerts: z.boolean(),
  notifyDailySummary: z.boolean(),
  smtpHost: z.string(),
  smtpPort: z.number(),
  smtpUser: z.string(),
  smtpPass: z.string(),
  fromEmail: z.string(),
  fromName: z.string(),
  welcomeEmailSubject: z.string(),
  welcomeEmailBody: z.string(),
  primaryColor: z.string(),
  darkModeDefault: z.boolean(),
  compactMode: z.boolean(),
  // Present on the wire, absent from the old type — passed through rather than dropped.
  id: z.string().optional(),
  scope: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

// ── Approvals — rebuilt from the route handler's Prisma `select`, not the old type ────

export const pendingClubSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  verified: z.boolean(),
  createdAt: z.string(),
  owner: z.object({ id: z.string(), name: z.string().nullable() }),
  _count: z.object({ members: z.number() }),
})

export const pendingClubRequestSchema = z.object({
  id: z.string(),
  status: z.string(),
  createdAt: z.string(),
  club: z.object({ id: z.string(), name: z.string() }),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
})

export const pendingRideRequestSchema = z.object({
  id: z.string(),
  status: z.string(),
  joinedAt: z.string(),
  ride: z.object({ id: z.string(), title: z.string(), status: z.string() }),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
    avatar: z.string().nullable(),
  }),
})

export const businessVerificationStatusSchema = z.enum([
  'PENDING',
  'SUBMITTED',
  'APPROVED',
  'REJECTED',
])

export const pendingBusinessSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  categories: z.array(z.string()),
  slug: z.string(),
  logoUrl: z.string().nullable(),
  city: z.string().nullable(),
  region: z.string().nullable(),
  country: z.string().nullable(),
  verification: businessVerificationStatusSchema,
  verificationNotes: z.string().nullable(),
  createdAt: z.string(),
  owner: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string().nullable(),
  }),
})

export const adCampaignStatusSchema = z.enum([
  'DRAFT',
  'PENDING_APPROVAL',
  'ACTIVE',
  'PAUSED',
  'COMPLETED',
  'REJECTED',
])

export const adminAdCampaignSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  title: z.string(),
  ctaLabel: z.string(),
  ctaUrl: z.string().nullable(),
  deepLink: z.string().nullable().optional(),
  imageUrl: z.string(),
  videoUrl: z.string().nullable().optional(),
  startsAt: z.string(),
  endsAt: z.string(),
  budgetPaise: z.number(),
  status: adCampaignStatusSchema,
  slots: z.array(z.string()).optional(),
  targetTags: z.array(z.string()).optional(),
  impressionCap: z.number().nullable().optional(),
  impressionCount: z.number(),
  clickCount: z.number(),
  reviewNotes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  business: z.object({
    id: z.string(),
    displayName: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
  }),
})

export const adminDiscountSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  code: z.string().nullable(),
  title: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  percentOff: z.number().nullable(),
  amountOffPaise: z.number().nullable(),
  validFrom: z.string(),
  validUntil: z.string(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
  business: z.object({
    id: z.string(),
    displayName: z.string(),
    slug: z.string(),
    logoUrl: z.string().nullable(),
  }),
})

export type AdminStats = z.infer<typeof adminStatsSchema>
export type AdminWeeklyActivity = z.infer<typeof adminWeeklyActivitySchema>
export type AdminUserRecord = z.infer<typeof adminUserRecordSchema>
export type AdminUserDetails = z.infer<typeof adminUserDetailSchema>
export type AdminRideRecord = z.infer<typeof adminRideRecordSchema>
export type AdminClubRecord = z.infer<typeof adminClubRecordSchema>
export type AdminListingRecord = z.infer<typeof adminListingRecordSchema>
export type AdminReportRecord = z.infer<typeof adminReportRecordSchema>
export type AdminNotificationRecord = z.infer<typeof adminNotificationRecordSchema>
export type AdminSettings = z.infer<typeof adminSettingsSchema>
export type PendingClub = z.infer<typeof pendingClubSchema>
export type PendingClubRequest = z.infer<typeof pendingClubRequestSchema>
export type PendingRideRequest = z.infer<typeof pendingRideRequestSchema>
export type PendingBusiness = z.infer<typeof pendingBusinessSchema>
export type AdCampaignStatus = z.infer<typeof adCampaignStatusSchema>
export type AdminAdCampaign = z.infer<typeof adminAdCampaignSchema>
export type AdminDiscount = z.infer<typeof adminDiscountSchema>
