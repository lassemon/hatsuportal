import { describe, it, expect, afterEach, vi } from 'vitest'

import { DeleteStoryScenario } from '../../../../__test__/support/story/DeleteStoryScenario'
import { ConcurrencyError } from '@hatsuportal/platform'

describe('DeleteStoryUseCase', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should delete a story with image successfully and emit expected domain events', async ({ unitFixture }) => {
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
      .thenDomainEventsEmitted('StoryDeletedEvent', 'CoverImageRemovedFromStoryEvent')
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
      .thenDomainEventsEmitted('StoryDeletedEvent')
      .thenDomainEventsNotEmitted('CoverImageRemovedFromStoryEvent')
  })

  it('should not call output boundary, not send domain events and rollback transaction when repository fails', async ({ unitFixture }) => {
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

    scenario.thenOutputBoundaryNotCalled('storyDeleted').thenDomainEventsNotEmitted('StoryDeletedEvent', 'CoverImageRemovedFromStoryEvent')
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

    scenario.thenOutputBoundaryNotCalled('storyDeleted').thenDomainEventsNotEmitted('StoryDeletedEvent', 'CoverImageRemovedFromStoryEvent')
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
      .thenDomainEventsNotEmitted('StoryDeletedEvent', 'CoverImageRemovedFromStoryEvent')
  })
})
