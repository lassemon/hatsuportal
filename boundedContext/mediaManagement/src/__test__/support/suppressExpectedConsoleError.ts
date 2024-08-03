import { afterEach, beforeEach, vi } from 'vitest'

/** Suppresses logger.error console output for tests that intentionally exercise failure paths. */
export const suppressExpectedConsoleError = (): void => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })
}
