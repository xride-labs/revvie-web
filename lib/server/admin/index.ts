import { apiAuthenticated } from '../base'

// ============ Types ============
export interface AdminStats {
  overview: {
    totalUsers: number
    totalRides: number
    totalClubs: number
    totalListings: number
    activeRides: number
    completedRides: number
    verifiedClubs: number
    pendingReports: number
    highPriorityReports: number
  }
  recent: {
    newUsersLast7Days: number
    newRidesLast7Days: number
    reportsLast7Days: number
  }
  breakdown: {
    usersByRole: Record<string, number>
    ridesByStatus: Record<string, number>
  }
}

export interface AdminWeeklyActivityPoint {
  label: string
  date: string
  usersRegistered: number
  ridesCreated: number
  clubsCreated: number
  listingsCreated: number
  reportsCreated: number
}

export interface AdminWeeklyActivity {
  days: number
  activity: AdminWeeklyActivityPoint[]
}

export interface AdminUserRecord {
  id: string
  email: string | null
  name: string | null
  username?: string | null
  image: string | null
  coverImage?: string | null
  phone: string | null
  bio?: string | null
  location?: string | null
  activityLevel?: string
  emailVerified?: boolean
  phoneVerified?: boolean
  status?: 'active' | 'pending'
  lastActive?: string
  roles: string[]
  ridesCompleted: number | null
  createdAt: string
  _count: {
    createdRides: number
    createdClubs: number
  }
}

export interface AdminUserDetails extends AdminUserRecord {
  dob: string | null
  bloodType: string | null
  interests: string[]
  onboardingCompleted: boolean
  xpPoints: number | null
  level: number
  levelTitle: string
  reputationScore: number | null
  helmetVerified: boolean
  lastSafetyCheck: string | null
  subscriptionTier: string | null
  rideStats: {
    totalDistanceKm: number
    longestRideKm: number
    totalRides: number
    nightRides: number
    weekendRides: number
    soloRides: number
    groupRides: number
    avgRideDistanceKm: number
    totalRideTimeMin: number
  } | null
  preferences: {
    rideReminders: boolean
    serviceReminderKm: number
    darkMode: boolean
    units: string
    openToInvite: boolean
    pushNotifications: boolean
    emailNotifications: boolean
    smsNotifications: boolean
    profileVisibility: string
    showLocation: boolean
    showBikes: boolean
    lowDataMode: boolean
    showStats: boolean
  } | null
  emergencyContacts: Array<{
    id: string
    name: string
    phone: string
    relationship: string | null
    isPrimary: boolean
  }>
  badges: Array<{
    earnedAt: string
    badge: {
      id: string
      name: string
      icon: string | null
      category: string | null
      requirement: string | null
      auraPoints: number
    }
  }>
  counts: {
    createdRides: number
    createdClubs: number
    posts: number
    comments: number
    followers: number
    following: number
    marketplaceListings: number
    clubMemberships: number
    rideParticipations: number
    eventParticipations: number
    notifications: number
  }
  unreadNotifications: number
  updatedAt: string
}

export interface AdminRideRecord {
  id: string
  title: string
  description: string | null
  startLocation: string
  endLocation: string | null
  experienceLevel: string | null
  pace: string | null
  distance: number | null
  duration: number | null
  scheduledAt: string | null
  status: string
  createdAt: string
  updatedAt: string
  creator: {
    id: string
    name: string | null
    image: string | null
  }
  _count: {
    participants: number
  }
}

export interface AdminClubRecord {
  id: string
  name: string
  description: string | null
  location: string | null
  establishedAt: string | null
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
  owner: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: string
  updatedAt: string
  _count: {
    members: number
  }
}

