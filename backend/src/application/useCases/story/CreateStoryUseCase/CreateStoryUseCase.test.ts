import { describe, it, expect, vi, afterEach } from 'vitest'
import { ApplicationError, DataPersistenceError } from '@hatsuportal/common-bounded-context'
import { DeepPartial, VisibilityEnum } from '@hatsuportal/common'
import { CreateStoryScenario } from '../../../../__test__/support/story/CreateStoryScenario'
import { CreateStoryInputDTO } from '@hatsuportal/post-management'

describe('CreateStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, customProps: DeepPartial<CreateStoryInputDTO> = {}): CreateStoryInputDTO => ({
    loggedInUserId: userId,
    createStoryData: {
      name: 'Test Story',
      description: 'Test Description',
      visibility: VisibilityEnum.Public,
      ...customProps.createStoryData,
      image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA`, ...customProps.createStoryData?.image }
    }
  })

  it('should create a story successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario
      .thenOutputBoundaryCalled('storyCreated', expect.any(Object))
      .thenDomainEventsEmitted('StoryCreatedEvent', 'ImageCreatedEvent', 'ImageAddedToStoryEvent')
      .thenTransactionCommitted()
  })

  it('should not dispatch image related domain events when image is not provided', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { image: null } }))

    scenario
      .thenOutputBoundaryCalled('storyCreated', expect.any(Object))
      .thenDomainEventsEmitted('StoryCreatedEvent')
      .thenTransactionCommitted()
  })

  it('should not call output boundary, send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .repositoryWillReject('insert', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id))

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotEmitted('StoryCreatedEvent').thenTransactionRolledBack()
  })

  it('should not call output boundary, send domain events and rollback transaction when transaction manager fails', async ({
    unitFixture
  }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .transactionWillReject(new unitFixture.TestError('Transaction manager failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { image: null } }))

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotEmitted('StoryCreatedEvent')
  })

  it('should not call output boundary, not send domain events and rollback transaction when event dispatcher fails', async ({
    unitFixture
  }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .dispatcherWillReject(new unitFixture.TestError('Event dispatching failed'))
      .expectErrorOfType(ApplicationError)
      .whenExecutedWithInput(baseInput(unitFixture.userDTOMock().id, { createStoryData: { image: null } }))

    // can't check domainEventNotEmitted here because the code does call the domain event .dispatch just before failing
    scenario.thenOutputBoundaryNotCalled('storyCreated').thenTransactionRolledBack()
  })
})
