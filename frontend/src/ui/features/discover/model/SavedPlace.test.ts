import { describe, expect, it } from 'vitest'
import { SavedPlace, type SavedPlaceData } from './SavedPlace'

const basePlace: SavedPlaceData = {
  postTheyWereWatching: 'post-1',
  placeInTheList: 25,
  pagesScrolled: 2,
  totalPostsWhenTheyLeft: 10,
  discoverRules: 'x',
  viewer: 'user-1'
}

describe('SavedPlace', () => {
  it('pagesToLoadFirst uses pagesScrolled + 1', () => {
    expect(SavedPlace.fromPlain(basePlace).pagesToLoadFirst()).toBe(3)
  })

  it('pagesToLoadIfFeedGrew returns initial only without feed size snapshot', () => {
    const place = SavedPlace.fromPlain({ ...basePlace, totalPostsWhenTheyLeft: 0 })
    expect(place.pagesToLoadIfFeedGrew(100)).toBe(3)
  })

  it('pagesToLoadIfFeedGrew caps extra pages', () => {
    const place = SavedPlace.fromPlain(basePlace)
    expect(place.pagesToLoadIfFeedGrew(1000)).toBe(8)
  })

  it('pagesToLoadIfFeedGrew adds modest extra when feed grew', () => {
    const place = SavedPlace.fromPlain(basePlace)
    expect(place.pagesToLoadIfFeedGrew(30)).toBe(5)
  })
})
