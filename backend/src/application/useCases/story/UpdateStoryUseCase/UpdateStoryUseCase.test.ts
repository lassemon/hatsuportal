import { describe, it, expect } from 'vitest'
import { ApplicationError, ConcurrencyError } from '@hatsuportal/common-bounded-context'
import { UpdateStoryScenario } from '../../../../__test__/support/story/UpdateStoryScenario'

describe('UpdateStoryUseCase', () => {
  it('should update story with existing image and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated Name',
          description: 'Updated Description',
          image: {
            id: unitFixture.imageDTOMock().id,
            mimeType: 'image/png',
            size: 1024,
            base64: 'data:image/png;base64,updated-base64'
          }
        }
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsEmitted('StoryUpdatedEvent', 'ImageUpdatedToStoryEvent')
      .thenTransactionCommitted()
  })

  it('should add image to story without image and emit ImageAddedToStoryEvent', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withoutExistingImage()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Updated Name',
          description: 'Updated Description',
          image: {
            id: 'new-image-id-a2f0-f95ccab82d92',
            mimeType: 'image/png',
            size: 1024,
            base64: 'data:image/png;base64,new-image-base64'
          }
        }
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsEmitted('StoryUpdatedEvent', 'ImageAddedToStoryEvent')
      .thenDomainEventsNotEmitted('ImageUpdatedToStoryEvent')
      .thenTransactionCommitted()
  })

  it('should update story details without image and not dispatch image related events', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Renamed Story',
          description: 'New Description',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsEmitted('StoryUpdatedEvent')
      .thenDomainEventsNotEmitted('ImageAddedToStoryEvent', 'ImageUpdatedToStoryEvent')
      .thenTransactionCommitted()
  })

  it('should call updateConflict output boundary and not throw when ConcurrencyError occurs', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .repositoryWillReject('update', new ConcurrencyError('conflict', unitFixture.storyDTOMock()))
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Renamed Story',
          description: 'New Description',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario
      .thenOutputBoundaryNotCalled('storyUpdated')
      .thenOutputBoundaryCalled('updateConflict', expect.any(Object))
      .thenDomainEventsNotEmitted('StoryUpdatedEvent', 'ImageUpdatedToStoryEvent')
      .thenTransactionRolledBack()
  })

  it('should not call output boundary, not send domain events and rollback transaction when story repository fails', async ({
    unitFixture
  }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .repositoryWillReject('update', new unitFixture.TestError('Database error'))
      .expectErrorOfType(ApplicationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        updateStoryData: {
          id: unitFixture.storyDTOMock().id,
          name: 'Renamed Story',
          description: 'New Description',
          visibility: unitFixture.storyDTOMock().visibility,
          image: null
        }
      })

    scenario
      .thenOutputBoundaryNotCalled('storyUpdated')
      .thenOutputBoundaryNotCalled('updateConflict')
      .thenDomainEventsNotEmitted('StoryUpdatedEvent', 'ImageUpdatedToStoryEvent')
      .thenTransactionRolledBack()
  })
})
