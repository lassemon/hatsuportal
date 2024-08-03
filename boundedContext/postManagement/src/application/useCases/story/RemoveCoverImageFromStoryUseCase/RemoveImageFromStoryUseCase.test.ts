import { describe, it, expect, vi, afterEach } from 'vitest'
import { RemoveImageFromStoryScenario } from '../../../../__test__/support/story/RemoveImageFromStoryScenario'
import { NotFoundError } from '@hatsuportal/platform'

describe('RemoveImageFromStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should remove image from story when it exists and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenOutputBoundaryCalled('imageRemoved', expect.any(Object)).thenDomainEventsEmitted('CoverImageRemovedFromStoryEvent')
  })

  it('should handle stories without image gracefully and not to emit domain events', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withoutExistingImage()
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenOutputBoundaryCalled('imageRemoved', expect.any(Object)).thenDomainEventsNotEmitted('CoverImageRemovedFromStoryEvent')
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: 'non-existent-story-id-a2f0-f95ccab82d92'
        },
        imageRemoved: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('imageRemoved').thenDomainEventsNotEmitted('CoverImageRemovedFromStoryEvent')
  })

  it('should call imageRemoved output boundary when image was already removed', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withImage(null)
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenOutputBoundaryCalled('imageRemoved', expect.any(Object)).thenDomainEventsNotEmitted('CoverImageRemovedFromStoryEvent')
  })

  it('should not call output boundary, send domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .writeRepositoryWillReject('findByIdForUpdate', new unitFixture.TestError('Database error'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        removedById: unitFixture.sampleUserId,
        removeImageFromStoryInput: {
          storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
        },
        imageRemoved: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('imageRemoved').thenDomainEventsNotEmitted('CoverImageRemovedFromStoryEvent')
  })
})
