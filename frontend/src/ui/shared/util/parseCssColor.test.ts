import { describe, expect, it } from 'vitest'
import { getCssColorError, isValidCssColor, parseCssColor } from './parseCssColor'

describe('parseCssColor (frontend wrapper)', () => {
  it('returns the parsed color string when valid', () => {
    expect(parseCssColor('red')).toBe('red')
    expect(parseCssColor('#F1F3F5')).toBe('#F1F3F5')
  })

  it('returns null when invalid', () => {
    expect(parseCssColor('not-a-color')).toBeNull()
    expect(parseCssColor('var(--primary)')).toBeNull()
  })

  it('delegates isValidCssColor to common', () => {
    expect(isValidCssColor('whitesmoke')).toBe(true)
    expect(isValidCssColor('abc')).toBe(false)
  })

  it('returns null from getCssColorError for empty draft input', () => {
    expect(getCssColorError('')).toBeNull()
    expect(getCssColorError('   ')).toBeNull()
  })

  it('returns an error message from getCssColorError for invalid non-empty input', () => {
    expect(getCssColorError('not-a-color')).toBe(
      "'not-a-color' must be a hex/rgb/hsl color or a named CSS color (e.g. red, whitesmoke)."
    )
    expect(getCssColorError('red')).toBeNull()
  })
})
