import { describe, expect, it } from 'vitest'
import { CssColor } from './CssColor'
import { ThemeColors } from './ThemeColors'

describe('ThemeColors', () => {
  const themeColorsSerialized = {
    primary: '#F1F3F5',
    backgroundPrimary: '#21252A',
    backgroundSecondary: '#131D29',
    callToAction: '#BFFA00'
  }

  const themeColorsProps = {
    primary: new CssColor(themeColorsSerialized.primary),
    backgroundPrimary: new CssColor(themeColorsSerialized.backgroundPrimary),
    backgroundSecondary: new CssColor(themeColorsSerialized.backgroundSecondary),
    callToAction: new CssColor(themeColorsSerialized.callToAction)
  }

  it('can create theme colors', () => {
    const themeColors = new ThemeColors(themeColorsProps)
    expect(themeColors.primary.value).to.eq(themeColorsSerialized.primary)
    expect(themeColors.backgroundPrimary.value).to.eq(themeColorsSerialized.backgroundPrimary)
    expect(themeColors.backgroundSecondary.value).to.eq(themeColorsSerialized.backgroundSecondary)
    expect(themeColors.callToAction.value).to.eq(themeColorsSerialized.callToAction)
  })

  it('reconstruct creates theme colors', () => {
    const themeColors = ThemeColors.reconstruct(themeColorsSerialized)
    expect(themeColors).to.be.instanceOf(ThemeColors)
    expect(themeColors.serialize()).toStrictEqual(themeColorsSerialized)
  })

  it('exposes equals and serialize helpers', () => {
    const themeColors = new ThemeColors(themeColorsProps)
    const same = ThemeColors.reconstruct(themeColorsSerialized)
    const different = ThemeColors.reconstruct({
      ...themeColorsSerialized,
      primary: '#000000'
    })

    expect(themeColors.equals(same)).toBe(true)
    expect(themeColors.equals(different)).toBe(false)
    expect(themeColors.serialize()).toStrictEqual(themeColorsSerialized)
  })
})
