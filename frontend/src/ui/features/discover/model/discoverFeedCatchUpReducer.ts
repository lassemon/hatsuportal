export type FeedMode =
  | { kind: 'scrolling' }
  | {
      kind: 'puttingYouBack'
      postTheyWereWatching: string
      searchFinished: boolean
    }

export type CatchUpEvent =
  | { type: 'puttingYouBack'; postTheyWereWatching: string }
  | { type: 'foundTheirPost'; postTheyWereWatching: string }
  | { type: 'theirPostIsUnreachable'; postTheyWereWatching: string }
  | { type: 'catchUpRequestFailed' }
  | { type: 'landedOnTheirPost' }
  | { type: 'couldNotPlaceThem' }

export type CatchUpFollowThroughStep =
  | 'forgetSavedPlace'
  | 'startAtTop'
  | 'ignoreThisCatchUpIfItFinishesLate'

export type CatchUpDecision = {
  mode: FeedMode
  followThrough: CatchUpFollowThroughStep[]
}

/**
 * Catch-up invariant:
 * Any failure or success exit that dismisses catchUpLoading must return
 * mode: { kind: 'scrolling' } in the same CatchUpDecision as followThrough
 * (hook applies both in one decideCatchUpFromHook turn). foundTheirPost is the exception —
 * it stays puttingYouBack with searchFinished: true. If failure events only ran followThrough
 * but left puttingYouBack, screen.mode === 'puttingYouBack' would keep the loading surface up
 * after startAtTop.
 *
 * Full (prevMode, CatchUpEvent) matrix: discoverFeedCatchUpReducer.test.ts (plan § transition table).
 */
export function decideCatchUp(mode: FeedMode, event: CatchUpEvent): CatchUpDecision {
  const noop = (): CatchUpDecision => ({ mode, followThrough: [] })

  switch (event.type) {
    case 'puttingYouBack': {
      if (mode.kind === 'scrolling') {
        return {
          mode: {
            kind: 'puttingYouBack',
            postTheyWereWatching: event.postTheyWereWatching,
            searchFinished: false
          },
          followThrough: []
        }
      }
      if (mode.kind === 'puttingYouBack') {
        if (mode.postTheyWereWatching === event.postTheyWereWatching) {
          return noop()
        }
        return {
          mode: {
            kind: 'puttingYouBack',
            postTheyWereWatching: event.postTheyWereWatching,
            searchFinished: false
          },
          followThrough: []
        }
      }
      return noop()
    }
    case 'foundTheirPost': {
      if (mode.kind !== 'puttingYouBack') {
        return noop()
      }
      if (mode.postTheyWereWatching !== event.postTheyWereWatching) {
        return noop()
      }
      return {
        mode: {
          kind: 'puttingYouBack',
          postTheyWereWatching: event.postTheyWereWatching,
          searchFinished: true
        },
        followThrough: []
      }
    }
    case 'theirPostIsUnreachable': {
      if (mode.kind !== 'puttingYouBack') {
        return noop()
      }
      if (mode.postTheyWereWatching !== event.postTheyWereWatching) {
        return noop()
      }
      return {
        mode: { kind: 'scrolling' },
        followThrough: ['forgetSavedPlace', 'startAtTop', 'ignoreThisCatchUpIfItFinishesLate']
      }
    }
    case 'catchUpRequestFailed': {
      if (mode.kind !== 'puttingYouBack') {
        return noop()
      }
      return {
        mode: { kind: 'scrolling' },
        followThrough: ['ignoreThisCatchUpIfItFinishesLate']
      }
    }
    case 'landedOnTheirPost': {
      if (mode.kind !== 'puttingYouBack' || !mode.searchFinished) {
        return noop()
      }
      return { mode: { kind: 'scrolling' }, followThrough: [] }
    }
    case 'couldNotPlaceThem': {
      if (mode.kind !== 'puttingYouBack' || !mode.searchFinished) {
        return noop()
      }
      return {
        mode: { kind: 'scrolling' },
        followThrough: ['forgetSavedPlace', 'startAtTop', 'ignoreThisCatchUpIfItFinishesLate']
      }
    }
  }
}

export function stillPuttingThemBack(mode: FeedMode): boolean {
  return mode.kind === 'puttingYouBack'
}
