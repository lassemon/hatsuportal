import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { FindUserScenario } from '../../../../__test__/support/user/FindUserScenario'

describe('FindUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should find a user successfully', async ({ unitFixture }) => {
    const scenario = await FindUserScenario.given().withAdminAndTargetUser().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      userIdToFind: unitFixture.userDTOMock().id
    })

    scenario.thenOutputBoundaryCalled('userFound', expect.any(Object))
  })

  it('should throw AuthorizationError when logged in user lacks admin role', async ({ unitFixture }) => {
    const scenario = await FindUserScenario.given().withNonAdminUser().expectErrorOfType(AuthorizationError).whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      userIdToFind: unitFixture.userDTOMock().id
    })

    scenario.thenOutputBoundaryNotCalled('userFound')
  })

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const scenario = await FindUserScenario.given().withoutTargetUser().expectErrorOfType(NotFoundError).whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      userIdToFind: 'nonexistent-user-id-4792-a2f0-f95ccab82d92'
    })

    scenario.thenOutputBoundaryNotCalled('userFound')
  })
})
