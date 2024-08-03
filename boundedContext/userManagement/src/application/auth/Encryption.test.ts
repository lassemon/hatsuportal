import { describe, expect, it } from 'vitest'
import { Encryption } from './Encryption'

describe('Encryption', () => {
  it('can encrypt password', async () => {
    expect(await Encryption.encrypt('foobar')).not.toBe('foobar')
  })

  it('can compare password', async () => {
    const encrypted = await Encryption.encrypt('foobar')
    expect(encrypted).not.toBe('foobar')
    expect(await Encryption.compare('foobar', encrypted)).toBe(true)
  })
})
