import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApplicationError, DataPersistenceError } from '@hatsuportal/common-bounded-context'
import { DeactivateUserScenario } from '../../../../__test__/support/user/DeactivateUserScenario'

describe('DeactivateUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should deactivate a user successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      userIdToDeactivate: unitFixture.userDTOMock().id
    })

    scenario
      .thenOutputBoundaryCalled('userDeactivated', expect.any(Object))
      .thenDomainEventsEmitted('UserDeactivatedEvent')
      .thenTransactionCommitted()
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .repositoryWillReject('deactivate', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        userIdToDeactivate: unitFixture.userDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('userDeactivated').thenDomainEventsNotEmitted('UserDeactivatedEvent').thenTransactionRolledBack()
  })

  it('should not call output boundary, send domain events when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .transactionWillReject(new unitFixture.TestError('Transaction manager failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        userIdToDeactivate: unitFixture.userDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('userDeactivated').thenDomainEventsNotEmitted('UserDeactivatedEvent')
  })

  it('should not call output boundary and rollback transaction when event dispatcher fails', async ({ unitFixture }) => {
    const scenario = await DeactivateUserScenario.given()
      .dispatcherWillReject(new unitFixture.TestError('Event dispatching failed'))
      .expectErrorOfType(ApplicationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        userIdToDeactivate: unitFixture.userDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('userDeactivated').thenTransactionRolledBack()
  })
})
