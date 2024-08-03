import { atom, createStore } from 'jotai/vanilla'
import type { FeedMode } from './discoverFeedCatchUpReducer'
import { SavedPlace as SavedPlaceModel, type SavedPlaceData } from './SavedPlace'

export type DiscoverFeedStore = ReturnType<typeof createStore>

export type { SavedPlaceData }
export { SavedPlaceModel as SavedPlace }

export const savedPlaceAtom = atom<SavedPlaceData | null>(null)

export type WhenTheFeedOpens = {
  viewer: string
  savedPlace: SavedPlaceData | null
  feedMode: FeedMode
}

export class DiscoverFeedSession {
  constructor(private readonly store: DiscoverFeedStore) {}

  readSavedPlaceIfStillValid(viewer: string): SavedPlaceData | null {
    const savedPlace = this.store.get(savedPlaceAtom)
    if (!savedPlace || !SavedPlaceModel.fromPlain(savedPlace).stillApplies(viewer)) {
      return null
    }
    return savedPlace
  }

  readWhenTheFeedOpens(viewer: string): WhenTheFeedOpens {
    const savedPlace = this.readSavedPlaceIfStillValid(viewer)

    if (savedPlace) {
      return {
        viewer,
        savedPlace,
        feedMode: {
          kind: 'puttingYouBack',
          postTheyWereWatching: savedPlace.postTheyWereWatching,
          searchFinished: false
        }
      }
    }

    return {
      viewer,
      savedPlace: null,
      feedMode: { kind: 'scrolling' }
    }
  }

  rememberSavedPlace(place: SavedPlaceData): void {
    this.store.set(savedPlaceAtom, place)
  }

  forgetSavedPlace(): void {
    this.store.set(savedPlaceAtom, null)
  }
}
