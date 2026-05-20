import { apiAuthenticated } from '../base'
import type {
  Listing,
  ListingDetails,
  ListingCategory,
  ListingCondition,
} from '@/store/slices/marketplaceSlice'

// Re-export types from slice
export type { Listing, ListingDetails, ListingCategory, ListingCondition }

export interface CreateListingData {
  title: string
  description: string
  price: number
  currency?: string
  category: ListingCategory
  condition: ListingCondition
  images?: string[]
  location: string
  isNegotiable?: boolean
}

export interface ListingFilters {
  page?: number
  category?: ListingCategory
  condition?: ListingCondition
  minPrice?: number
  maxPrice?: number
  location?: string
  search?: string
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PaginatedResult<T> {
  items: T[]
  pagination: PaginationMeta
}

// ============ Marketplace API ============

/**
 * Get listings with optional filters
 */
export async function getListings(
  filters: ListingFilters = {},
): Promise<{ listings: Listing[]; hasMore: boolean }> {
  const queryParams = new URLSearchParams()
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })
  const response = await apiAuthenticated.get<PaginatedResult<Listing>>(
    `/marketplace?${queryParams}`,
  )

  return {
    listings: response.items || [],
    hasMore: response.pagination
      ? response.pagination.page < response.pagination.totalPages
      : false,
  }
}

/**
 * Get user's own listings
 */
export async function getMyListings(): Promise<{ listings: Listing[] }> {
  const response = await apiAuthenticated.get<PaginatedResult<Listing>>(
    '/marketplace/my-listings',
  )

  return {
    listings: response.items || [],
  }
}

/**
 * Get user's saved listings
 */
export async function getSavedListings(): Promise<{ listings: Listing[] }> {
  return { listings: [] }
}

/**
 * Get listing details by ID
 */
export async function getListing(
  listingId: string,
): Promise<{ listing: ListingDetails }> {
  return apiAuthenticated.get<{ listing: ListingDetails }>(`/marketplace/${listingId}`)
}

/**
 * Create a new listing
 */
export async function createListing(
  data: CreateListingData,
): Promise<{ listing: Listing }> {
  return apiAuthenticated.post<{ listing: Listing }>('/marketplace', data)
}

/**
 * Update a listing
 */
export async function updateListing(
  listingId: string,
  data: Partial<CreateListingData>,
): Promise<{ listing: Listing }> {
  return apiAuthenticated.patch<{ listing: Listing }>(`/marketplace/${listingId}`, data)
}

/**
 * Delete a listing
 */
export async function deleteListing(listingId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/marketplace/${listingId}`)
}

/**
 * Save a listing
 */
export async function saveListing(listingId: string): Promise<void> {
  return apiAuthenticated.post<void>(`/marketplace/${listingId}/save`)
}

/**
 * Unsave a listing
 */
export async function unsaveListing(listingId: string): Promise<void> {
  return apiAuthenticated.delete<void>(`/marketplace/${listingId}/save`)
}

/**
 * Mark listing as sold
 */
export async function markAsSold(listingId: string): Promise<{ listing: Listing }> {
  return apiAuthenticated.patch<{ listing: Listing }>(`/marketplace/${listingId}`, {
    status: 'SOLD',
  })
}

/**
 * Register the current user as interested in a listing. The seller sees this
 * in their listing's interest list. Idempotent server-side (upsert).
 */
export async function expressInterest(listingId: string): Promise<void> {
  return apiAuthenticated.post<void>(`/marketplace/${listingId}/interests`)
}

// Export all as marketplaceApi object
export const marketplaceApi = {
  getListings,
  getMyListings,
  getSavedListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  saveListing,
  unsaveListing,
  markAsSold,
  expressInterest,
}
