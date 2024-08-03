import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { Bio } from './Bio'
import { BioTooLongError } from '../errors/BioTooLongError'
import { InvalidBioError } from '../errors/InvalidBioError'

describe('Bio', () => {
  it('can create a bio', () => {
    const bio = new Bio('Hello world')
    expect(bio).to.be.instanceOf(Bio)
    expect(bio.value).to.eq('Hello world')
  })

  it('empty returns an empty bio', () => {
    const bio = Bio.empty()
    expect(bio.value).to.eq('')
  })

  it('exposes equals and toString helpers', () => {
    const bio = new Bio('Hello world')
    expect(bio.equals(new Bio('Hello world'))).toBe(true)
    expect(bio.equals(new Bio('Other'))).toBe(false)
    expect(bio.toString()).toBe('Hello world')
  })

  it('trims whitespace before validation', () => {
    const bio = new Bio('  Hello world  ')
    expect(bio.value).toBe('Hello world')
  })

  it('rejects non-string input', () => {
    expect(() => new Bio(undefined as any)).toThrow(InvalidBioError)
    expect(() => new Bio(null as any)).toThrow(InvalidBioError)
    expect(() => new Bio(123 as any)).toThrow(InvalidBioError)
  })

  it('rejects over-limit bio after trim', () => {
    expect(() => new Bio(`  ${'x'.repeat(InputLimits.bio + 1)}  `)).toThrow(BioTooLongError)
  })
})