export interface AdminListingRecord {
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
  status: string
  seller: {
    id: string
    name: string | null
    image: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface AdminReportRecord {
  id: string
  type: string
  title: string
  description?: string
  reportedItem: { id: string; name: string; type: string }
  reporter: { id: string; name: string }
  status: string
  priority: string
  createdAt: string
}

export interface AdminPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedData<T> {
  items: T[]
  pagination: AdminPagination
}

export interface UserFilters {
  page?: number
  limit?: number
  role?: string
  status?: 'active' | 'pending'
  search?: string
}

export interface CreateAdminUserInput {
  email: string
  password: string
  name?: string
  username?: string
  phone?: string
  bio?: string
  location?: string
  activityLevel?: 'Casual' | 'Regular' | 'Enthusiast' | 'Pro'
  roles?: Array<'ADMIN' | 'CO_ADMIN' | 'RIDER' | 'CLUB_OWNER'>
}

export interface UpdateAdminUserInput {
  email?: string
  name?: string
  username?: string
  phone?: string | null
  bio?: string | null
  location?: string | null
  activityLevel?: 'Casual' | 'Regular' | 'Enthusiast' | 'Pro'
  emailVerified?: boolean
  phoneVerified?: boolean
  roles?: Array<'ADMIN' | 'CO_ADMIN' | 'RIDER' | 'CLUB_OWNER'>
}

export interface RideFilters {
  page?: number
  status?: string
  search?: string
}

export interface ClubFilters {
  page?: number
  verified?: boolean
  search?: string
}

export interface ListingFilters {
  page?: number
  status?: string
  search?: string
}

export interface ReportFilters {
  page?: number
  status?: string
}

export interface AdminNotificationRecord {
  id: string
  userId: string
  type: string
  title: string
  message?: string | null
  relatedType?: string | null
  relatedId?: string | null
  isRead: boolean
  readAt: string | null
  sentViaEmail: boolean
  sentViaPush: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    avatar: string | null
  }
}

export interface NotificationFilters {
  page?: number
  limit?: number
  userId?: string
  unreadOnly?: boolean
  type?: string
  search?: string
}

export interface AdminSettings {
  siteName: string
  siteUrl: string
  supportEmail: string
  timezone: string
  defaultCurrency: string
  maintenanceMode: boolean
  allowRegistration: boolean
  marketplaceEnabled: boolean
  clubCreationEnabled: boolean
  requireAdmin2FA: boolean
  sessionTimeoutMinutes: number
  passwordStrength: 'basic' | 'medium' | 'strong'
  loginAttempts: number
  notifyNewUser: boolean
  notifyNewReports: boolean
  notifyClubVerification: boolean
  notifySystemAlerts: boolean
  notifyDailySummary: boolean
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromEmail: string
  fromName: string
  welcomeEmailSubject: string
  welcomeEmailBody: string
  primaryColor: string
  darkModeDefault: boolean
  compactMode: boolean
}

export type AdminSettingsUpdate = Partial<AdminSettings>

// ============ Admin API ============

/**
 * Get admin dashboard statistics
 */
export async function getStats(): Promise<AdminStats> {
  return apiAuthenticated.get<AdminStats>('/admin/stats')
}

/**
 * Get weekly activity metrics for admin dashboard charts
 */
export async function getWeeklyActivity(days = 7): Promise<AdminWeeklyActivity> {
  return apiAuthenticated.get<AdminWeeklyActivity>(`/admin/activity/weekly?days=${days}`)
}

/**
 * Get all users with pagination and filters
 */
export async function getUsers(
  filters?: UserFilters,
): Promise<PaginatedData<AdminUserRecord>> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  return apiAuthenticated.get<PaginatedData<AdminUserRecord>>(
    `/admin/users?${queryParams}`,
  )
}

/**
 * Get user details by ID
 */
export async function getUserById(userId: string): Promise<AdminUserDetails> {
  return apiAuthenticated.get<AdminUserDetails>(`/admin/users/${userId}`)
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, role: string): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/users/${userId}/role`, { role })
}

/**
 * Update user status (active, suspended, etc.)
 */
export async function updateUserStatus(userId: string, status: string): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/users/${userId}/status`, {
    status,
  })
}

