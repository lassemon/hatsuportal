import { describe, it, expect, vi } from 'vitest'
import { UpdateStoryScenario } from '../../../../__test__/support/story/UpdateStoryScenario'
import { VisibilityEnum } from '@hatsuportal/common'
import { ConcurrencyError } from '@hatsuportal/platform'

describe('UpdateStoryUseCase', () => {
  it('should update story with existing image and emit expected domain events', async ({ unitFixture }) => {
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
      .thenDomainEventsEmitted('StoryUpdatedEvent', 'CoverImageUpdatedToStoryEvent')
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
      .thenDomainEventsEmitted('StoryUpdatedEvent', 'CoverImageAddedToStoryEvent')
      .thenDomainEventsNotEmitted('CoverImageUpdatedToStoryEvent', 'CoverImageRemovedFromStoryEvent')
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
      .thenDomainEventsEmitted('StoryUpdatedEvent')
      .thenDomainEventsNotEmitted('CoverImageAddedToStoryEvent', 'CoverImageUpdatedToStoryEvent')
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
      .thenDomainEventsNotEmitted('StoryUpdatedEvent', 'CoverImageUpdatedToStoryEvent')
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
      .thenDomainEventsNotEmitted('StoryUpdatedEvent', 'CoverImageUpdatedToStoryEvent')
  })
})
