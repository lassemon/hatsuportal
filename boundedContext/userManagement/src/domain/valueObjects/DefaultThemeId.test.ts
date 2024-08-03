import { describe, expect, it } from 'vitest'
import { DefaultThemeId } from './DefaultThemeId'
import { ThemeId } from './ThemeId'

describe('DefaultThemeId', () => {
  it('extends ThemeId and exposes the well-known default UUID', () => {
    const defaultThemeId = new DefaultThemeId()

    expect(defaultThemeId).toBeInstanceOf(ThemeId)
    expect(defaultThemeId.value).toBe('00000000-0000-0000-0000-000000000001')
  })

  it('canCreate validates like ThemeId', () => {
    expect(DefaultThemeId.canCreate(new DefaultThemeId().value)).toBe(true)
    expect(DefaultThemeId.canCreate('')).toBe(false)
  })
})