/**
 * Create a user from admin panel
 */
export async function createUser(data: CreateAdminUserInput): Promise<AdminUserRecord> {
  return apiAuthenticated.post<AdminUserRecord>('/admin/users', data)
}

/**
 * Update full user profile data from admin panel
 */
export async function updateUser(
  userId: string,
  data: UpdateAdminUserInput,
): Promise<AdminUserRecord> {
  return apiAuthenticated.patch<AdminUserRecord>(`/admin/users/${userId}`, data)
}

/**
 * Get all rides with filters
 */
export async function getRides(
  filters?: RideFilters,
): Promise<PaginatedData<AdminRideRecord>> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  return apiAuthenticated.get<PaginatedData<AdminRideRecord>>(
    `/admin/rides?${queryParams}`,
  )
}

/**
 * Get all clubs with filters
 */
export async function getClubs(
  filters?: ClubFilters,
): Promise<PaginatedData<AdminClubRecord>> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  return apiAuthenticated.get<PaginatedData<AdminClubRecord>>(
    `/admin/clubs?${queryParams}`,
  )
}

/**
 * Get all marketplace listings with filters
 */
export async function getListings(
  filters?: ListingFilters,
): Promise<PaginatedData<AdminListingRecord>> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  return apiAuthenticated.get<PaginatedData<AdminListingRecord>>(
    `/admin/marketplace?${queryParams}`,
  )
}

/**
 * Get all reports with filters
 */
export async function getReports(
  filters?: ReportFilters,
): Promise<PaginatedData<AdminReportRecord>> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  return apiAuthenticated.get<PaginatedData<AdminReportRecord>>(
    `/admin/reports?${queryParams}`,
  )
}

/**
 * Update report status
 */
export async function updateReport(
  reportId: string,
  data: { status: string; resolution?: string },
): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/reports/${reportId}`, data)
}

/**
 * Get notifications (admin)
 */
export async function getNotifications(
  filters?: NotificationFilters,
): Promise<PaginatedData<AdminNotificationRecord>> {
  const queryParams = new URLSearchParams()
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value))
      }
    })
  }
  return apiAuthenticated.get<PaginatedData<AdminNotificationRecord>>(
    `/admin/notifications?${queryParams}`,
  )
}

/**
 * Verify a club
 */
export async function verifyClub(clubId: string): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/clubs/${clubId}/verify`, {})
}

/**
 * Delete a user
 */
export async function deleteUser(userId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/admin/users/${userId}`)
}

/**
 * Update ride status (cancel, etc.)
 */
export async function updateRideStatus(rideId: string, status: string): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/rides/${rideId}/status`, { status })
}

/**
 * Delete a ride
 */
export async function deleteRide(rideId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/admin/rides/${rideId}`)
}

/**
 * Delete a club
 */
export async function deleteClub(clubId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/admin/clubs/${clubId}`)
}

/**
 * Update listing status (approve, flag, remove)
 */
export async function updateListingStatus(
  listingId: string,
  status: string,
): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/marketplace/${listingId}/status`, {
    status,
  })
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/admin/marketplace/${listingId}`)
}

// ============ Settings ============

export async function getSettings(): Promise<AdminSettings> {
  return apiAuthenticated.get<AdminSettings>('/admin/settings')
}

export async function updateSettings(data: AdminSettingsUpdate): Promise<AdminSettings> {
  return apiAuthenticated.patch<AdminSettings>('/admin/settings', data)
}

// ============ Approvals ============

export interface PendingClub {
  id: string
  name: string
  description: string | null
  location: string | null
  clubType: string | null
  owner: { id: string; name: string | null; image: string | null }
  memberCount: number
  createdAt: string
}

export interface PendingClubRequest {
  id: string
  clubId: string
  clubName: string
  userId: string
  userName: string | null
  userEmail: string | null
  userAvatar: string | null
  message: string | null
  createdAt: string
}

