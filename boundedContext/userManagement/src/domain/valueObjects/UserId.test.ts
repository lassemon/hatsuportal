import { describe, expect, it } from 'vitest'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { UserId } from './UserId'
import { uuid } from '@hatsuportal/common'

describe('UserId', () => {
  it('can create a post id', () => {
    const id = uuid()
    const userId = new UserId(id)
    expect(userId).to.be.instanceOf(UserId)
    expect(userId.value).to.eq(id)
  })

  it('does not allow creating a user id with an empty value', () => {
    expect(() => {
      new UserId('')
    }).toThrow(InvalidUserIdError)
    expect(() => {
      new UserId(undefined as any)
    }).toThrow(InvalidUserIdError)
    expect(() => {
      new UserId(null as any)
    }).toThrow(InvalidUserIdError)
  })

  it('does not allow creating a user id with an invalid value', () => {
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
        new UserId(id)
      }).toThrow(InvalidUserIdError)
    })
  })
})
