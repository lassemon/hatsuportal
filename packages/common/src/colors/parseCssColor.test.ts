import { describe, expect, it } from 'vitest'
import { CSS_COLOR_MAX_LENGTH, isValidCssColor, parseCssColor } from './parseCssColor'

describe('parseCssColor', () => {
  it('accepts functional colors and preserves the input format', () => {
    expect(parseCssColor('#F1F3F5')).toEqual({ ok: true, value: '#F1F3F5' })
    expect(parseCssColor('rgb(255, 0, 0)')).toEqual({ ok: true, value: 'rgb(255, 0, 0)' })
    expect(parseCssColor('rgba(255, 0, 0, 0.5)')).toEqual({ ok: true, value: 'rgba(255, 0, 0, 0.5)' })
    expect(parseCssColor('hsl(120, 100%, 50%)')).toEqual({ ok: true, value: 'hsl(120, 100%, 50%)' })
    expect(parseCssColor('hsla(120, 100%, 50%, 0.8)')).toEqual({ ok: true, value: 'hsla(120, 100%, 50%, 0.8)' })
  })

  it('accepts named CSS color aliases without normalizing to hex', () => {
    expect(parseCssColor('red')).toEqual({ ok: true, value: 'red' })
    expect(parseCssColor('whitesmoke')).toEqual({ ok: true, value: 'whitesmoke' })
    expect(parseCssColor('WhiteSmoke')).toEqual({ ok: true, value: 'WhiteSmoke' })
  })

  it('trims surrounding whitespace', () => {
    expect(parseCssColor('  red  ')).toEqual({ ok: true, value: 'red' })
    expect(parseCssColor('  #F1F3F5  ')).toEqual({ ok: true, value: '#F1F3F5' })
  })

  it('rejects empty input', () => {
    expect(parseCssColor('')).toEqual({ ok: false, message: 'Color must not be empty.' })
    expect(parseCssColor('   ')).toEqual({ ok: false, message: 'Color must not be empty.' })
  })

  it('rejects values that exceed the maximum length', () => {
    const tooLong = `#${'a'.repeat(CSS_COLOR_MAX_LENGTH)}`

    expect(parseCssColor(tooLong)).toEqual({
      ok: false,
      message: `Color exceeds maximum length of ${CSS_COLOR_MAX_LENGTH}.`
    })
  })

  it('rejects forbidden characters and disallowed constructs', () => {
    expect(parseCssColor('#fff; background: url(javascript:alert(1))')).toEqual({
      ok: false,
      message: "'#fff; background: url(javascript:alert(1))' contains invalid characters."
    })
    expect(parseCssColor('var(--primary)')).toEqual({
      ok: false,
      message: "'var(--primary)' is not an allowed color format."
    })
    expect(parseCssColor('linear-gradient(red, blue)')).toEqual({
      ok: false,
      message: "'linear-gradient(red, blue)' is not an allowed color format."
    })
    expect(parseCssColor('calc(100% - 10px)')).toEqual({
      ok: false,
      message: "'calc(100% - 10px)' is not an allowed color format."
    })
  })

  it('rejects invalid functional colors', () => {
    expect(parseCssColor('#gggggg')).toEqual({ ok: false, message: "'#gggggg' is not a valid color." })
    expect(parseCssColor('rgb(not-a-number)')).toEqual({ ok: false, message: "'rgb(not-a-number)' is not a valid color." })
  })

  it('rejects unsupported formats and letter tokens that are not named colors', () => {
    expect(parseCssColor('hsv(120, 100%, 50%)')).toEqual({
      ok: false,
      message: "'hsv(120, 100%, 50%)' must be a hex/rgb/hsl color or a named CSS color (e.g. red, whitesmoke)."
    })
    expect(parseCssColor('not-a-color')).toEqual({
      ok: false,
      message: "'not-a-color' must be a hex/rgb/hsl color or a named CSS color (e.g. red, whitesmoke)."
    })
    expect(parseCssColor('abc')).toEqual({
      ok: false,
      message: "'abc' is not a valid color name."
    })
  })

  it('exposes isValidCssColor as a convenience helper', () => {
    expect(isValidCssColor('#F1F3F5')).toBe(true)
    expect(isValidCssColor('red')).toBe(true)
    expect(isValidCssColor('not-a-color')).toBe(false)
  })
})
