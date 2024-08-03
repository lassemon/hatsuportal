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

  it('does not allow creating a password with a numeric value', () => {
    expect(() => {
      Password.create(123 as any)
    }).toThrow(InvalidPasswordError)
  })

  it('creates equal passwords for the same value', () => {
    const password1 = Password.create('TestPassword123')
    const password2 = Password.create('TestPassword123')
    
    expect(password1.equals(password2)).to.be.true
  })

  it('creates unequal passwords for different values', () => {
    const password1 = Password.create('TestPassword123')
    const password2 = Password.create('DifferentPassword456')
    
    expect(password1.equals(password2)).to.be.false
  })

  it('toString returns the password value', () => {
    const password = Password.create('TestPassword123')
    expect(password.toString()).to.eq('TestPassword123')
  })

  it('canCreate returns true for valid password', () => {
    expect(Password.canCreate('TestPassword123')).to.be.true
  })

  it('canCreate returns false for invalid password', () => {
    expect(Password.canCreate('')).to.be.false
    expect(Password.canCreate(null as any)).to.be.false
  })
})
