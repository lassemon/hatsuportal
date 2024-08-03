import { describe, expect, it } from 'vitest'
import { Password } from './Password'
import { InvalidPasswordError } from '../errors/InvalidPasswordError'

describe('Password', () => {
  it('can create a password', () => {
    const password = Password.create('TestPassword123')
    expect(password).to.be.instanceOf(Password)
    expect(password.value).to.eq('TestPassword123')
  })

  it('does not allow creating a password with an empty value', () => {
    expect(() => {
      Password.create('')
    }).toThrow(InvalidPasswordError)
    expect(() => {
      Password.create(undefined as any)
    }).toThrow(InvalidPasswordError)
    expect(() => {
      Password.create(null as any)
    }).toThrow(InvalidPasswordError)
  })
})
