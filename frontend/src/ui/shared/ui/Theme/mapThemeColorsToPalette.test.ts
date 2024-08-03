import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME_COLORS } from '@hatsuportal/contracts'
import { mapThemeColorsToPalette } from './mapThemeColorsToPalette'

describe('mapThemeColorsToPalette', () => {
  it('maps backend theme colors to MUI palette fields', () => {
    const colors = DEFAULT_THEME_COLORS.lightColors
    const palette = mapThemeColorsToPalette('light', colors)

    expect(palette?.primary).toMatchObject({ main: colors.primary })
    expect(palette?.background).toMatchObject({
      paper: colors.backgroundPrimary,
      default: colors.backgroundSecondary
    })
    expect(palette?.action).toMatchObject({ active: colors.callToAction })
    expect(palette?.mode).toBe('light')
  })
})
