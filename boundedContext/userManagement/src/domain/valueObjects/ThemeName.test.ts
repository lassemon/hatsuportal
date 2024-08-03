import { describe, expect, it } from 'vitest'
import { InvalidThemeNameError } from '../errors/InvalidThemeNameError'
import { ThemeName } from './ThemeName'

describe('ThemeName', () => {
  it('can create a theme name', () => {
    const themeName = new ThemeName('Custom Theme')
    expect(themeName).to.be.instanceOf(ThemeName)
    expect(themeName.value).to.eq('Custom Theme')
  })

  it('trims whitespace from theme name', () => {
    const themeName = new ThemeName('  Custom Theme  ')
    expect(themeName.value).to.eq('Custom Theme')
  })

  it('does not allow creating a theme name with an empty value', () => {
    expect(() => {
      new ThemeName('')
    }).toThrow(InvalidThemeNameError)
    expect(() => {
      new ThemeName('   ')
    }).toThrow(InvalidThemeNameError)
    expect(() => {
      new ThemeName(undefined as any)
    }).toThrow(InvalidThemeNameError)
    expect(() => {
      new ThemeName(null as any)
    }).toThrow(InvalidThemeNameError)
    expect(() => {
      new ThemeName(123 as any)
    }).toThrow(InvalidThemeNameError)
  })

  it('exposes equals and toString helpers', () => {
    const themeName = new ThemeName('Default')
    expect(themeName.equals(new ThemeName('Default'))).toBe(true)
    expect(themeName.equals(new ThemeName('Custom'))).toBe(false)
    expect(themeName.toString()).toBe('Default')
  })
})
