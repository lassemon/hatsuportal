import { describe, it, expect, vi, afterEach } from 'vitest'
import { DeepPartial, VisibilityEnum } from '@hatsuportal/common'
import { CreateStoryScenario } from '../../../../__test__/support/story/CreateStoryScenario'
import { CreateStoryInputDTO } from '../../../dtos'
import { ICreateStoryUseCaseOptions } from '../CreateStoryUseCase'

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
      image: { mimeType: 'image/png', size: 1, base64: `data:image/png;base64,AAA`, ...customProps.image }
    },
    storyCreated: vi.fn()
  })

  it('should create a story successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario
      .thenOutputBoundaryCalled('storyCreated', expect.any(Object))
      .thenDomainEventsEmitted('StoryCreatedEvent')
      .thenDomainEventsNotEmitted('StoryUpdatedEvent', 'StoryDeletedEvent', 'CoverImageRemovedFromStoryEvent')
  })

  it('should not dispatch image related domain events when image is not provided', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId, { image: null }))

    scenario.thenOutputBoundaryCalled('storyCreated', expect.any(Object)).thenDomainEventsEmitted('StoryCreatedEvent')
  })

  it('should not call output boundary, send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await CreateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .writeRepositoryWillReject('insert', new unitFixture.TestError('Database connection failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput(baseInput(unitFixture.sampleUserId))

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotEmitted('StoryCreatedEvent')
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

    scenario.thenOutputBoundaryNotCalled('storyCreated').thenDomainEventsNotEmitted('StoryCreatedEvent')
  })
})
