import { expect, vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { ScenarioBase } from '../ScenarioBase'
import { UserCreatedEvent, UserUpdatedEvent, UserDeactivatedEvent, UserRole, IUserRepository } from '../../../domain'
import { UserApplicationMapper } from '../../../application'
import { StrictPasswordPolicy } from '../../../infrastructure/authentication/StrictPasswordPolicy'
import { PasswordFactory } from '../../../application/authentication/PasswordFactory'

export const UserDomainEvents = {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeactivatedEvent
}

/**
 * Generic base for all User-related scenario builders.
 *
 * This class follows the Given-When-Then pattern for behavior-driven development:
 * - Given: Setup the initial state using fluent methods like withLoggedInUser()
 * - When: Execute the use case under test with whenExecutedWithInput()
 * - Then: Assert the expected outcomes using methods like thenOutputBoundaryCalled()
 *
 * `INPUT`  – type of the use-case inbound DTO.
 * `CALLBACKS` – union of *string literal* names for every callback
 *               the concrete use-case exposes (e.g. "userUpdated").
 */
export abstract class UserScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, typeof UserDomainEvents> {
  protected readonly userMapper = new UserApplicationMapper()
  protected readonly passwordPolicy = new StrictPasswordPolicy()
  protected readonly passwordFactory = new PasswordFactory(this.passwordPolicy)

  constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, UserDomainEvents)
    this.userRepository.insert = vi.fn().mockImplementation((user) => user)
    this.userRepository.update = vi.fn().mockImplementation((user) => user)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withNonAdminUser(user = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] })) {
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withAdminUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    this.userRepository.findById = vi.fn().mockResolvedValue(admin)
    return this
  }

  repositoryWillReject(method: keyof IUserRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.userRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenRepositoryCalledTimes(method: keyof IUserRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.userRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
