import { describe, it, expect, vi, afterEach } from 'vitest'
import { DataPersistenceError } from '@hatsuportal/common-bounded-context'
import { VisibilityEnum } from '@hatsuportal/common'
import { CreateStoryScenario } from '../../../__test__/support/story/CreateStoryScenario'

describe('CreateStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should create a story successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA` }
        }
      })

    scenario
      .thenOutputBoundaryCalled('storyCreated', expect.any(Object))
      .thenDomainEventsEmitted('StoryCreatedEvent', 'ImageCreatedEvent', 'ImageAddedToStoryEvent')
      .thenTransactionCommitted()
  })

  it('should not dispatch image related domain events when image is not provided', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      })

    scenario
      .thenOutputBoundaryCalled('storyCreated', expect.any(Object))
      .thenDomainEventsEmitted('StoryCreatedEvent')
      .thenTransactionCommitted()
  })

  it('should throw error when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .repositoryWillReject('insert', new Error('Database connection failed'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotEmitted('StoryCreatedEvent').thenTransactionRolledBack()
  })

  it('should throw an ApplicationError when transaction manager fails on an unknown error', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .transactionWillReject(new Error('Transaction manager failure'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotEmitted('StoryCreatedEvent')
  })

  it('should throw error when event dispatcher fails', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .dispatcherWillReject(new Error('Event dispatching failed'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        createStoryData: {
          name: 'Test Story',
          description: 'Test Description',
          visibility: VisibilityEnum.Public,
          image: null
        }
      })

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenTransactionRolledBack()
  })
})
