import { expect, vi, Mock } from 'vitest'
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

import { ImageCreatedEvent } from '@hatsuportal/common-bounded-context'

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
export abstract class StoryScenarioBase<INPUT, CALLBACKS extends string> {
  // ── Infrastructure doubles ─────────────────────────────────────────
  protected readonly userRepository = Fixture.userRepositoryMock()
  protected readonly storyRepository = Fixture.storyRepositoryMock()
  protected readonly imageRepository = Fixture.imageRepositoryMock()
  protected readonly storyMapper = new StoryApplicationMapper(new StoryFactory())
  protected readonly transactionBundle = Fixture.transactionManagerFactory()

  // ── Callback spies (filled by concrete subclass) ───────────────────
  private readonly callbackSpies: Record<CALLBACKS, Mock>

  // ── Captured rejection, if any, for Then assertions ────────────────
  private capturedError: unknown
  private expectedErrorConstructor: (new (...arguments_: any[]) => Error) | null = null

  protected constructor(callbackNames: CALLBACKS[]) {
    // Create a spy for every requested callback key
    this.callbackSpies = Object.fromEntries(callbackNames.map((n) => [n, vi.fn()])) as Record<CALLBACKS, Mock>
    this.storyRepository.insert = vi.fn().mockImplementation((story) => story)
    this.storyRepository.update = vi.fn().mockImplementation((story) => story)
  }

  // ───────────────────────────────────────────────────────────────────
  // WHEN – must be implemented by each concrete scenario
  //        (call `await this.capture(async () => ...)`)
  // ───────────────────────────────────────────────────────────────────
  abstract whenExecutedWithInput(input: INPUT): Promise<this>

  /** Expose a spy to the subclass in a type-safe way */
  protected spyOutputBoundary<Name extends CALLBACKS>(name: Name): Mock {
    return this.callbackSpies[name]
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withLoggedInUser(user = Fixture.userMock()) {
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withoutLoggedInUser() {
    this.userRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

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

  repositoryWillReject(method: keyof IStoryRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.storyRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  transactionWillReject(error = new Error('Transaction manager failure')) {
    this.transactionBundle.transactionManagerMock.execute = vi.fn().mockRejectedValue(error)
    return this
  }

  dispatcherWillReject(error = new Error('Domain-event dispatcher failure')) {
    this.transactionBundle.domainEventDispatcherMock.dispatch = vi.fn().mockRejectedValue(error)
    return this
  }

  expectErrorOfType<E extends Error>(constructor: new (...arguments_: any[]) => E) {
    this.expectedErrorConstructor = constructor
    return this
  }

  // ───────────────────────────────────────────────────────────────────
  // THEN helpers
  // ───────────────────────────────────────────────────────────────────
  thenDomainEventsEmitted(...eventKeys: (keyof typeof StoryDomainEvents)[]) {
    this.ensureNoUnexpectedError()
    eventKeys.forEach((key) =>
      expect(this.transactionBundle.domainEventDispatcherMock.dispatch).toHaveBeenCalledWith(expect.any(StoryDomainEvents[key]))
    )
    return this
  }

  thenDomainEventsNotEmitted(...eventKeys: (keyof typeof StoryDomainEvents)[]) {
    this.ensureNoUnexpectedError()
    eventKeys.forEach((key) =>
      expect(this.transactionBundle.domainEventDispatcherMock.dispatch).not.toHaveBeenCalledWith(expect.any(StoryDomainEvents[key]))
    )
    return this
  }

  thenOutputBoundaryCalled<Name extends CALLBACKS>(name: Name, ...withArgs: any[]) {
    this.ensureNoUnexpectedError()
    expect(this.spyOutputBoundary(name)).toHaveBeenCalledWith(...withArgs)
    return this
  }

  thenOutputBoundaryNotCalled<Name extends CALLBACKS>(name: Name) {
    this.ensureNoUnexpectedError()
    expect(this.spyOutputBoundary(name)).not.toHaveBeenCalled()
    return this
  }

  thenTransactionRolledBack() {
    this.ensureNoUnexpectedError()
    expect(this.transactionBundle.rollbackSpy).toHaveBeenCalled()
    return this
  }

  thenTransactionCommitted() {
    this.ensureNoUnexpectedError()
    expect(this.transactionBundle.commitSpy).toHaveBeenCalled()
    return this
  }

  protected ensureNoUnexpectedError() {
    /* nothing went wrong */
    if (!this.capturedError) return

    /* caller stated what error is expected */
    if (this.expectedErrorConstructor && this.capturedError instanceof this.expectedErrorConstructor) {
      return // expected -> do not throw
    }

    /* any other case: surface original stack */
    throw this.capturedError
  }

  protected async capture(execution: () => Promise<unknown>): Promise<void> {
    try {
      await execution()
    } catch (error) {
      this.capturedError = error
    }
  }
}
