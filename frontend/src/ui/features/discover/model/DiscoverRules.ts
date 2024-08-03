import { OrderEnum, SortableKeyEnum } from '@hatsuportal/common'
import { SearchPostsRequest } from '@hatsuportal/contracts'

/** Fields that define feed identity for resume (pageNumber is excluded). */
const identityFields = ['postsPerPage', 'orderBy', 'order', 'visibility', 'search'] as const satisfies ReadonlyArray<
  keyof SearchPostsRequest
>

const defaultDiscoverFeedFilters: SearchPostsRequest = {
  postsPerPage: 10,
  pageNumber: 0,
  orderBy: SortableKeyEnum.CREATED_AT,
  order: OrderEnum.Descending,
  visibility: [],
  search: ''
}

const serializePart = (value: unknown): string => {
  if (Array.isArray(value)) {
    return [...value].map(String).sort().join(',')
  }
  return String(value)
}

const fingerprintFromBaseRequest = (base: SearchPostsRequest): string =>
  identityFields.map((field) => `${field}=${serializePart(base[field])}`).join('|')

const baseDiscoverFeedRequest = (): SearchPostsRequest => ({
  ...defaultDiscoverFeedFilters,
  pageNumber: 0,
  visibility: []
})

/**
 * Identity of the discover Posts feed query (filters + sort + page size).
 * Used to invalidate SavedPlace when the feed definition changes.
 */
export class DiscoverRules {
  static readonly postsPerPage = defaultDiscoverFeedFilters.postsPerPage ?? 10

  private constructor(private readonly fingerprint: string) {}

  private static currentFingerprint(): string {
    return fingerprintFromBaseRequest(baseDiscoverFeedRequest())
  }

  /** What the discover feed uses right now (today: fixed defaults). */
  static forCurrentDiscoverFeed(): DiscoverRules {
    return new DiscoverRules(DiscoverRules.currentFingerprint())
  }

  /** Rehydrate from session storage (SavedPlace.discoverRules, etc.). */
  static fromPersisted(serialized: string): DiscoverRules {
    return new DiscoverRules(serialized)
  }

  /** Same query identity as the app’s current discover feed. */
  matchesCurrentDiscoverFeed(): boolean {
    return this.fingerprint === DiscoverRules.currentFingerprint()
  }

  /** Value stored on SavedPlace. */
  toPersisted(): string {
    return this.fingerprint
  }

  /** HTTP request for this query at a given page (load more / catch-up). */
  toSearchRequest(pageNumber: number, postsPerPage?: number): SearchPostsRequest {
    return {
      ...baseDiscoverFeedRequest(),
      pageNumber,
      ...(postsPerPage ? { postsPerPage } : {})
    }
  }
}
