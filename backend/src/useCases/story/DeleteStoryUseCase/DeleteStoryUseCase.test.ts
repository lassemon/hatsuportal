import { describe, it, expect, afterEach, vi } from 'vitest'

import { DeleteStoryScenario } from '../../../__test__/support/story/DeleteStoryScenario'
import { DataPersistenceError } from '@hatsuportal/common-bounded-context'

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

  it('should handle repository failure without crashing', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .repositoryWillReject('delete', new Error('Repository failed'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario
      .thenOutputBoundaryNotCalled('storyDeleted')
      .thenDomainEventsNotEmitted('StoryDeletedEvent', 'ImageRemovedFromStoryEvent')
      .thenTransactionRolledBack()
  })

  it('should handle transaction manager failure without crashing', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .transactionWillReject(new Error('Transaction failed'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('storyDeleted').thenDomainEventsNotEmitted('StoryDeletedEvent', 'ImageRemovedFromStoryEvent')
  })

  it('should handle event dispatcher failure without crashing', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .dispatcherWillReject(new Error('Event dispatching failed'))
      .expectErrorOfType(DataPersistenceError)
      .whenExecutedWithInput({
        loggedInUserId: unitFixture.userDTOMock().id,
        storyIdToDelete: unitFixture.storyDTOMock().id
      })

    scenario.thenOutputBoundaryNotCalled('storyDeleted').thenTransactionRolledBack()
  })
})
