import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthorizationError, ConcurrencyError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { UpdateUserScenario } from '../../../../__test__/support/user/UpdateUserScenario'
import { UserRoleEnum } from '@hatsuportal/common'

describe('UpdateUserUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (loggedId: string, targetId: string) => ({
    loggedInUserId: loggedId,
    updateData: {
      id: targetId,
      name: 'New Name',
      email: 'new@example.com',
      roles: [UserRoleEnum.Viewer],
      active: true,
      oldPassword: 'OldPassword123',
      newPassword: 'NewPassword123'
    }
  })

  it('should update user successfully for admin', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withAdminAndExistingUser()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryCalled('userUpdated', expect.any(Object))
  })

  it('should return updateConflict callback on concurrency error', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withAdminAndExistingUser()
      .repositoryWillReject('update', new ConcurrencyError('conflict', unitFixture.userMock()))
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryCalled('updateConflict', expect.any(ConcurrencyError)).thenOutputBoundaryNotCalled('userUpdated')
  })

  it('should throw AuthorizationError for non-admin user', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withNonAdminUser()
      .expectErrorOfType(AuthorizationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userUpdated')
  })

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withAdminAndExistingUser()
      .withoutTargetUser()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, 'nonexistent-id-4792-a2f0-f95ccab82d92'))

    scenario.thenOutputBoundaryNotCalled('userUpdated')
  })
})