export interface PendingRideRequest {
  id: string
  rideId: string
  rideTitle: string
  userId: string
  userName: string | null
  userEmail: string | null
  userAvatar: string | null
  createdAt: string
}

export interface AdminApprovalsData {
  pendingClubs: PendingClub[]
  pendingClubRequests: PendingClubRequest[]
  pendingRideRequests: PendingRideRequest[]
}

export interface PendingBusiness {
  id: string
  displayName: string
  categories: string[]
  slug: string
  logoUrl: string | null
  city: string | null
  region: string | null
  country: string | null
  verificationNotes: string | null
  createdAt: string
  owner: { id: string; name: string | null; email: string | null }
}

export interface PendingBusinessesData {
  items: PendingBusiness[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function getApprovals(): Promise<AdminApprovalsData> {
  return apiAuthenticated.get<AdminApprovalsData>('/admin/approvals')
}

export async function getBusinessSubmissions(): Promise<PendingBusinessesData> {
  return apiAuthenticated.get<PendingBusinessesData>('/admin/businesses?status=SUBMITTED&limit=50')
}

export async function getAllBusinesses(params: {
  page?: number; limit?: number; status?: string; search?: string
} = {}): Promise<PendingBusinessesData> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') q.append(k, String(v)) })
  return apiAuthenticated.get<PendingBusinessesData>(`/admin/businesses?${q}`)
}

export async function deleteBusiness(id: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/admin/businesses/${id}`)
}

export async function approveBusinessSubmission(businessId: string): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/businesses/${businessId}`, {
    verification: 'APPROVED',
  })
}

export async function rejectBusinessSubmission(
  businessId: string,
  notes?: string,
): Promise<void> {
  return apiAuthenticated.patch<void>(`/admin/businesses/${businessId}`, {
    verification: 'REJECTED',
    verificationNotes: notes ?? null,
  })
}

export async function approveClubRequest(requestId: string): Promise<void> {
  return apiAuthenticated.post<void>(`/admin/club-join-requests/${requestId}/approve`, {})
}

export async function rejectClubRequest(requestId: string): Promise<void> {
  return apiAuthenticated.post<void>(`/admin/club-join-requests/${requestId}/reject`, {})
}

export async function acceptRideParticipant(participantId: string): Promise<void> {
  return apiAuthenticated.post<void>(
    `/admin/ride-participants/${participantId}/accept`,
    {},
  )
}

export async function declineRideParticipant(participantId: string): Promise<void> {
  return apiAuthenticated.post<void>(
    `/admin/ride-participants/${participantId}/decline`,
    {},
  )
}

// ============ Ad Campaign Moderation ============

export type AdCampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'REJECTED'

export interface AdminAdCampaign {
  id: string
  businessId: string
  title: string
  ctaLabel: string
  ctaUrl: string | null
  imageUrl: string
  startsAt: string
  endsAt: string
  budgetPaise: number
  status: AdCampaignStatus
  impressionCount: number
  clickCount: number
  reviewNotes: string | null
  createdAt: string
  business: { id: string; displayName: string; slug: string; logoUrl: string | null }
}

export interface AdminDiscount {
  id: string
  businessId: string
  code: string | null
  title: string
  description: string | null
  imageUrl: string | null
  percentOff: number | null
  amountOffPaise: number | null
  validFrom: string
  validUntil: string
  isFeatured: boolean
  createdAt: string
  business: { id: string; displayName: string; slug: string; logoUrl: string | null }
}

export async function getAdCampaigns(
  params: { status?: AdCampaignStatus; page?: number; limit?: number } = {},
): Promise<PaginatedData<AdminAdCampaign>> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.append(k, String(v))
  })
  return apiAuthenticated.get<PaginatedData<AdminAdCampaign>>(`/admin/ad-campaigns?${q}`)
}

export async function approveAdCampaign(id: string, notes?: string): Promise<void> {
  return apiAuthenticated.post<void>(`/admin/ad-campaigns/${id}/approve`, { notes })
}

