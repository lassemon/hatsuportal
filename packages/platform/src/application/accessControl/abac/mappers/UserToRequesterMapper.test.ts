import { describe, expect, it } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserToRequesterMapper } from './UserToRequesterMapper'

describe('UserToRequesterMapper', () => {
  const mapper = new UserToRequesterMapper()

  it('returns null for null input', () => {
    expect(mapper.fromSession(null)).toBeNull()
  })

  it('returns null when user id is null', () => {
    expect(
      mapper.fromSession({
        id: null,
        roles: [UserRoleEnum.Viewer],
        active: true,
        name: 'Anonymous'
      })
    ).toBeNull()
  })

  it('maps a valid session user to a requester', () => {
    expect(
      mapper.fromSession({
        id: 'user-1',
        roles: [UserRoleEnum.Admin],
        active: true,
        name: 'Alice'
      })
    ).toEqual({
      userId: 'user-1',
      roles: [UserRoleEnum.Admin],
      attributes: { active: true },
      name: 'Alice'
    })
  })
})
