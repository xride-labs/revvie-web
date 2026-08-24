import { z } from 'zod'

import { userProfileSchema, type Bike } from '@/entities/user/model'

export const meResponseSchema = z.object({
  user: userProfileSchema,
})

export const publicProfileResponseSchema = z.object({
  user: userProfileSchema,
})

/** `PATCH /users/me` — verified against the backend's `updateProfileSchema` in
 *  `src/validators/schemas.ts`. `bloodType` is a strict enum, not a free string; a
 *  `username` field exists here even though the entity has no username-lookup route
 *  (see the profile-by-username issue documented on `entities/user/model.ts`). */
export const updateProfileInputSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  username: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(500).optional(),
  location: z.string().trim().max(200).optional(),
  dob: z.string().optional(),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  avatar: z.string().optional(),
  coverImage: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  ghostModeEnabled: z.boolean().optional(),
  interests: z.array(z.string()).optional(),
  activityLevel: z.enum(['Casual', 'Regular', 'Enthusiast', 'Pro']).optional(),
  onboardingCompleted: z.boolean().optional(),
})

export const createBikeInputSchema = z.object({
  make: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.number().int().min(1900),
  type: z.string().optional(),
  engineCc: z.number().int().positive().optional(),
  color: z.string().optional(),
  isPrimary: z.boolean().optional(),
  image: z.string().optional(),
})

export const updateBikeInputSchema = createBikeInputSchema.partial()

export type MeResponse = z.infer<typeof meResponseSchema>
export type PublicProfileResponse = z.infer<typeof publicProfileResponseSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>
export type CreateBikeInput = z.infer<typeof createBikeInputSchema>
export type UpdateBikeInput = z.infer<typeof updateBikeInputSchema>
export type { Bike }
