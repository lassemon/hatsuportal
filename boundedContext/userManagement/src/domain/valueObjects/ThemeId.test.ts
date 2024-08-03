import { describe, expect, it } from 'vitest'
import { uuid } from '@hatsuportal/common'
import { InvalidThemeIdError } from '../errors/InvalidThemeIdError'
import { ThemeId } from './ThemeId'

describe('ThemeId', () => {
  it('can create a theme id', () => {
    const id = uuid()
    const themeId = new ThemeId(id)
    expect(themeId).to.be.instanceOf(ThemeId)
    expect(themeId.value).to.eq(id)
  })

  it('does not allow creating a theme id with an empty value', () => {
    expect(() => {
      new ThemeId('')
    }).toThrow(InvalidThemeIdError)
    expect(() => {
      new ThemeId(undefined as any)
    }).toThrow(InvalidThemeIdError)
    expect(() => {
      new ThemeId(null as any)
    }).toThrow(InvalidThemeIdError)
  })

  it('does not allow creating a theme id with an invalid value', () => {
    const invalidIds = [
      '    ',
      '1',
      '1234',
      '1234567',
      '1234567891',
      '1234567891234',
      '1234567891234567',
      '1234567891234567891',
      '1234567891234567891234',
      '1234567891234567891234567',
      '1234567891234567891234567891',
      '1234567891234567891234567891234',
      1,
      0,
      -1
    ] as any[]

    invalidIds.forEach((id) => {
      expect(() => {
        new ThemeId(id)
      }).toThrow(InvalidThemeIdError)
    })
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    const id = uuid()
    expect(ThemeId.canCreate(id)).toBe(true)
    expect(() => ThemeId.assertCanCreate(id)).not.toThrow()
    expect(ThemeId.canCreate('')).toBe(false)
    expect(() => ThemeId.assertCanCreate('')).toThrow(InvalidThemeIdError)
  })
})
