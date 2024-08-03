import { describe, expect, it } from 'vitest'
import { UserName } from './UserName'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'

describe('UserName', () => {
  it('can create a user name', () => {
    const fileName = new UserName('image/png')
    expect(fileName).to.be.instanceOf(UserName)
    expect(fileName.value).to.eq('image/png')
  })

  it('does not allow creating a user name with an empty value', () => {
    expect(() => {
      new UserName('' as any)
    }).toThrow(InvalidUserNameError)
    expect(() => {
      new UserName(undefined as any)
    }).toThrow(InvalidUserNameError)
    expect(() => {
      new UserName(null as any)
    }).toThrow(InvalidUserNameError)
  })

  it('does not allow creating a user name with an invalid value', () => {
    const invalidUserNames = ['   ', 1, 0, -1] as any[]

    invalidUserNames.forEach((userName) => {
      expect(() => {
        new UserName(userName)
      }).toThrow(InvalidUserNameError)
    })
  })
})
