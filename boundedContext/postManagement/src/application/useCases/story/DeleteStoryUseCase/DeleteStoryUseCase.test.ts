import { describe, it, expect, afterEach, vi } from 'vitest'

import { DeleteStoryScenario } from '../../../../__test__/support/story/DeleteStoryScenario'
import { ConcurrencyError } from '@hatsuportal/platform'
import { StoryDeletedEvent } from '../../../../domain'
import * as Fixture from '../../../../__test__/testFactory'

describe('DeleteStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delete a story with image successfully, persist StoryDeletedEvent, and clean up cover image', async ({
    unitFixture
  }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryCalled('storyDeleted', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(StoryDeletedEvent)])
      .thenDeleteCoverImageIfUnreferencedCalled(Fixture.sampleImageId, unitFixture.sampleUserId)
  })

  it('should delete a story without image and dispatch only StoryDeletedEvent', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withoutExistingImage()
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryCalled('storyDeleted', expect.any(Object))
      .thenDomainEventsPersisted([expect.any(StoryDeletedEvent)])
      .thenDeleteCoverImageIfUnreferencedNotCalled()
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({
    unitFixture
  }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .writeRepositoryWillReject('delete', new unitFixture.TestError('Repository failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryNotCalled('storyDeleted')
      .thenDomainEventsNotPersisted([expect.any(StoryDeletedEvent)])
      .thenDeleteCoverImageIfUnreferencedNotCalled()
  })

  it('should not call output boundary, send domain events when transaction manager fails', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .transactionWillReject(new unitFixture.TestError('Transaction failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryNotCalled('storyDeleted')
      .thenDomainEventsNotPersisted([expect.any(StoryDeletedEvent)])
      .thenDeleteCoverImageIfUnreferencedNotCalled()
  })

  it('should call deleteConflict output boundary and not throw when ConcurrencyError occurs', async ({ unitFixture }) => {
    const scenario = await DeleteStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .writeRepositoryWillReject('delete', new ConcurrencyError('conflict', unitFixture.storyMock()))
      .whenExecutedWithInput({
        deletedById: unitFixture.sampleUserId,
        deleteStoryInput: {
          storyIdToDelete: unitFixture.storyDTOMock().id
        },
        storyDeleted: vi.fn(),
        deleteConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryNotCalled('storyDeleted')
      .thenOutputBoundaryCalled('deleteConflict', expect.any(Object))
      .thenDomainEventsNotPersisted([expect.any(StoryDeletedEvent)])
      .thenDeleteCoverImageIfUnreferencedNotCalled()
  })
})
