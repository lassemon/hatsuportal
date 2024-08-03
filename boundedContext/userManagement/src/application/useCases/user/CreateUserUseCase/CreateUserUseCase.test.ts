import { describe, it, vi, afterEach, expect } from 'vitest'
import { CreateUserScenario } from '../../../../__test__/support/user/CreateUserScenario'
import { ICreateUserUseCaseOptions } from './CreateUserUseCase'
import { CreateUserInputDTO } from '../../../dtos'

describe('CreateUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (loggedId: string, overrides: Partial<CreateUserInputDTO> = {}): ICreateUserUseCaseOptions => ({
    createdById: loggedId,
    createUserInput: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPassword123',
      roles: [],
      ...overrides
    },
    userCreated: vi.fn()
  })

  it('should create a user successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given().whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryCalled('userCreated', expect.any(Object)).thenDomainEventsEmitted('UserCreatedEvent')
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .repositoryWillReject('insert', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('userCreated').thenDomainEventsNotEmitted('UserCreatedEvent')
  })

  it('should not call output boundary, send domain events when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .transactionWillReject(new unitFixture.TestError('Transaction manager failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('userCreated').thenDomainEventsNotEmitted('UserCreatedEvent')
  })

  it('should not call output boundary and rollback transaction when event dispatcher fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .dispatcherWillReject(new unitFixture.TestError('Event dispatching failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('userCreated')
  })
})
