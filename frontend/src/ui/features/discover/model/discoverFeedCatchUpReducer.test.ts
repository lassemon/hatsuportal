import { describe, expect, it } from 'vitest'
import {
  type CatchUpEvent,
  type CatchUpFollowThroughStep,
  type FeedMode,
  decideCatchUp,
  stillPuttingThemBack
} from './discoverFeedCatchUpReducer'

const POST_A = 'post-a'
const POST_B = 'post-b'

const S: FeedMode = { kind: 'scrolling' }
const P0: FeedMode = {
  kind: 'puttingYouBack',
  postTheyWereWatching: POST_A,
  searchFinished: false
}
const P1: FeedMode = {
  kind: 'puttingYouBack',
  postTheyWereWatching: POST_A,
  searchFinished: true
}

type Row = {
  label: string
  prev: FeedMode
  event: CatchUpEvent
  expectedKind: FeedMode['kind']
  searchFinished?: boolean
  followThrough: CatchUpFollowThroughStep[]
  expectSameRef: boolean
  overlayMustDismiss: boolean
}

const rows: Row[] = [
  {
    label: 'S puttingYouBack A',
    prev: S,
    event: { type: 'puttingYouBack', postTheyWereWatching: POST_A },
    expectedKind: 'puttingYouBack',
    searchFinished: false,
    followThrough: [],
    expectSameRef: false,
    overlayMustDismiss: false
  },
  {
    label: 'S foundTheirPost invalid',
    prev: S,
    event: { type: 'foundTheirPost', postTheyWereWatching: POST_A },
    expectedKind: 'scrolling',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'S theirPostIsUnreachable invalid',
    prev: S,
    event: { type: 'theirPostIsUnreachable', postTheyWereWatching: POST_A },
    expectedKind: 'scrolling',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'S catchUpRequestFailed invalid',
    prev: S,
    event: { type: 'catchUpRequestFailed' },
    expectedKind: 'scrolling',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'S landedOnTheirPost invalid',
    prev: S,
    event: { type: 'landedOnTheirPost' },
    expectedKind: 'scrolling',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'S couldNotPlaceThem invalid',
    prev: S,
    event: { type: 'couldNotPlaceThem' },
    expectedKind: 'scrolling',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'P0 puttingYouBack A idempotent',
    prev: P0,
    event: { type: 'puttingYouBack', postTheyWereWatching: POST_A },
    expectedKind: 'puttingYouBack',
    searchFinished: false,
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'P0 puttingYouBack B',
    prev: P0,
    event: { type: 'puttingYouBack', postTheyWereWatching: POST_B },
    expectedKind: 'puttingYouBack',
    searchFinished: false,
    followThrough: [],
    expectSameRef: false,
    overlayMustDismiss: false
  },
  {
    label: 'P0 foundTheirPost A',
    prev: P0,
    event: { type: 'foundTheirPost', postTheyWereWatching: POST_A },
    expectedKind: 'puttingYouBack',
    searchFinished: true,
    followThrough: [],
    expectSameRef: false,
    overlayMustDismiss: false
  },
  {
    label: 'P0 foundTheirPost B invalid',
    prev: P0,
    event: { type: 'foundTheirPost', postTheyWereWatching: POST_B },
    expectedKind: 'puttingYouBack',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'P0 theirPostIsUnreachable',
    prev: P0,
    event: { type: 'theirPostIsUnreachable', postTheyWereWatching: POST_A },
    expectedKind: 'scrolling',
    followThrough: ['forgetSavedPlace', 'startAtTop', 'ignoreThisCatchUpIfItFinishesLate'],
    expectSameRef: false,
    overlayMustDismiss: true
  },
  {
    label: 'P0 catchUpRequestFailed',
    prev: P0,
    event: { type: 'catchUpRequestFailed' },
    expectedKind: 'scrolling',
    followThrough: ['ignoreThisCatchUpIfItFinishesLate'],
    expectSameRef: false,
    overlayMustDismiss: true
  },
  {
    label: 'P0 landedOnTheirPost invalid',
    prev: P0,
    event: { type: 'landedOnTheirPost' },
    expectedKind: 'puttingYouBack',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'P0 couldNotPlaceThem invalid',
    prev: P0,
    event: { type: 'couldNotPlaceThem' },
    expectedKind: 'puttingYouBack',
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'P1 puttingYouBack A idempotent',
    prev: P1,
    event: { type: 'puttingYouBack', postTheyWereWatching: POST_A },
    expectedKind: 'puttingYouBack',
    searchFinished: true,
    followThrough: [],
    expectSameRef: true,
    overlayMustDismiss: false
  },
  {
    label: 'P1 foundTheirPost A',
    prev: P1,
    event: { type: 'foundTheirPost', postTheyWereWatching: POST_A },
    expectedKind: 'puttingYouBack',
    searchFinished: true,
    followThrough: [],
    expectSameRef: false,
    overlayMustDismiss: false
  },
  {
    label: 'P1 theirPostIsUnreachable',
    prev: P1,
    event: { type: 'theirPostIsUnreachable', postTheyWereWatching: POST_A },
    expectedKind: 'scrolling',
    followThrough: ['forgetSavedPlace', 'startAtTop', 'ignoreThisCatchUpIfItFinishesLate'],
    expectSameRef: false,
    overlayMustDismiss: true
  },
  {
    label: 'P1 catchUpRequestFailed',
    prev: P1,
    event: { type: 'catchUpRequestFailed' },
    expectedKind: 'scrolling',
    followThrough: ['ignoreThisCatchUpIfItFinishesLate'],
    expectSameRef: false,
    overlayMustDismiss: true
  },
  {
    label: 'P1 landedOnTheirPost',
    prev: P1,
    event: { type: 'landedOnTheirPost' },
    expectedKind: 'scrolling',
    followThrough: [],
    expectSameRef: false,
    overlayMustDismiss: true
  },
  {
    label: 'P1 couldNotPlaceThem',
    prev: P1,
    event: { type: 'couldNotPlaceThem' },
    expectedKind: 'scrolling',
    followThrough: ['forgetSavedPlace', 'startAtTop', 'ignoreThisCatchUpIfItFinishesLate'],
    expectSameRef: false,
    overlayMustDismiss: true
  }
]

describe('decideCatchUp transition table', () => {
  it.each(rows)('$label', (row) => {
    const prevMode = row.prev
    const decision = decideCatchUp(prevMode, row.event)

    expect(decision.mode.kind).toBe(row.expectedKind)

    if (row.expectSameRef) {
      expect(decision.mode).toBe(prevMode)
    }

    if (row.searchFinished !== undefined && decision.mode.kind === 'puttingYouBack') {
      expect(decision.mode.searchFinished).toBe(row.searchFinished)
    }

    expect(decision.followThrough).toEqual(row.followThrough)

    if (row.overlayMustDismiss) {
      expect(stillPuttingThemBack(decision.mode)).toBe(false)
    }
  })
})
