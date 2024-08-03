import { describe, expect, it } from 'vitest'
import { CssColor } from './CssColor'
import { InvalidCssColorError } from '../errors/InvalidCssColorError'

describe('CssColor', () => {
  it('can create a hex color', () => {
    const color = new CssColor('#F1F3F5')
    expect(color).to.be.instanceOf(CssColor)
    expect(color.value).to.eq('#F1F3F5')
  })

  it('can create rgb, rgba, hsl, and hsla colors', () => {
    expect(new CssColor('rgb(255, 0, 0)').value).to.eq('rgb(255, 0, 0)')
    expect(new CssColor('rgba(255, 0, 0, 0.5)').value).to.eq('rgba(255, 0, 0, 0.5)')
    expect(new CssColor('hsl(120, 100%, 50%)').value).to.eq('hsl(120, 100%, 50%)')
    expect(new CssColor('hsla(120, 100%, 50%, 0.8)').value).to.eq('hsla(120, 100%, 50%, 0.8)')
  })

  it('does not allow creating a color with an empty or non-string value', () => {
    expect(() => new CssColor('')).toThrow(InvalidCssColorError)
    expect(() => new CssColor(undefined as unknown as string)).toThrow(InvalidCssColorError)
    expect(() => new CssColor(null as unknown as string)).toThrow(InvalidCssColorError)
  })

  it('rejects unsupported prefixes and invalid colors', () => {
    const invalidColors = [
      'var(--primary)',
      'linear-gradient(red, blue)',
      '#fff; background: url(javascript:alert(1))',
      'not-a-color',
      'abc',
      '#gggggg',
      'rgb(not-a-number)',
      'hsv(120, 100%, 50%)'
    ]

    invalidColors.forEach((color) => {
      expect(() => new CssColor(color)).toThrow(InvalidCssColorError)
    })
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    expect(CssColor.canCreate('#F1F3F5')).toBe(true)
    expect(() => CssColor.assertCanCreate('#F1F3F5')).not.toThrow()
    expect(CssColor.canCreate('red')).toBe(true)
  })

  it('exposes equals and toString helpers', () => {
    const color = new CssColor('#F1F3F5')
    const same = new CssColor('#F1F3F5')
    const different = new CssColor('#000000')

    expect(color.equals(same)).toBe(true)
    expect(color.equals(different)).toBe(false)
    expect(color.toString()).to.eq('#F1F3F5')
  })

  it('can create named CSS color aliases', () => {
    expect(new CssColor('red').value).to.eq('red')
    expect(new CssColor('yellow').value).to.eq('yellow')
    expect(new CssColor('WhiteSmoke').value).to.eq('WhiteSmoke') // casing preserved
  })
})
