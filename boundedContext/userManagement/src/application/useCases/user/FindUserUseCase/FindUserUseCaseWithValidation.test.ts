import { afterEach, describe, it, vi } from 'vitest'
import { FindUserValidationScenario } from '../../../../__test__/support/user/FindUserValidationScenario'
import { AuthenticationError, AuthorizationError, NotFoundError, UserRoleEnum } from '@hatsuportal/foundation'
import { UserId, UserRole } from '../../../../domain'
import { IFindUserUseCaseOptions } from './FindUserUseCase'

describe('FindUserUseCaseWithValidation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const input = (loggedId: string, targetId: string): IFindUserUseCaseOptions => ({
    loggedInUserId: loggedId,
    findUserInput: { userIdToFind: targetId },
    userFound: vi.fn()
  })

  it('should execute inner use case when validations pass (admin)', async ({ unitFixture }) => {
    const scenario = await FindUserValidationScenario.given()
      .withAdminUser()
      .whenExecutedWithInput(input(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should allow self-view without admin role', async ({ unitFixture }) => {
    const scenario = await FindUserValidationScenario.given()
      .withUserRoles(new UserRole(UserRoleEnum.Viewer))
      .withActualAuthorizationService()
      .whenExecutedWithInput(input(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when non-admin tries to view another user', async ({ unitFixture }) => {
    const differentUserId = new UserId('different-user-id-4792-a2f0-f95ccab82d92')
    const scenario = await FindUserValidationScenario.given()
      .withAdminAndTargetUser(
        unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] }),
        unitFixture.userMock({ id: differentUserId })
      )
      .withActualAuthorizationService()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(input(unitFixture.userDTOMock().id, differentUserId.value))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when logged in user not found', async ({ unitFixture }) => {
    const scenario = await FindUserValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(input(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when target user not found', async ({ unitFixture }) => {
    // configure repo: first call returns admin, second returns null handled within validation scenario by overriding method
    const scenario = await FindUserValidationScenario.given()
      .withAdminUser()
      .withoutTargetUser()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(input(unitFixture.userDTOMock().id, 'nonexistent-user-id-4792-a2f0-f95ccab82d92'))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await FindUserValidationScenario.given()
      .withAdminUser()
      .authorizationWillFail('not allowed')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(input(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
