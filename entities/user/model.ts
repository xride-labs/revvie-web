import { z } from 'zod'

/**
 * User profile shape — transcribed from a real `GET /account/me` response (2026-08-23).
 *
 * Corrections from the old type: `social`/`preferences` are objects with many more real
 * fields than the four the old type invented; `safety.emergencyContacts.items` carries
 * `userId`/`createdAt`/`updatedAt` too; `clubs` entries carry `memberCount`/`logo` (not
 * `avatar`); and `badges`/`rideStats` did not exist on the old type at all despite the
 * profile page reading them.
 */

export const bikeSchema = z.object({
  id: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number().int(),
  type: z.string().nullable().optional(),
  engineCc: z.number().int().nullable().optional(),
  color: z.string().nullable().optional(),
  odo: z.number().nullable().optional(),
  ownerSince: z.string().nullable().optional(),
  modifications: z.unknown().nullable().optional(),
  isPrimary: z.boolean().optional(),
  image: z.string().nullable().optional(),
  licensePlate: z.string().nullable().optional(),
})

export const clubBadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  joinedAt: z.string(),
  memberCount: z.number().int().default(0),
  /** NOT `avatar` on this trimmed record. */
  logo: z.string().nullable().default(null),
})

export const achievementBadgeSchema = z.object({
  id: z.string(),
  title: z.string(),
  auraPoints: z.number().int().default(0),
  icon: z.string().default(''),
  earnedAt: z.string(),
})

export const emergencyContactSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  phone: z.string(),
  relationship: z.string().nullable().optional(),
  isPrimary: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})

export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string().nullable().default(null),
  name: z.string(),
  email: z.string().optional(),
  avatar: z.string().nullable().default(null),
  coverImage: z.string().nullable().default(null),
  bio: z.string().nullable().default(null),
  location: z.string().nullable().default(null),
  bloodType: z.string().nullable().default(null),

  bikes: z.array(bikeSchema).default([]),
  clubs: z.array(clubBadgeSchema).default([]),
  badges: z.array(achievementBadgeSchema).default([]),

  ridesCompleted: z.number().int().default(0),
  roles: z.array(z.string()).default([]),
  onboardingCompleted: z.boolean().default(false),

  experience: z
    .object({
      xpPoints: z.number(),
      level: z.number(),
      levelTitle: z.string(),
      nextLevelXp: z.number(),
      progressPercent: z.number(),
      reputationScore: z.number(),
      activityLevel: z.string(),
    })
    .optional(),

  rideStats: z
    .object({
      totalDistanceKm: z.number().default(0),
      longestRideKm: z.number().default(0),
      nightRides: z.number().int().default(0),
      weekendRides: z.number().int().default(0),
    })
    .optional(),

  social: z
    .object({
      followers: z.number().int(),
      following: z.number().int(),
      friends: z.number().int(),
    })
    .optional(),

  safety: z
    .object({
      emergencyContacts: z.object({
        count: z.number().int(),
        items: z.array(emergencyContactSchema),
      }),
      helmetVerified: z.boolean(),
      lastSafetyCheck: z.string().nullable().optional(),
    })
    .optional(),

  /** More fields exist here than the UI currently reads; kept loose deliberately —
   *  this object grows on the backend faster than the UI catches up. */
  preferences: z
    .object({
      rideReminders: z.boolean(),
      serviceReminderKm: z.number(),
      darkMode: z.boolean(),
      units: z.string(),
      openToInvite: z.boolean(),
    })
    .loose()
    .optional(),

  subscriptionTier: z.string().nullable().optional(),
  createdAt: z.string().optional(),
})

export type Bike = z.infer<typeof bikeSchema>
export type ClubBadge = z.infer<typeof clubBadgeSchema>
export type AchievementBadge = z.infer<typeof achievementBadgeSchema>
export type EmergencyContact = z.infer<typeof emergencyContactSchema>
export type UserProfile = z.infer<typeof userProfileSchema>

export const PROFILE_CACHE_TAG = 'profile'
export const userCacheTag = (id: string) => `user:${id}`
