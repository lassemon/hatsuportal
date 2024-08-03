import { expect, Mock, vi } from 'vitest'
import * as Fixture from '../testFactory'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

/**
 * Generic base for all scenario builders.
 *
 * This class follows the Given-When-Then pattern for behavior-driven development:
 * - Given: Setup the initial state using fluent methods
 * - When: Execute the use case under test with whenExecutedWithInput()
 * - Then: Assert the expected outcomes using methods like thenOutputBoundaryCalled()
 *
 * `INPUT`  – type of the use-case inbound DTO.
 * `CALLBACKS` – union of *string literal* names for every callback
 *               the concrete use-case exposes (e.g. "userUpdated").
 */
export abstract class ScenarioBase<
  INPUT,
  CALLBACKS extends string,
  DOMAIN_EVENTS extends Record<string, new (...args: any[]) => IDomainEvent<UnixTimestamp>>
> {
  protected readonly userRepository = Fixture.userRepositoryMock()
  protected readonly domainEventDispatcher = Fixture.domainEventDispatcherMock()
  protected readonly transactionManager = Fixture.transactionManagerMock(this.domainEventDispatcher)
  protected readonly domainEvents: DOMAIN_EVENTS

  // ── Callback spies (filled by concrete subclass) ───────────────────
  protected readonly callbackSpies: Record<CALLBACKS, Mock>

  // ── Captured rejection, if any, for Then assertions ────────────────
  private capturedError: unknown
  private expectedErrorConstructor: (new (...arguments_: any[]) => Error) | null = null

  // ── Execution tracking ────────────────────────────────────────────
  private executionPromise?: Promise<unknown>
  private executionPending: boolean = false

  constructor(callbackNames: CALLBACKS[], domainEvents: DOMAIN_EVENTS) {
    this.callbackSpies = Object.fromEntries(callbackNames.map((n) => [n, vi.fn()])) as Record<CALLBACKS, Mock>
    this.domainEvents = domainEvents
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

  // ───────────────────────────────────────────────────────────────────
  // WHEN – must be implemented by each concrete scenario
  //        (call `await this.capture(async () => ...)`)
  // ───────────────────────────────────────────────────────────────────
  abstract whenExecutedWithInput(input: INPUT): Promise<this>

  /** Expose a spy to the subclass in a type-safe way */
  protected spyOutputBoundary<Name extends CALLBACKS>(name: Name): Mock {
    return this.callbackSpies[name]
  }

  transactionWillReject(error = new Error('Transaction manager failure')) {
    this.transactionManager.execute = vi.fn().mockRejectedValue(error)
    return this
  }

  dispatcherWillReject(error = new Error('Domain-event dispatcher failure')) {
    this.domainEventDispatcher.dispatch = vi.fn().mockRejectedValue(error)
    return this
  }

  expectErrorOfType<E extends Error>(constructor: new (...arguments_: any[]) => E) {
    this.expectedErrorConstructor = constructor
    return this
  }

  // ───────────────────────────────────────────────────────────────────
  // THEN helpers
  // ───────────────────────────────────────────────────────────────────
  thenDomainEventsEmitted(...eventKeys: (keyof DOMAIN_EVENTS)[]) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()

    eventKeys.forEach((key) => expect(this.domainEventDispatcher.dispatch).toHaveBeenCalledWith(expect.any(this.domainEvents[key])))
    return this
  }

  thenDomainEventsNotEmitted(...eventKeys: (keyof DOMAIN_EVENTS)[]) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    eventKeys.forEach((key) => expect(this.domainEventDispatcher.dispatch).not.toHaveBeenCalledWith(expect.any(this.domainEvents[key])))
    return this
  }

  thenOutputBoundaryCalled<Name extends CALLBACKS>(name: Name, ...withArgs: any[]) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.spyOutputBoundary(name)).toHaveBeenCalledWith(...withArgs)
    return this
  }

  thenOutputBoundaryNotCalled<Name extends CALLBACKS>(name: Name) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.spyOutputBoundary(name)).not.toHaveBeenCalled()
    return this
  }

  protected ensureNoUnexpectedError() {
    if (!this.capturedError && this.expectedErrorConstructor) {
      throw new Error(`Expected error of type ${this.expectedErrorConstructor.name} but no error was captured`)
    }

    if (this.expectedErrorConstructor && !(this.capturedError instanceof this.expectedErrorConstructor)) {
      throw new Error(
        `Expected error of type ${this.expectedErrorConstructor.name} but got ${
          (this.capturedError as Error)?.stack ? `${(this.capturedError as Error).stack}` : this.capturedError?.constructor?.name
        }`
      )
    }

    /* nothing went wrong and expected that nothing would go wrong */
    if (!this.capturedError && !this.expectedErrorConstructor) return

    /* caller stated what error is expected */
    if (this.expectedErrorConstructor && this.capturedError instanceof this.expectedErrorConstructor) {
      return // expected -> do not throw
    }

    /* any other case: surface original stack */
    throw this.capturedError
  }

  /**
   * Ensures that the scenario's main execution (whenExecutedWithInput) has completed before assertions.
   * Should be called at the start of every "then" asserter.
   * Throws if whenExecutedWithInput was not awaited.
   */
  protected ensureExecutionCompleted() {
    if (this.executionPromise && this.executionPending) {
      throw new Error('Scenario execution is still pending. Make sure to await whenExecutedWithInput() before making assertions.')
    }
  }

  /**
   * Wraps the execution of the use case and tracks its completion.
   * Should be used by whenExecutedWithInput in scenario subclasses.
   */
  protected async capture(execution: () => Promise<unknown>): Promise<void> {
    this.executionPending = true
    this.executionPromise = execution()
    try {
      await this.executionPromise
    } catch (error) {
      this.capturedError = error
    } finally {
      this.executionPending = false
    }
  }
}
