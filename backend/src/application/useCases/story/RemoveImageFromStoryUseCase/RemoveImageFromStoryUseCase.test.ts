import { describe, it, expect, vi, afterEach } from 'vitest'
import { NotFoundError } from '@hatsuportal/common-bounded-context'
import { RemoveImageFromStoryScenario } from '../../../../__test__/support/story/RemoveImageFromStoryScenario'

describe('RemoveImageFromStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should remove image from story when it exists and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given().withLoggedInUser().withExistingStory().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
    })

    scenario
      .thenOutputBoundaryCalled('imageRemoved', expect.any(Object))
      .thenDomainEventsEmitted('ImageRemovedFromStoryEvent')
      .thenTransactionCommitted()
  })

  it('should handle stories without image gracefully and not to emit domain events', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withoutExistingImage()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryCalled('imageRemoved', expect.any(Object)).thenDomainEventsNotEmitted('ImageRemovedFromStoryEvent')
  })

  it('should throw NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: 'non-existent-story-id-a2f0-f95ccab82d92'
      })

    scenario.thenOutputBoundaryNotCalled('imageRemoved').thenDomainEventsNotEmitted('ImageRemovedFromStoryEvent')
  })

  it('should call imageRemoved output boundary when image was already removed', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withImage(null)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryCalled('imageRemoved', expect.any(Object)).thenDomainEventsNotEmitted('ImageRemovedFromStoryEvent')
  })

  it('should not call output boundary, send domain events when repository fails', async ({ unitFixture }) => {
    const scenario = await RemoveImageFromStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .repositoryWillReject('findById', new unitFixture.TestError('Database error'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdFromWhichToRemoveImage: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('imageRemoved').thenDomainEventsNotEmitted('ImageRemovedFromStoryEvent')
  })
})
