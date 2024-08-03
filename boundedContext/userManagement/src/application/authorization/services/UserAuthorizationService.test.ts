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

const requester = (overrides: Partial<IUserForAuthorization> & Pick<IUserForAuthorization, 'roles'>): IUserForAuthorization => ({
  id: Fixture.sampleUserId,
  name: Fixture.sampleUserName,
  active: true,
  ...overrides
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
  const otherUser = { ...targetUser, id: 'other-user-id-0000-0000-0000-000000000002', name: 'other-user' }

  it.each([
    ['Create', () => service.canCreateUser(inactiveSelf(), [UserRoleEnum.Viewer])],
    ['Update', () => service.canUpdateUser(inactiveSelf(), targetUser)],
    ['UpdateProfile', () => service.canUpdateProfile(inactiveSelf(), targetUser)],
    ['UpdatePreferences', () => service.canUpdatePreferences(inactiveSelf(), targetUser)],
    ['Deactivate', () => service.canDeactivateUser(inactiveSelf())],
    ['ListAll', () => service.canListAllUsers(inactiveSelf())]
  ] as const)('denies inactive authenticated user on %s', (_action, decide) => {
    const decision = decide()
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toBeTruthy()
  })

  it('allows inactive self to View their own user', () => {
    const decision = service.canViewUser(inactiveSelf(), targetUser)
    expect(decision.allowed).toBe(true)
  })

  it('allows inactive self to ViewProfile and ViewPreferences', () => {
    expect(service.canViewProfile(inactiveSelf(), targetUser).allowed).toBe(true)
    expect(service.canViewPreferences(inactiveSelf(), targetUser).allowed).toBe(true)
  })

  it('denies inactive non-self ViewProfile and ViewPreferences', () => {
    expect(service.canViewProfile(inactiveOther(), targetUser).allowed).toBe(false)
    expect(service.canViewPreferences(inactiveOther(), targetUser).allowed).toBe(false)
  })

  it('denies active non-self ViewProfile and ViewPreferences', () => {
    const activeViewer = requester({ roles: [UserRoleEnum.Viewer] })
    expect(service.canViewProfile(activeViewer, otherUser).allowed).toBe(false)
    expect(service.canViewPreferences(activeViewer, otherUser).allowed).toBe(false)
  })

  it('denies inactive non-self non-admin View', () => {
    const decision = service.canViewUser(inactiveOther(), targetUser)
    expect(decision.allowed).toBe(false)
    expect(decision.reason).toMatch(/not active/i)
  })

  it('allows active self to Update', () => {
    const self = requester({ roles: [UserRoleEnum.Viewer] })
    const decision = service.canUpdateUser(self, targetUser)
    expect(decision.allowed).toBe(true)
  })

  it('allows active admin on ListAll', () => {
    expect(service.canListAllUsers(requester({ roles: [UserRoleEnum.Admin] })).allowed).toBe(true)
  })

  describe('ABAC matrix', () => {
    const activeAdmin = requester({ roles: [UserRoleEnum.Admin] })
    const activeViewer = requester({ roles: [UserRoleEnum.Viewer] })
    const superAdmin = requester({ roles: [UserRoleEnum.SuperAdmin] })

    it('allows active admin to Create, Update other, Deactivate, View other, and ListAll', () => {
      expect(service.canCreateUser(activeAdmin, [UserRoleEnum.Viewer]).allowed).toBe(true)
      expect(service.canUpdateUser(activeAdmin, otherUser).allowed).toBe(true)
      expect(service.canDeactivateUser(activeAdmin).allowed).toBe(true)
      expect(service.canViewUser(activeAdmin, otherUser).allowed).toBe(true)
      expect(service.canListAllUsers(activeAdmin).allowed).toBe(true)
    })

    it('allows active viewer self-Update and self-View but denies other-View, ListAll, and Deactivate', () => {
      expect(service.canUpdateUser(activeViewer, targetUser).allowed).toBe(true)
      expect(service.canViewUser(activeViewer, targetUser).allowed).toBe(true)
      expect(service.canViewUser(activeViewer, otherUser).allowed).toBe(false)
      expect(service.canListAllUsers(activeViewer).allowed).toBe(false)
      expect(service.canDeactivateUser(activeViewer).allowed).toBe(false)
    })

    it('allows SuperAdmin to create Admin users', () => {
      expect(service.canCreateUser(superAdmin, [UserRoleEnum.Admin]).allowed).toBe(true)
    })

    it('denies non-SuperAdmin admin from creating Admin users', () => {
      expect(service.canCreateUser(activeAdmin, [UserRoleEnum.Admin]).allowed).toBe(false)
    })
  })
})
