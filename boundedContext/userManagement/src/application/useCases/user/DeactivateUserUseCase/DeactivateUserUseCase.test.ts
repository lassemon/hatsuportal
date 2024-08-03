import { afterEach, describe, expect, it, vi } from 'vitest'
import { DeactivateUserScenario } from '../../../../__test__/support/user/DeactivateUserScenario'
import { IDeactivateUserUseCaseOptions } from './DeactivateUserUseCase'

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

  it('should deactivate a user successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given().whenExecutedWithInput(
      baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id)
    )

    scenario.thenOutputBoundaryCalled('userDeactivated', expect.any(Object)).thenDomainEventsEmitted('UserDeactivatedEvent')
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .repositoryWillReject('deactivate', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userDeactivated').thenDomainEventsNotEmitted('UserDeactivatedEvent')
  })

  it('should not call output boundary, send domain events when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .transactionWillReject(new unitFixture.TestError('Transaction manager failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userDeactivated').thenDomainEventsNotEmitted('UserDeactivatedEvent')
  })

  it('should not call output boundary and rollback transaction when event dispatcher fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .dispatcherWillReject(new unitFixture.TestError('Event dispatching failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('userDeactivated')
  })
})
