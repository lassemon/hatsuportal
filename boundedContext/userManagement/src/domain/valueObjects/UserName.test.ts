import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { UserName } from './UserName'
import { UserNameEmptyError } from '../errors/UserNameEmptyError'
import { UserNameTooLongError } from '../errors/UserNameTooLongError'

describe('UserName', () => {
  it('can create a user name', () => {
    const userName = new UserName('Alice')
    expect(userName).to.be.instanceOf(UserName)
    expect(userName.value).to.eq('Alice')
  })

  it('does not allow creating a user name with an empty value', () => {
    expect(() => {
      new UserName('' as any)
    }).toThrow(UserNameEmptyError)
    expect(() => {
      new UserName(undefined as any)
    }).toThrow(UserNameEmptyError)
    expect(() => {
      new UserName(null as any)
    }).toThrow(UserNameEmptyError)
  })

  it('does not allow creating a user name with an invalid value', () => {
    const invalidUserNames = ['   ', 1, 0, -1] as any[]

    invalidUserNames.forEach((userName) => {
      expect(() => {
        new UserName(userName)
      }).toThrow(UserNameEmptyError)
    })
  })

  it('exposes canCreate and assertCanCreate helpers', () => {
    expect(UserName.canCreate('alice')).toBe(true)
    expect(() => UserName.assertCanCreate('alice')).not.toThrow()
    expect(UserName.canCreate('')).toBe(false)
  })

  it('trims whitespace before validation', () => {
    const userName = new UserName('  Alice  ')
    expect(userName.value).toBe('Alice')
  })

  it('rejects over-limit user name after trim', () => {
    expect(() => new UserName(`  ${'x'.repeat(InputLimits.userName + 1)}  `)).toThrow(UserNameTooLongError)
  })

  it('accepts user name at max length after trim', () => {
    const userName = new UserName(`  ${'x'.repeat(InputLimits.userName)}  `)
    expect(userName.value).toBe('x'.repeat(InputLimits.userName))
  })
})
