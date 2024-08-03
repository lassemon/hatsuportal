import { afterEach, describe, expect, it, vi } from 'vitest'
import { UpdateUserScenario } from '../../../../__test__/support/user/UpdateUserScenario'
import { ConcurrencyError, NotFoundError } from '@hatsuportal/platform'
import { UserRoleEnum } from '@hatsuportal/common'
import { IUpdateUserUseCaseOptions } from './UpdateUserUseCase'
import { UpdateUserInputDTO } from '../../../dtos/useCase/UpdateUserInputDTO'
import { UserUpdatedEvent, InvalidPasswordError, UserRole } from '../../../../domain'

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
      .withUsers([unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })])
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryCalled('userUpdated', expect.any(Object))
  })

  it('should return updateConflict callback on concurrency error', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withUsers([unitFixture.userMock()])
      .repositoryWillReject('update', new ConcurrencyError('conflict', unitFixture.userMock()))
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryCalled('updateConflict', expect.any(ConcurrencyError)).thenOutputBoundaryNotCalled('userUpdated')
  })

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const missingUserId = 'nonexistent-id-4792-a2f0-f95ccab82d92'
    const scenario = await UpdateUserScenario.given()
      .withoutTargetUser(missingUserId)
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, missingUserId))

    scenario.thenOutputBoundaryNotCalled('userUpdated')
  })

  it('should not call output boundary when domain event service fails after successful update', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withUsers([unitFixture.userMock()])
      .domainEventServiceWillReject(new unitFixture.TestError('Domain event service failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userUpdated').thenOutputBoundaryNotCalled('updateConflict')
  })

  it('should not persist UserUpdatedEvent a second time when activating already active user', async ({ unitFixture }) => {
    const activeUser = unitFixture.userMock({ active: true })
    const activeOnlyInput = (userId: string): IUpdateUserUseCaseOptions => ({
      updatedById: userId,
      updateUserInput: { id: userId, active: true },
      userUpdated: () => {},
      updateConflict: () => {}
    })

    const firstRun = await UpdateUserScenario.given().withUsers([activeUser]).whenExecutedWithInput(activeOnlyInput(activeUser.id.value))

    firstRun.thenOutputBoundaryCalled('userUpdated', expect.any(Object)).thenDomainEventsNotPersisted([expect.any(UserUpdatedEvent)])

    const secondRun = await UpdateUserScenario.given().withUsers([activeUser]).whenExecutedWithInput(activeOnlyInput(activeUser.id.value))

    secondRun.thenOutputBoundaryCalled('userUpdated', expect.any(Object)).thenDomainEventsNotPersisted([expect.any(UserUpdatedEvent)])
  })

  it('should throw NotFoundError when target user is inactive', async ({ unitFixture }) => {
    const admin = unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })
    const inactiveTarget = unitFixture.userMock({ active: false })
    const scenario = await UpdateUserScenario.given()
      .withUsers([admin, inactiveTarget])
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(admin.id.value, inactiveTarget.id.value))

    scenario.thenOutputBoundaryNotCalled('userUpdated')
  })

  it('should throw InvalidPasswordError when old password is wrong', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withUsers([unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] }), unitFixture.userMock()])
      .authenticationWillReject(new InvalidPasswordError())
      .expectErrorOfType(InvalidPasswordError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userUpdated')
  })

  it('should not call output boundary when repository update fails', async ({ unitFixture }) => {
    const scenario = await UpdateUserScenario.given()
      .withUsers([unitFixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] }), unitFixture.userMock()])
      .repositoryWillReject('update', new unitFixture.TestError('update failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userUpdated').thenOutputBoundaryNotCalled('updateConflict')
  })
})
