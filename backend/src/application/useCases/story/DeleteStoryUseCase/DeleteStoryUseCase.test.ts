import { describe, it, expect, afterEach, vi } from 'vitest'

import { DeleteStoryScenario } from '../../../../__test__/support/story/DeleteStoryScenario'
import { ApplicationError, ConcurrencyError } from '@hatsuportal/common-bounded-context'

describe('DeleteStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delete a story with image successfully and emit expected domain events', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given().withLoggedInUser().withExistingStory().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdToDelete: unitFixture.storyDTOMock().id
    })

    scenario
      .thenOutputBoundaryCalled('storyDeleted', expect.any(Object))
      .thenDomainEventsEmitted('StoryDeletedEvent', 'ImageRemovedFromStoryEvent')
      .thenTransactionCommitted()
  })

  it('should delete a story without image and dispatch only StoryDeletedEvent', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given().withLoggedInUser().withExistingStory().withoutExistingImage().whenExecutedWithInput({
      loggedInUserId: unitFixture.userDTOMock().id,
      storyIdToDelete: unitFixture.storyDTOMock().id
    })

    scenario
      .thenOutputBoundaryCalled('storyDeleted', expect.any(Object))
      .thenDomainEventsEmitted('StoryDeletedEvent')
      .thenDomainEventsNotEmitted('ImageRemovedFromStoryEvent')
      .thenTransactionCommitted()
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .repositoryWillReject('delete', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(ApplicationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario
      .thenOutputBoundaryNotCalled('storyDeleted')
      .thenDomainEventsNotEmitted('StoryDeletedEvent', 'ImageRemovedFromStoryEvent')
      .thenTransactionRolledBack()
  })

  it('should not call output boundary, send domain events when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .transactionWillReject(new unitFixture.TestError('Transaction failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('storyDeleted').thenDomainEventsNotEmitted('StoryDeletedEvent', 'ImageRemovedFromStoryEvent')
  })

  it('should not call output boundary and rollback transaction when event dispatcher fails', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .dispatcherWillReject(new unitFixture.TestError('Event dispatching failed'))
      .expectErrorOfType(ApplicationError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('storyDeleted').thenTransactionRolledBack()
  })

  it('should call deleteConflict output boundary and not throw when ConcurrencyError occurs', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .repositoryWillReject('delete', new ConcurrencyError('conflict', unitFixture.storyDTOMock()))
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario
      .thenOutputBoundaryNotCalled('storyDeleted')
      .thenOutputBoundaryCalled('deleteConflict', expect.any(Object))
      .thenDomainEventsNotEmitted('StoryDeletedEvent', 'ImageRemovedFromStoryEvent')
      .thenTransactionRolledBack()
  })
})
