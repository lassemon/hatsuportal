import { DiscoverRules } from './DiscoverRules'

export type SavedPlaceData = {
  postTheyWereWatching: string
  placeInTheList: number
  pagesScrolled: number
  totalPostsWhenTheyLeft: number
  discoverRules: string
  viewer: string
}

const MAX_EXTRA_PAGES = 5

export class SavedPlace {
  private constructor(private readonly data: SavedPlaceData) {}

  static fromPlain(data: SavedPlaceData): SavedPlace {
    return new SavedPlace(data)
  }

  get postTheyWereWatching(): string {
    return this.data.postTheyWereWatching
  }

  get pagesScrolled(): number {
    return this.data.pagesScrolled
  }

  toPlain(): SavedPlaceData {
    return this.data
  }

  stillApplies(viewer: string): boolean {
    return (
      this.data.viewer === viewer &&
      DiscoverRules.fromPersisted(this.data.discoverRules).matchesCurrentDiscoverFeed()
    )
  }

  /** Whether we stored feed size when they left (enables widen-after-first-fetch). */
  hasFeedSizeForWiden(): boolean {
    return this.data.totalPostsWhenTheyLeft > 0
  }

  pagesToLoadFirst(): number {
    return this.data.pagesScrolled + 1
  }

  pagesToLoadIfFeedGrew(totalCountNow: number): number {
    const initial = this.pagesToLoadFirst()
    if (!this.hasFeedSizeForWiden()) {
      return initial
    }
    const growth = Math.max(0, totalCountNow - this.data.totalPostsWhenTheyLeft)
    const extra = Math.min(MAX_EXTRA_PAGES, Math.ceil(growth / DiscoverRules.postsPerPage))
    return initial + extra
  }
}
