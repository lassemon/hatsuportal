import { describe, it, expect, vi, afterEach } from 'vitest'
import { DeepPartial, VisibilityEnum } from '@hatsuportal/common'
import { CreateStoryScenario } from '../../../../__test__/support/story/CreateStoryScenario'
import { CreateStoryInputDTO } from '../../../dtos'
import { ICreateStoryUseCaseOptions } from '../CreateStoryUseCase'
import {
  CoverImageRemovedFromStoryEvent,
  StoryCreatedEvent,
  StoryDeletedEvent,
  StoryDescriptionUpdatedEvent,
  StoryNameUpdatedEvent,
  StoryVisibilityUpdatedEvent
} from '../../../../domain'
import { TagInputDTO } from '../../../dtos/useCase/TagInputDTO'

describe('CreateStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const baseInput = (userId: string, customProps: DeepPartial<CreateStoryInputDTO> = {}): ICreateStoryUseCaseOptions => ({
    createdById: userId,
    createStoryInput: {
      name: 'Test Story',
      description: 'Test Description',
      visibility: VisibilityEnum.Public,
      ...customProps,
      tags: (customProps.tags?.filter((tag) => tag !== undefined && tag !== null) as TagInputDTO[]) ?? [],
      image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA`, ...customProps.image }
    },
    storyCreated: vi.fn()
  })

  it('should create a story successfully and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario
      .thenOutputBoundaryCalled('storyCreated', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(StoryCreatedEvent)])
      .thenDomainEventsNotPersisted([
        expect.any(StoryNameUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryDescriptionUpdatedEvent),
        expect.any(StoryDeletedEvent),
        expect.any(CoverImageRemovedFromStoryEvent)
      ])
  })

  it('should not dispatch image related domain events when image is not provided', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: null }))

    scenario.thenOutputBoundaryCalled('storyCreated', expect.any(Object)).thenDomainEventsPersisted([expect.any(StoryCreatedEvent)])
  })

  it('should not call output boundary, send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .writeRepositoryWillReject('insert', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotPersisted([expect.any(StoryCreatedEvent)])
  })

  it('should not call output boundary, send domain events and rollback transaction when transaction manager fails', async ({
    unitFixture
  }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .transactionWillReject(new unitFixture.TestError('Transaction manager failure'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: null }))

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotPersisted([expect.any(StoryCreatedEvent)])
  })
})
