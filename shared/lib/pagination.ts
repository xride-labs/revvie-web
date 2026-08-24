/**
 * Page/limit handling shared by every list route.
 *
 * Domain-agnostic, so it lives in shared/ rather than being redefined in each feature —
 * which is how the codebase ended up with `?page=${page}` string-concatenated in a dozen
 * places, each with slightly different clamping.
 */

export interface ListParams {
  page: number
  limit: number
  search?: string
  sort?: string
}

export const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

/** Parses Next's `searchParams` into clamped, always-valid list params. */
export function toListParams(
  searchParams: Record<string, string | string[] | undefined> = {},
): ListParams {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

  const page = Number.parseInt(first(searchParams.page) ?? '', 10)
  const limit = Number.parseInt(first(searchParams.limit) ?? '', 10)

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit:
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT,
    search: first(searchParams.search)?.trim() || undefined,
    sort: first(searchParams.sort) || undefined,
  }
}

/** Drops empty values so they never reach the URL as `?search=&sort=`. */
export function toQuery(params: Partial<ListParams>): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    out[key] = value as string | number
  }
  return out
}

export function totalPages(total: number, limit: number): number {
  if (limit <= 0) return 0
  return Math.ceil(total / limit)
}