export async function rejectAdCampaign(id: string, notes?: string): Promise<void> {
  return apiAuthenticated.post<void>(`/admin/ad-campaigns/${id}/reject`, { notes })
}

export async function getAdminDiscounts(
  params: { page?: number; limit?: number } = {},
): Promise<PaginatedData<AdminDiscount>> {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) q.append(k, String(v))
  })
  return apiAuthenticated.get<PaginatedData<AdminDiscount>>(`/admin/discounts?${q}`)
}

export async function deleteAdminDiscount(id: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/admin/discounts/${id}`)
}

export async function bulkVerifyClubs(ids: string[]): Promise<{ updated: number }> {
  return apiAuthenticated.post<{ updated: number }>('/admin/bulk/clubs/verify', { ids })
}

export async function bulkApproveClubRequests(ids: string[]): Promise<{ updated: number }> {
  return apiAuthenticated.post<{ updated: number }>('/admin/bulk/club-join-requests/approve', { ids })
}

export async function bulkAcceptRideParticipants(ids: string[]): Promise<{ updated: number }> {
  return apiAuthenticated.post<{ updated: number }>('/admin/bulk/ride-participants/accept', { ids })
}

export async function bulkApproveBusinesses(ids: string[]): Promise<{ updated: number }> {
  return apiAuthenticated.post<{ updated: number }>('/admin/bulk/businesses/approve', { ids })
}

export async function bulkApproveAdCampaigns(ids: string[]): Promise<{ updated: number }> {
  return apiAuthenticated.post<{ updated: number }>('/admin/bulk/ad-campaigns/approve', { ids })
}

export interface BulkActionRequest {
  module: 'clubs' | 'club-join-requests' | 'ride-participants' | 'businesses' | 'ad-campaigns' | 'club-member-requests' | 'brand-campaigns' | 'brand-products';
  action: 'approve' | 'reject' | 'verify' | 'accept' | 'decline' | 'delete' | 'feature' | 'unfeature' | 'hide' | 'show';
  ids: string[];
  data?: Record<string, any>;
}

export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: Array<{ id: string; error: string }>;
}

export async function performBulkAction(request: BulkActionRequest): Promise<BulkActionResult> {
  return apiAuthenticated.post<BulkActionResult>('/admin/bulk/action', request);
}

export async function performClubManagerBulkAction(request: BulkActionRequest): Promise<BulkActionResult> {
  // API_URL already ends in /api → path is relative to it. Backend mounts the
  // club-manager scope at /api/bulk/club-manager/action.
  return apiAuthenticated.post<BulkActionResult>('/bulk/club-manager/action', request);
}

export async function performBrandManagerBulkAction(request: BulkActionRequest): Promise<BulkActionResult> {
  return apiAuthenticated.post<BulkActionResult>('/bulk/brand-manager/action', request);
}

// Export all as adminApi object
export const adminApi = {
  getStats,
  getWeeklyActivity,
  getUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  createUser,
  updateUser,
  getRides,
  getClubs,
  getListings,
  getReports,
  updateReport,
  getNotifications,
  verifyClub,
  deleteUser,
  updateRideStatus,
  deleteRide,
  deleteClub,
  updateListingStatus,
  deleteListing,
  getApprovals,
  getBusinessSubmissions,
  approveBusinessSubmission,
  rejectBusinessSubmission,
  approveClubRequest,
  rejectClubRequest,
  acceptRideParticipant,
  declineRideParticipant,
  getAdCampaigns,
  approveAdCampaign,
  rejectAdCampaign,
  getAdminDiscounts,
  deleteAdminDiscount,
  getSettings,
  updateSettings,
  getAllBusinesses,
  deleteBusiness,
  bulkVerifyClubs,
  bulkApproveClubRequests,
  bulkAcceptRideParticipants,
  bulkApproveBusinesses,
  bulkApproveAdCampaigns,
  performBulkAction,
  performClubManagerBulkAction,
  performBrandManagerBulkAction,
}
