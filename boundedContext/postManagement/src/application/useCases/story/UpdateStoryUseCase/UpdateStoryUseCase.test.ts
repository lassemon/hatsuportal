import { describe, it, expect, vi } from 'vitest'
import { UpdateStoryScenario } from '../../../../__test__/support/story/UpdateStoryScenario'
import { VisibilityEnum } from '@hatsuportal/common'
import { ConcurrencyError, InvalidInputError, NotFoundError } from '@hatsuportal/platform'
import {
  CoverImageAddedToStoryEvent,
  CoverImageUpdatedToStoryEvent,
  StoryTitleUpdatedEvent,
  StoryBodyUpdatedEvent,
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
          title: 'Updated Name',
          body: 'Updated Body',
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
      .thenDeleteCoverImageIfUnreferencedCalled(unitFixture.sampleImageId, unitFixture.sampleUserId)
      .thenDomainEventsPersisted([
        expect.any(StoryTitleUpdatedEvent),
        expect.any(StoryBodyUpdatedEvent),
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
          title: 'Updated Name',
          body: 'Updated Body',
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
      .thenPromoteImageVersionCalled()
      .thenDeleteCoverImageIfUnreferencedNotCalled()
      .thenDomainEventsPersisted([
        expect.any(StoryTitleUpdatedEvent),
        expect.any(StoryBodyUpdatedEvent),
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
          title: 'Renamed Story',
          body: 'New Body',
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
        expect.any(StoryTitleUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryBodyUpdatedEvent)
      ])
      .thenDomainEventsNotPersisted([expect.any(CoverImageAddedToStoryEvent), expect.any(CoverImageUpdatedToStoryEvent)])
  })

  it('should remove cover image and clean up the old image synchronously', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .withExistingImage()
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          image: null
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario
      .thenOutputBoundaryCalled('storyUpdated', expect.any(Object))
      .thenDeleteCoverImageIfUnreferencedCalled(unitFixture.sampleImageId, unitFixture.sampleUserId)
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
          title: 'Renamed Story',
          body: 'New Body',
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
        expect.any(StoryTitleUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryBodyUpdatedEvent),
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
          title: 'Renamed Story',
          body: 'New Body',
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
        expect.any(StoryTitleUpdatedEvent),
        expect.any(StoryVisibilityUpdatedEvent),
        expect.any(StoryBodyUpdatedEvent),
        expect.any(CoverImageUpdatedToStoryEvent)
      ])
  })

  it('throws NotFoundError when story does not exist', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withoutExistingStory()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: { id: unitFixture.sampleStoryId, title: 'Updated' },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated').thenWriteRepositoryCalledTimes('update', 0)
  })

  it('throws NotFoundError when lookup fails after successful update', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withExistingStory()
      .withoutExistingStoryInLookupService()
      .expectErrorOfType(NotFoundError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: { id: unitFixture.sampleStoryId, title: 'Updated' },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated').thenWriteRepositoryCalledTimes('update', 1)
  })

  it('throws InvalidInputError when tag resolution fails', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withLoggedInUser()
      .withExistingStory()
      .resolveStoryTagIdsWillReject(new InvalidInputError('One or more tag ids do not exist: missing-tag'))
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: { id: unitFixture.sampleStoryId, tags: [{ id: 'missing-tag' }] },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated').thenWriteRepositoryCalledTimes('update', 0)
  })

  it('throws when prepareStagedImageFile fails before any database write', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withExistingStory()
      .mediaGatewayWillReject('prepareStagedImageFile', new unitFixture.TestError('Image prepare failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          image: { mimeType: 'image/png', size: 1024, base64: 'data:image/png;base64,updated' }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated').thenWriteRepositoryCalledTimes('update', 0)
  })

  it('throws when promoteImageVersion fails after story metadata was committed', async ({ unitFixture }) => {
    const scenario = await UpdateStoryScenario.given()
      .withExistingStory()
      .withoutExistingImage()
      .mediaGatewayWillReject('promoteImageVersion', new unitFixture.TestError('Image promote failed'))
      .expectErrorOfType(unitFixture.TestError)
      .whenExecutedWithInput({
        updatedById: unitFixture.sampleUserId,
        updateStoryInput: {
          id: unitFixture.sampleStoryId,
          image: { mimeType: 'image/png', size: 1024, base64: 'data:image/png;base64,new-image' }
        },
        storyUpdated: vi.fn(),
        updateConflict: vi.fn()
      })

    scenario.thenOutputBoundaryNotCalled('storyUpdated').thenWriteRepositoryCalledTimes('update', 1)
  })
})
