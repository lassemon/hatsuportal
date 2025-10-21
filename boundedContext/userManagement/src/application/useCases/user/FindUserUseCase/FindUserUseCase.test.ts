import { afterEach, describe, expect, it, vi } from 'vitest'
import { FindUserScenario } from '../../../../__test__/support/user/FindUserScenario'
import { AuthorizationError, NotFoundError } from '@hatsuportal/foundation'
import { IFindUserUseCaseOptions } from './FindUserUseCase'

describe('FindUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (loggedId: string, targetId: string): IFindUserUseCaseOptions => ({
    loggedInUserId: loggedId,
    findUserInput: {
      userIdToFind: targetId
    },
    userFound: () => {}
  })

  it('should find a user successfully', async ({ unitFixture }) => {
    const scenario = await FindUserScenario.given()
      .withAdminAndTargetUser()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryCalled('userFound', expect.any(Object))
  })

  it('should throw AuthorizationError when logged in user lacks admin role', async ({ unitFixture }) => {
    const scenario = await FindUserScenario.given()
      .withNonAdminUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userFound')
  })

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const scenario = await FindUserScenario.given()
      .withoutTargetUser()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, 'nonexistent-user-id-4792-a2f0-f95ccab82d92'))

    scenario.thenOutputBoundaryNotCalled('userFound')
  })
})
