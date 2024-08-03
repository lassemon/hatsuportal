import { expect, vi } from 'vitest'
import * as Fixture from '../../testFactory'

import { ScenarioBase } from '../ScenarioBase'
import {
  CoverImageAddedToStoryEvent,
  CoverImageId,
  CoverImageRemovedFromStoryEvent,
  CoverImageUpdatedToStoryEvent,
  IStoryWriteRepository,
  StoryCreatedEvent,
  StoryDeletedEvent,
  StoryUpdatedEvent
} from '../../../domain'
import {
  ImageAttachmentReadModelDTO,
  ImageLoadResult,
  IStoryLookupService,
  IStoryReadRepository,
  StoryApplicationMapper
} from '../../../application'

/** Convenience map for domain-event assertions */
export const StoryDomainEvents = {
  StoryCreatedEvent,
  StoryUpdatedEvent,
  StoryDeletedEvent,
  CoverImageUpdatedToStoryEvent,
  CoverImageAddedToStoryEvent,
  CoverImageRemovedFromStoryEvent
}

/**
 * Generic base for all Story-related scenario builders.
 *
 * This class follows the Given-When-Then pattern for behavior-driven development:
 * - Given: Setup the initial state using fluent methods like withLoggedInUser()
 * - When: Execute the use case under test with whenExecutedWithInput()
 * - Then: Assert the expected outcomes using methods like thenOutputBoundaryCalled()
 *
 * `INPUT`  – type of the use-case inbound DTO.
 * `CALLBACKS` – union of *string literal* names for every callback
 *               the concrete use-case exposes (e.g. "storyUpdated").
 */
export abstract class StoryScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, typeof StoryDomainEvents> {
  protected readonly storyWriteRepository = Fixture.storyWriteRepositoryMock()
  protected readonly storyReadRepository = Fixture.storyReadRepositoryMock()
  protected readonly storyLookupService = Fixture.storyLookupServiceMock()
  protected readonly mediaGateway = Fixture.mediaGatewayMock()
  protected readonly tagRepository = Fixture.tagRepositoryMock()
  protected readonly storyMapper = new StoryApplicationMapper()
  protected readonly postWriteRepository = Fixture.postWriteRepositoryMock()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, StoryDomainEvents)
    this.storyWriteRepository.insert = vi.fn().mockImplementation((story) => story)
    this.storyWriteRepository.update = vi.fn().mockImplementation((story) => story)
    this.storyWriteRepository.delete = vi.fn().mockImplementation((story) => story)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withExistingStory(story = Fixture.storyMock()) {
    this.storyWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(story)
    this.storyReadRepository.findById = vi.fn().mockResolvedValue(story)
    this.storyLookupService.findById = vi.fn().mockResolvedValue(Fixture.storyReadModelDTOMock())
    return this
  }

  withoutExistingStory() {
    this.storyWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(null)
    this.storyReadRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  withoutExistingStoryInLookupService() {
    this.storyLookupService.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  withExistingImage(imageId: CoverImageId = new CoverImageId(Fixture.sampleImageId)) {
    this.storyWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(Fixture.storyMock({ coverImageId: imageId }))
    this.storyReadRepository.findById = vi.fn().mockResolvedValue(Fixture.storyMock({ coverImageId: imageId }))
    this.storyLookupService.findById = vi.fn().mockResolvedValue(Fixture.storyMock({ coverImageId: imageId }))
    this.mediaGateway.getImageById = vi.fn().mockResolvedValue(Fixture.imageAttacmentMock({ id: imageId.value }))
    return this
  }

  withoutExistingImage() {
    const story = Fixture.storyMock()
    story.updateCoverImage(null)
    story.clearEvents()
    this.storyWriteRepository.findByIdForUpdate = vi.fn().mockResolvedValue(story)
    this.storyReadRepository.findById = vi.fn().mockResolvedValue(story)
    this.storyLookupService.findById = vi.fn().mockResolvedValue(Fixture.storyReadModelDTOMock())
    this.mediaGateway.getImageById = vi.fn().mockResolvedValue(ImageLoadResult.failedToLoad('test-image-id', new Error('Image not found')))
    return this
  }

  withImage(image: ImageAttachmentReadModelDTO | null = Fixture.imageAttacmentMock()) {
    if (image === null) {
      this.withoutExistingImage()
    } else {
    }
    this.mediaGateway.getImageById = vi.fn().mockResolvedValue(image)
    return this
  }

  lookupServiceWillReject(method: keyof IStoryLookupService, error: Error = new Error('Lookup service failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.storyLookupService[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  writeRepositoryWillReject(method: keyof IStoryWriteRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.storyWriteRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  readRepositoryWillReject(method: keyof IStoryReadRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.storyReadRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenWriteRepositoryCalledTimes(method: keyof IStoryWriteRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.storyWriteRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }

  thenReadRepositoryCalledTimes(method: keyof IStoryReadRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.storyReadRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
