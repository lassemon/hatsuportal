import { describe, expect, it } from 'vitest'
import { AbacEngine, UserToRequesterMapper } from '@hatsuportal/platform'
import { UserRoleEnum, uuid } from '@hatsuportal/common'
import { ThemeAuthorizationService } from './ThemeAuthorizationService'
import { ThemeAction, ThemeAuthorizationPayloadMap, themeRequestBuilderMap, themeRuleMap } from '../rules/theme.rules'
import * as Fixture from '../../../__test__/testFactory'
import { sampleUserId } from '../../../__test__/testFactory'

const createAuthorizationService = () =>
  new ThemeAuthorizationService(
    new UserToRequesterMapper(),
    new AbacEngine<ThemeAction, ThemeAuthorizationPayloadMap>(themeRuleMap, themeRequestBuilderMap)
  )

describe('ThemeAuthorizationService', () => {
  const service = createAuthorizationService()
  const theme = Fixture.themeDTOMock()

  it('allows active authenticated user to list themes', () => {
    const decision = service.canListThemes(Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer] }))
    expect(decision.allowed).toBe(true)
  })

  it('denies inactive user from listing themes', () => {
    const decision = service.canListThemes(Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer], active: false }))
    expect(decision.allowed).toBe(false)
  })

  it('does not allow admin to update, and delete other users themes', () => {
    const admin = Fixture.userReadModelDTOMock({ id: uuid(), roles: [UserRoleEnum.Admin] })
    expect(service.canUpdateTheme(admin, theme).allowed).toBe(false)
    expect(service.canDeleteTheme(admin, theme).allowed).toBe(false)
  })

  it('allows super admin to update, and delete other users themes', () => {
    const superAdmin = Fixture.userReadModelDTOMock({ id: uuid(), roles: [UserRoleEnum.SuperAdmin] })
    expect(service.canUpdateTheme(superAdmin, theme).allowed).toBe(true)
    expect(service.canDeleteTheme(superAdmin, theme).allowed).toBe(true)
  })

  it('denies viewer from mutating themes', () => {
    const viewer = Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer] })
    expect(service.canCreateTheme(viewer).allowed).toBe(false)
    expect(service.canUpdateTheme(viewer, theme).allowed).toBe(false)
    expect(service.canDeleteTheme(viewer, theme).allowed).toBe(false)
  })

  it('allows theme owner to delete their own theme', () => {
    const owner = Fixture.userReadModelDTOMock({ id: sampleUserId, roles: [UserRoleEnum.Editor] })
    expect(service.canDeleteTheme(owner, theme).allowed).toBe(true)
  })
})
