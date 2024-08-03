import { describe, expect, it } from 'vitest'
import { AbacEngine, UserToRequesterMapper } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { ThemeAuthorizationService } from './ThemeAuthorizationService'
import { ThemeAction, ThemeAuthorizationPayloadMap, themeRequestBuilderMap, themeRuleMap } from '../rules/theme.rules'
import * as Fixture from '../../../__test__/testFactory'

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
    const decision = service.canListThemes(
      Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer], active: false })
    )
    expect(decision.allowed).toBe(false)
  })

  it('allows admin to create, update, and delete themes', () => {
    const admin = Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Admin] })
    expect(service.canCreateTheme(admin).allowed).toBe(true)
    expect(service.canUpdateTheme(admin, theme).allowed).toBe(true)
    expect(service.canDeleteTheme(admin, theme).allowed).toBe(true)
  })

  it('denies non-admin from mutating themes', () => {
    const viewer = Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer] })
    expect(service.canCreateTheme(viewer).allowed).toBe(false)
    expect(service.canUpdateTheme(viewer, theme).allowed).toBe(false)
    expect(service.canDeleteTheme(viewer, theme).allowed).toBe(false)
  })
})
