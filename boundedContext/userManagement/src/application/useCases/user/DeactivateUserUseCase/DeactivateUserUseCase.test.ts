import { afterEach, describe, expect, it, vi } from 'vitest'
import { DeactivateUserScenario } from '../../../../__test__/support/user/DeactivateUserScenario'
import { NotFoundError } from '@hatsuportal/platform'
import { IDeactivateUserUseCaseOptions } from './DeactivateUserUseCase'
import { UserDeactivatedEvent } from '../../../../domain'

describe('DeactivateUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (loggedId: string, targetId: string): IDeactivateUserUseCaseOptions => ({
    deactivatingUserId: loggedId,
    deactivateUserInput: {
      userIdToDeactivate: targetId
    },
    userDeactivated: () => {}
  })

  it('should deactivate a user successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given().whenExecutedWithInput(
      baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id)
    )

    scenario.thenOutputBoundaryCalled('userDeactivated', expect.any(Object)).thenDomainEventsPersisted([expect.any(UserDeactivatedEvent)])
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .repositoryWillReject('deactivate', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userDeactivated').thenDomainEventsNotPersisted([expect.any(UserDeactivatedEvent)])
  })

  it('should not call output boundary and rollback transaction when domain event service fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .domainEventServiceWillReject(new unitFixture.TestError('Domain event service failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userDeactivated')
  })

  it('should throw NotFoundError when target user is already inactive', async ({ unitFixture }) => {
    const inactiveUser = unitFixture.userMock({ active: false })
    const scenario = await DeactivateUserScenario.given()
      .withInactiveTargetUser(inactiveUser)
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, inactiveUser.id.value))

    scenario
      .thenOutputBoundaryNotCalled('userDeactivated')
      .thenDomainEventsNotPersisted([expect.any(UserDeactivatedEvent)])
      .thenRepositoryCalledTimes('deactivate', 0)
  })

  it('should throw NotFoundError when target user does not exist', async ({ unitFixture }) => {
    const missingUserId = 'nonexistent-user-id-4792-a2f0-f95ccab82d92'
    const scenario = await DeactivateUserScenario.given()
      .withoutTargetUserForUpdate()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, missingUserId))

    scenario.thenOutputBoundaryNotCalled('userDeactivated')
  })
})
