import { describe, expect, it } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserCommandMapper } from './UserCommandMapper'

describe('UserCommandMapper', () => {
  const mapper = new UserCommandMapper()

  it('maps create command to input and result', () => {
    const input = mapper.toCreateUserInput({
      createdById: 'creator-id',
      name: 'alice',
      email: 'alice@example.com',
      password: 'Password123!',
      roles: [UserRoleEnum.Viewer]
    })

    expect(input).toStrictEqual({
      name: 'alice',
      email: 'alice@example.com',
      password: 'Password123!',
      roles: [UserRoleEnum.Viewer]
    })
    expect(mapper.toCreateUserResult({ userId: 'user-1' })).toStrictEqual({ userId: 'user-1' })
  })

  it('maps update command to input and result', () => {
    const input = mapper.toUpdateUserInput({
      updatedById: 'updater-id',
      id: 'user-1',
      name: 'alice',
      email: 'alice@example.com',
      roles: [UserRoleEnum.Editor],
      active: true,
      oldPassword: 'old',
      newPassword: 'new'
    })

    expect(input).toStrictEqual({
      id: 'user-1',
      name: 'alice',
      email: 'alice@example.com',
      roles: [UserRoleEnum.Editor],
      active: true,
      oldPassword: 'old',
      newPassword: 'new'
    })
    expect(mapper.toUpdateUserResult({ userId: 'user-1' })).toStrictEqual({ userId: 'user-1' })
  })

  it('maps deactivate command to input and result', () => {
    expect(
      mapper.toDeactivateUserInput({
        requestedById: 'admin-id',
        id: 'user-1'
      })
    ).toStrictEqual({ userIdToDeactivate: 'user-1' })
    expect(mapper.toDeactivateUserResult({ userId: 'user-1' })).toStrictEqual({ userId: 'user-1' })
  })

  it('maps update command with undefined roles to empty roles array', () => {
    const input = mapper.toUpdateUserInput({
      updatedById: 'updater-id',
      id: 'user-1',
      name: 'alice',
      email: 'alice@example.com',
      active: true
    })

    expect(input.roles).toStrictEqual([])
  })

  it('throws on invalid role enum in create command', () => {
    expect(() =>
      mapper.toCreateUserInput({
        createdById: 'creator-id',
        name: 'alice',
        email: 'alice@example.com',
        password: 'Password123!',
        roles: ['not-a-role']
      })
    ).toThrow()
  })
})
