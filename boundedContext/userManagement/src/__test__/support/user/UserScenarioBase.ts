import { expect, vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { UserRoleEnum } from '@hatsuportal/common'
import { ScenarioBase } from '../ScenarioBase'
import {
  UserCreatedEvent,
  UserUpdatedEvent,
  UserDeactivatedEvent,
  UserRole,
  IUserWriteRepository,
  User,
  UserId
} from '../../../domain'
import { UserApplicationMapper } from '../../../application'
import { IUserLookupService } from '../../../application/services/UserLookupService'
import { IUserReadRepository } from '../../../application/read/IUserReadRepository'
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
  protected readonly userApplicationMapper = new UserApplicationMapper()
  protected readonly passwordPolicy = new StrictPasswordPolicy()
  protected readonly passwordFactory = new PasswordFactory(this.passwordPolicy)

  constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, UserDomainEvents)
    this.userWriteRepository.insert = vi.fn().mockImplementation((user) => user)
    this.userWriteRepository.update = vi.fn().mockImplementation((user) => user)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withNonAdminUser(user = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Viewer)] })) {
    this.withUsers([user])
    return this
  }

  withAdminUser(admin = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    this.withUsers([admin])
    return this
  }

  withUsers(users: User[]) {
    this.mockFindById(
      users.reduce(
        (acc, user) => {
          acc[user.id.value] = user
          return acc
        },
        {} as Record<string, User>
      )
    )
    return this
  }

  protected mockFindById(usersById: Record<string, User | null>, defaultUser: User | null = null) {
    this.userWriteRepository.findById = vi.fn().mockImplementation(async (id: UserId) => {
      if (Object.prototype.hasOwnProperty.call(usersById, id.value)) {
        return usersById[id.value]
      }
      return defaultUser
    })
    this.userWriteRepository.findByIdForUpdate = vi.fn().mockImplementation(async (id: UserId) => {
      if (Object.prototype.hasOwnProperty.call(usersById, id.value)) {
        return usersById[id.value]
      }
      return defaultUser
    })
    this.userWriteRepository.update = vi.fn().mockImplementation(async (user: User) => {
      if (Object.prototype.hasOwnProperty.call(usersById, user.id.value)) {
        return usersById[user.id.value]
      }
      return defaultUser
    })
    this.userReadRepository.findById = vi.fn().mockImplementation(async (id: UserId) => {
      if (Object.prototype.hasOwnProperty.call(usersById, id.value)) {
        const user = usersById[id.value]
        return user ? Fixture.userReadModelFromUser(user) : null
      }
      return defaultUser ? Fixture.userReadModelFromUser(defaultUser) : null
    })
    return this
  }

  withoutTargetUser(targetUserId: string, otherwise: User | null = Fixture.userMock({ roles: [new UserRole(UserRoleEnum.Admin)] })) {
    return this.mockFindById({ [targetUserId]: null }, otherwise)
  }

  repositoryWillReject(method: keyof IUserWriteRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.userWriteRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  readRepositoryWillReject(method: keyof IUserReadRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.userReadRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenRepositoryCalledTimes(method: keyof IUserWriteRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.userWriteRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }

  thenLookupServiceCalledTimes(method: keyof IUserLookupService, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.userLookupService[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
