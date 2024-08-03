import { describe, expect, it } from 'vitest'
import { ThemeColors } from './ThemeColors'

describe('ThemeColors', () => {
  const themeColorsProps = {
    primary: '#F1F3F5',
    backgroundPrimary: '#21252A',
    backgroundSecondary: '#131D29',
    callToAction: '#BFFA00'
  }

  it('can create theme colors', () => {
    const themeColors = new ThemeColors(themeColorsProps)
    expect(themeColors.primary).to.eq(themeColorsProps.primary)
    expect(themeColors.backgroundPrimary).to.eq(themeColorsProps.backgroundPrimary)
    expect(themeColors.backgroundSecondary).to.eq(themeColorsProps.backgroundSecondary)
    expect(themeColors.callToAction).to.eq(themeColorsProps.callToAction)
  })

  it('reconstruct creates theme colors', () => {
    const themeColors = ThemeColors.reconstruct(themeColorsProps)
    expect(themeColors).to.be.instanceOf(ThemeColors)
    expect(themeColors.serialize()).toStrictEqual(themeColorsProps)
  })

  it('exposes equals and serialize helpers', () => {
    const themeColors = new ThemeColors(themeColorsProps)
    const same = ThemeColors.reconstruct(themeColorsProps)
    const different = ThemeColors.reconstruct({
      ...themeColorsProps,
      primary: '#000000'
    })

    expect(themeColors.equals(same)).toBe(true)
    expect(themeColors.equals(different)).toBe(false)
    expect(themeColors.serialize()).toStrictEqual(themeColorsProps)
  })
})
