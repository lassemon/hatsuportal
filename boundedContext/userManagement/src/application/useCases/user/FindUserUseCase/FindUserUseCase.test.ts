import { afterEach, describe, expect, it, vi } from 'vitest'
import { FindUserScenario } from '../../../../__test__/support/user/FindUserScenario'
import { NotFoundError } from '@hatsuportal/platform'
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
      .withUsers([unitFixture.userMock()])
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryCalled('userFound', expect.any(Object))
  })

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const missingUserId = 'nonexistent-user-id-4792-a2f0-f95ccab82d92'
    const scenario = await FindUserScenario.given()
      .withoutTargetUser(missingUserId)
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, missingUserId))

    scenario.thenOutputBoundaryNotCalled('userFound')
  })

  it('should find inactive user when row exists', async ({ unitFixture }) => {
    const inactiveUser = unitFixture.userMock({ active: false })
    const scenario = await FindUserScenario.given()
      .withTargetUser(inactiveUser)
      .whenExecutedWithInput(baseInput(inactiveUser.id.value, inactiveUser.id.value))

    scenario.thenOutputBoundaryCalled('userFound', expect.objectContaining({ active: false }))
  })
})
