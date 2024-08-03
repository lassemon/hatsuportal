import { describe, expect, it } from 'vitest'
import { ColorScheme, ColorSchemeEnum } from './ColorScheme'

describe('ColorScheme', () => {
  it('can create a color scheme', () => {
    const colorScheme = new ColorScheme(ColorSchemeEnum.Dark)
    expect(colorScheme).to.be.instanceOf(ColorScheme)
    expect(colorScheme.value).to.eq(ColorSchemeEnum.Dark)
  })

  it('default returns light color scheme', () => {
    const colorScheme = ColorScheme.default()
    expect(colorScheme.value).to.eq(ColorSchemeEnum.Light)
  })

  it('does not allow creating a color scheme with an invalid value', () => {
    expect(() => {
      new ColorScheme('invalid' as ColorSchemeEnum)
    }).toThrow('Invalid color scheme: invalid')
  })

  it('exposes equals and toString helpers', () => {
    const colorScheme = new ColorScheme(ColorSchemeEnum.Light)
    expect(colorScheme.equals(new ColorScheme(ColorSchemeEnum.Light))).toBe(true)
    expect(colorScheme.equals(new ColorScheme(ColorSchemeEnum.Dark))).toBe(false)
    expect(colorScheme.toString()).toBe(ColorSchemeEnum.Light)
  })
})
