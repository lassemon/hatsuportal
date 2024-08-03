import { expect, Mock, vi } from 'vitest'
import * as Fixture from '../testFactory'
import { EntityLoadResult } from '@hatsuportal/platform'
import { UserLoadError } from '../../application/acl/userManagement/errors/UserLoadError'
import { UserRoleEnum } from '@hatsuportal/common'
import { IDomainEvent } from '@hatsuportal/shared-kernel'
import { UserReadModelDTO } from '../../application/dtos/user/UserReadModelDTO'

function eventsFromLastPersistEventsCall(persistEvents: { mock: { calls: Array<[readonly IDomainEvent[]]> } }): IDomainEvent[] {
  // Array.prototype.at() treats negative indices as offsets from the end of the array
  return [...(persistEvents.mock.calls.at(-1)?.[0] ?? [])]
}

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
  DOMAIN_EVENTS extends Record<string, new (...args: any[]) => IDomainEvent>
> {
  protected readonly userGateway = Fixture.userGatewayMock()
  protected readonly domainEventDispatcher = Fixture.domainEventDispatcherMock()
  protected readonly domainEventService = Fixture.domainEventServiceMock()
  protected readonly unitOfWork = Fixture.unitOfWorkMock(this.domainEventService)
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
  withLoggedInUser(user = Fixture.userReadModelDTOMock()) {
    this.withUsers([user])
    return this
  }

  withoutLoggedInUser() {
    this.userGateway.getUserById = vi
      .fn()
      .mockResolvedValue(EntityLoadResult.failure(new UserLoadError({ userId: 'test-user-id', error: new Error('User not found') })))
    return this
  }

  withSkippedUser() {
    this.userGateway.getUserById = vi.fn().mockResolvedValue(EntityLoadResult.skipped())
    return this
  }

  withNonAdminUser(user = Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Viewer] })) {
    this.withUsers([user])
    return this
  }

  withAdminUser(admin = Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Admin] })) {
    this.withUsers([admin])
    return this
  }

  withCreatorUser(user = Fixture.userReadModelDTOMock({ roles: [UserRoleEnum.Creator] })) {
    this.withUsers([user])
    return this
  }

  withInactiveUser(user = Fixture.userReadModelDTOMock({ active: false })) {
    this.withUsers([user])
    return this
  }

  withNonAuthorUser(user = Fixture.userReadModelDTOMock({ id: Fixture.sampleNonAuthorUserId, roles: [UserRoleEnum.Creator] })) {
    this.withUsers([user])
    return this
  }

  withUsers(users: UserReadModelDTO[]) {
    this.mockFindById(
      users.reduce(
        (acc, user) => {
          acc[user.id] = user
          return acc
        },
        {} as Record<string, UserReadModelDTO | null>
      )
    )
    return this
  }

  withFailedUserLoad(userId: string) {
    this.userGateway.getUserById = vi
      .fn()
      .mockImplementation(async ({ userId: requestedId }: { userId: string }) =>
        requestedId === userId
          ? EntityLoadResult.failure(new UserLoadError({ userId, error: new Error('User not found') }))
          : EntityLoadResult.success(Fixture.userReadModelDTOMock({ id: requestedId }))
      )
    return this
  }

  protected mockFindById(usersById: Record<string, UserReadModelDTO | null>, defaultUser: UserReadModelDTO | null = null) {
    this.userGateway.getUserById = vi.fn().mockImplementation(async (params: { userId: string }) => {
      if (Object.prototype.hasOwnProperty.call(usersById, params.userId)) {
        return EntityLoadResult.success(usersById[params.userId])
      }
      return EntityLoadResult.skipped()
    })
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
    this.unitOfWork.execute = vi.fn().mockRejectedValue(error)
    return this
  }

  domainEventServiceWillReject(error = new Error('Domain event service failure')) {
    this.domainEventService.persistEvents = vi.fn().mockRejectedValue(error)
    return this
  }

  expectErrorOfType<E extends Error>(constructor: new (...arguments_: any[]) => E) {
    this.expectedErrorConstructor = constructor
    return this
  }

  // ───────────────────────────────────────────────────────────────────
  // THEN helpers
  // ───────────────────────────────────────────────────────────────────
  thenDomainEventsPersisted(expectedEvents: unknown[]) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()

    expect(this.domainEventService.persistEvents).toHaveBeenCalled()
    const persisted = eventsFromLastPersistEventsCall(this.domainEventService.persistEvents)
    for (const expected of expectedEvents) {
      expect(persisted).toEqual(expect.arrayContaining([expected]))
    }
    return this
  }

  thenDomainEventsNotPersisted(unexpectedEvents: unknown[]) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()

    if (this.domainEventService.persistEvents.mock.calls.length === 0) {
      return this
    }

    const persisted = eventsFromLastPersistEventsCall(this.domainEventService.persistEvents)
    for (const unexpected of unexpectedEvents) {
      expect(persisted).not.toEqual(expect.arrayContaining([unexpected]))
    }
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
