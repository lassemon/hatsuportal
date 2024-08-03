import { describe, expect, it } from 'vitest'
import { parseThemeCache } from './parseThemeCache'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'

describe('parseDisplayThemeCache', () => {
  it('returns null for invalid JSON', () => {
    expect(parseThemeCache('not-json')).toBeNull()
  })

  it('returns null when color keys are missing', () => {
    expect(parseThemeCache(JSON.stringify({ lightColors: {}, darkColors: {} }))).toBeNull()
  })

  it('returns null when hex colors are invalid', () => {
    expect(
      parseThemeCache(
        JSON.stringify({
          lightColors: { ...DEFAULT_THEME_COLORS.lightColors, primary: 'red' },
          darkColors: DEFAULT_THEME_COLORS.darkColors
        })
      )
    ).toBeNull()
  })

  it('parses valid display theme cache', () => {
    const fullTheme = {
      id: '123',
      name: 'Test Theme',
      createdById: '456',
      ...DEFAULT_THEME_COLORS,
      createdAt: 1715328000,
      updatedAt: 1715328000
    }
    expect(parseThemeCache(JSON.stringify(fullTheme))).toStrictEqual(fullTheme)
  })
})
