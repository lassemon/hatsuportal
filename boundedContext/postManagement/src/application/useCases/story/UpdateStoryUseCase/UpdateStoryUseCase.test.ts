import { describe, it, expect, vi } from 'vitest'
import { UpdateStoryScenario } from '../../../../__test__/support/story/UpdateStoryScenario'
import { VisibilityEnum } from '@hatsuportal/common'
import { ConcurrencyError } from '@hatsuportal/platform'
import {
  CoverImageAddedToStoryEvent,
  CoverImageUpdatedToStoryEvent,
  StoryDescriptionUpdatedEvent,
  StoryNameUpdatedEvent,
  StoryVisibilityUpdatedEvent
} from '../../../../domain'

describe('UpdateStoryUseCase', () => {
  it('should update story with existing image and persist expected domain events', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated Name',
          description: 'Updated Description',
          image: {
            mimeType: 'image/png',
            size: 1024,
            base64: 'data:image/png;base64,updated-base64'
          }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsPersisted([
        expect.any(StoryNameUpdatedEvent),
        expect.any(StoryDescriptionUpdatedEvent),
        expect.any(CoverImageUpdatedToStoryEvent)
      ])
  })

  it('should add image to story without image and emit CoverImageAddedToStoryEvent', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withoutExistingImage()
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Updated Name',
          description: 'Updated Description',
          image: {
            mimeType: 'image/png',
            size: 1024,
            base64: 'data:image/png;base64,new-image-base64'
          }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsPersisted([
        expect.any(StoryNameUpdatedEvent),
        expect.any(StoryDescriptionUpdatedEvent),
        expect.any(CoverImageAddedToStoryEvent)
      ])
      .thenDomainEventsNotPersisted([expect.any(CoverImageUpdatedToStoryEvent)])
  })

  it('should update story details without image and not dispatch image related events', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withoutExistingImage()
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Renamed Story',
          description: 'New Description',
          visibility: VisibilityEnum.Public,
          image: null
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsPersisted([
        expect.any(StoryNameUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryDescriptionUpdatedEvent)
      ])
      .thenDomainEventsNotPersisted([expect.any(CoverImageAddedToStoryEvent), expect.any(CoverImageUpdatedToStoryEvent)])
  })

  it('should call updateConflict output boundary and not throw when ConcurrencyError occurs', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .writeRepositoryWillReject('update', new ConcurrencyError('conflict', unitFixture.storyMock()))
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Renamed Story',
          description: 'New Description',
          visibility: VisibilityEnum.Public,
          image: null
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryNotCalled('storyUpdated')
      .thenOutputBoundaryCalled('updateConflict', expect.any(Object))
      .thenDomainEventsNotPersisted([
        expect.any(StoryNameUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryDescriptionUpdatedEvent),
        expect.any(CoverImageUpdatedToStoryEvent)
      ])
  })

  it('should not call output boundary, not send domain events and rollback transaction when story repository fails', async ({
    unitFixture
  }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .writeRepositoryWillReject('update', new unitFixture.TestError('Database error'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          name: 'Renamed Story',
          description: 'New Description',
          visibility: VisibilityEnum.Public,
          image: null
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryNotCalled('storyUpdated')
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsNotPersisted([
        expect.any(StoryNameUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryDescriptionUpdatedEvent),
        expect.any(CoverImageUpdatedToStoryEvent)
      ])
  })
})
