import { describe, expect, it } from 'vitest'
import { AbacEngine, IUserForAuthorization, UserToRequesterMapper } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserAuthorizationService } from './UserAuthorizationService'
import { UserAction, UserAuthorizationPayloadMap, userRequestBuilderMap, userRuleMap } from '../rules/user.rules'
import * as Fixture from '../../../__test__/testFactory'

const createAuthorizationService = () =>
  new UserAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<UserAction, UserAuthorizationPayloadMap>(userRuleMap, userRequestBuilderMap)
  )

const activeAdmin = (): IUserForAuthorization => ({
  id: Fixture.sampleUserId,
  name: Fixture.sampleUserName,
  roles: [UserRoleEnum.Admin],
  active: true
})

const inactiveSelf = (): IUserForAuthorization => ({
  id: Fixture.sampleUserId,
  name: Fixture.sampleUserName,
  roles: [UserRoleEnum.Viewer],
  active: false
})

const inactiveOther = (): IUserForAuthorization => ({
  id: 'other-user-id-0000-0000-0000-000000000001',
  name: 'otheruser',
  roles: [UserRoleEnum.Viewer],
  active: false
})

describe('UserAuthorizationService', () => {
  const service = createAuthorizationService()
  const targetUser = Fixture.userDTOMock()

  it('denies inactive authenticated user on Create', () => {
    const decision = service.canCreateUser(inactiveSelf(), [UserRoleEnum.Viewer])
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBeTruthy()
  })

  it('denies inactive authenticated user on Update', () => {
    const decision = service.canUpdateUser(inactiveSelf(), targetUser)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBeTruthy()
  })

  it('denies inactive authenticated user on Deactivate', () => {
    const decision = service.canDeactivateUser(inactiveSelf())
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBeTruthy()
  })

  it('denies inactive authenticated user on ListAll', () => {
    const decision = service.canListAllUsers(inactiveSelf())
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBeTruthy()
  })

  it('allows inactive self to View their own user', () => {
    const decision = service.canViewUser(inactiveSelf(), targetUser)
    expect(decision.allowed).toBe(true)
  })

  it('denies inactive non-self non-admin View', () => {
    const decision = service.canViewUser(inactiveOther(), targetUser)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toMatch(/not active/i)
  })

  it('allows active self to Update via real ABAC', () => {
    const self: IUserForAuthorization = {
      id: Fixture.sampleUserId,
      name: Fixture.sampleUserName,
      roles: [UserRoleEnum.Viewer],
      active: true
    }
    const decision = service.canUpdateUser(self, targetUser)
    expect(decision.allowed).toBe(true)
  })

  it('allows active admin on ListAll', () => {
    expect(service.canListAllUsers(activeAdmin()).allowed).toBe(true)
  })
})
