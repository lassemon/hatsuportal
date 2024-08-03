import { afterEach, describe, it, vi } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { AuthorizationError, AuthenticationError, InvalidInputError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { UpdateUserValidationScenario } from '../../../../__test__/support/user/UpdateUserValidationScenario'

describe('UpdateUserUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (loggedId: string, targetId: string) => ({
    loggedInUserId: loggedId,
    updateData: {
      id: targetId,
      name: 'Valid Name',
      email: 'valid@example.com',
      roles: [UserRoleEnum.Viewer],
      active: true,
      oldPassword: 'OldPassword123',
      newPassword: 'NewPassword123'
    }
  })

  it('should execute inner use case when all validations pass', async ({ unitFixture }) => {
    const scenario = await UpdateUserValidationScenario.given()
      .withAdminAndExistingUser()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw AuthenticationError when logged in user not found', async ({ unitFixture }) => {
    const scenario = await UpdateUserValidationScenario.given()
      .withoutLoggedInUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw NotFoundError when target user not found', async ({ unitFixture }) => {
    const scenario = await UpdateUserValidationScenario.given()
      .withoutTargetUser()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, 'nonexistent-user-id-4792-a2f0-f95ccab82d92'))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw AuthorizationError when authorization service denies', async ({ unitFixture }) => {
    const scenario = await UpdateUserValidationScenario.given()
      .withAdminAndExistingUser()
      .authorizationWillFail('denied')
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError for invalid role', async ({ unitFixture }) => {
    const scenario = await UpdateUserValidationScenario.given()
      .withAdminAndExistingUser()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateData: {
          id: unitFixture.userDTOMock().id,
          name: 'Valid',
          email: 'valid@example.com',
          roles: ['invalid_role' as unknown as UserRoleEnum],
          active: true,
          oldPassword: 'OldPassword123',
          newPassword: 'NewPassword123'
        }
      })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
