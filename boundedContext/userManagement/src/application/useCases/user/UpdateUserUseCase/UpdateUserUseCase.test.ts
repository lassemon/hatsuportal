import { afterEach, describe, expect, it, vi } from 'vitest'
import { UpdateUserScenario } from '../../../../__test__/support/user/UpdateUserScenario'
import { ConcurrencyError, NotFoundError } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { IUpdateUserUseCaseOptions } from './UpdateUserUseCase'
import { UpdateUserInputDTO } from '../../../dtos/UpdateUserInputDTO'

describe('UpdateUserUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (loggedId: string, targetId: string, overrides: Partial<UpdateUserInputDTO> = {}): IUpdateUserUseCaseOptions => ({
    updatedById: loggedId,
    updateUserInput: {
      id: targetId,
      name: 'New Name',
      email: 'new@example.com',
      roles: [UserRoleEnum.Viewer],
      active: true,
      oldPassword: 'OldPassword123',
      newPassword: 'NewPassword123',
      ...overrides
    },
    userUpdated: () => {},
    updateConflict: () => {}
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

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withAdminAndExistingUser()
      .withoutTargetUser()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, 'nonexistent-id-4792-a2f0-f95ccab82d92'))

    scenario.thenOutputBoundaryNotCalled('userUpdated')
  })
})
