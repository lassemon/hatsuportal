import { describe, it, vi, afterEach, expect } from 'vitest'
import { ApplicationError, DataPersistenceError } from '@hatsuportal/common-bounded-context'
import { CreateUserScenario } from '../../../../__test__/support/user/CreateUserScenario'

describe('CreateUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a user successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      creationData: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'ValidPassword123',
        roles: []
      }
    })

    scenario
      .thenOutputBoundaryCalled('userCreated', expect.any(Object))
      .thenDomainEventsEmitted('UserCreatedEvent')
      .thenTransactionCommitted()
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .repositoryWillReject('insert', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123',
          roles: []
        }
      })

    scenario.thenOutputBoundaryNotCalled('userCreated').thenDomainEventsNotEmitted('UserCreatedEvent').thenTransactionRolledBack()
  })

  it('should not call output boundary, send domain events when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .transactionWillReject(new unitFixture.TestError('Transaction manager failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123',
          roles: []
        }
      })

    scenario.thenOutputBoundaryNotCalled('userCreated').thenDomainEventsNotEmitted('UserCreatedEvent')
  })

  it('should not call output boundary and rollback transaction when event dispatcher fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .dispatcherWillReject(new unitFixture.TestError('Event dispatching failed'))
      .expectErrorOfType(ApplicationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        creationData: {
          name: 'Test User',
          email: 'test@example.com',
          password: 'ValidPassword123',
          roles: []
        }
      })

    scenario.thenOutputBoundaryNotCalled('userCreated').thenTransactionRolledBack()
  })
})
