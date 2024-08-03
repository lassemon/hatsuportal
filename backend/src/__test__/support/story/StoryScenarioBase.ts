import { expect, vi } from 'vitest'
import * as Fixture from '../../testFactory'

import { IStoryRepository, StoryApplicationMapper, StoryFactory } from '@hatsuportal/post-management'

import {
  StoryCreatedEvent,
  StoryUpdatedEvent,
  StoryDeletedEvent,
  ImageUpdatedToStoryEvent,
  ImageAddedToStoryEvent,
  ImageRemovedFromStoryEvent
} from '@hatsuportal/post-management'

import { Image, ImageCreatedEvent } from '@hatsuportal/common-bounded-context'
import { ScenarioBase } from '../ScenarioBase'

/** Convenience map for domain-event assertions */
export const StoryDomainEvents = {
  StoryCreatedEvent,
  StoryUpdatedEvent,
  StoryDeletedEvent,
  ImageCreatedEvent,
  ImageUpdatedToStoryEvent,
  ImageAddedToStoryEvent,
  ImageRemovedFromStoryEvent
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
  protected readonly storyRepository = Fixture.storyRepositoryMock()
  protected readonly imageRepository = Fixture.imageRepositoryMock()
  protected readonly storyMapper = new StoryApplicationMapper(new StoryFactory())

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, StoryDomainEvents)
    this.storyRepository.insert = vi.fn().mockImplementation((story) => story)
    this.storyRepository.update = vi.fn().mockImplementation((story) => story)
    this.storyRepository.delete = vi.fn().mockImplementation((story) => story)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withExistingStory(story = Fixture.storyMock()) {
    this.storyRepository.findById = vi.fn().mockResolvedValue(story)
    return this
  }

  withoutExistingStory() {
    this.storyRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  withoutExistingImage(story = Fixture.storyMock()) {
    story.update({ image: null })
    story.clearEvents()
    this.storyRepository.findById = vi.fn().mockResolvedValue(story)
    return this
  }

  withImage(image: Image | null = Fixture.imageMock()) {
    this.imageRepository.findById = vi.fn().mockResolvedValue(image)
    return this
  }

  repositoryWillReject(method: keyof IStoryRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.storyRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenRepositoryCalledTimes(method: keyof IStoryRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.storyRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
