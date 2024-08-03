import { describe, it, vi, afterEach, expect } from 'vitest'
import { CreateUserScenario } from '../../../../__test__/support/user/CreateUserScenario'
import { ICreateUserUseCaseOptions } from './CreateUserUseCase'
import { CreateUserInputDTO } from '../../../dtos'
import { UserCreatedEvent } from '../../../../domain'

describe('CreateUserUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (loggedInUserId: string, overrides: Partial<CreateUserInputDTO> = {}): ICreateUserUseCaseOptions => ({
    createdById: loggedInUserId,
    createUserInput: {
      name: 'Test User',
      email: 'test@example.com',
      password: 'ValidPassword123',
      roles: [],
      ...overrides
    },
    userCreated: vi.fn()
  })

  it('should create a user successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given().whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryCalled('userCreated', expect.any(Object)).thenDomainEventsPersisted([expect.any(UserCreatedEvent)])
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .repositoryWillReject('insert', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('userCreated').thenDomainEventsNotPersisted([expect.any(UserCreatedEvent)])
  })

  it('should not call output boundary and rollback transaction when domain event service fails', async ({ unitFixture }) => {
    const scenario = await CreateUserScenario.given()
      .domainEventServiceWillReject(new unitFixture.TestError('Domain event service failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('userCreated')
  })
})
