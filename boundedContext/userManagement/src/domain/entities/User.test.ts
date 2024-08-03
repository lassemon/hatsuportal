import { describe, expect, it } from 'vitest'
import _ from 'lodash'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { UserRoleEnum } from '@hatsuportal/common'
import { CreatedAtTimestamp, DomainError, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { UserId } from '../valueObjects/UserId'
import { UserRole } from '../valueObjects/UserRole'
import { User, UserProps } from './User'
import { UserName } from '../valueObjects/UserName'
import { Email } from '../valueObjects/Email'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { UserDeactivatedEvent, UserDeletedEvent, UserUpdatedEvent } from '../events/UserEvents'

const sampleAdminId = 'test1b19-admin-4792-a2f0-f95ccab82d92'

describe('User', () => {
  it('can create user with all properties', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    expect(user.id.value).toBe(unitFixture.userDTOMock().id)
    expect(user.name.value).toBe(unitFixture.userDTOMock().name)
    expect(user.email.value).toBe(unitFixture.userDTOMock().email)
    expect(user.roles.map((role) => role.value)).toStrictEqual(unitFixture.userDTOMock().roles)
    expect(user.active).toBe(unitFixture.userDTOMock().active)
    expect(user.createdAt.value).toBe(unitFixture.userDTOMock().createdAt)
    expect(user.updatedAt?.value).toBe(unitFixture.userDTOMock().updatedAt)
  })

  it('can compare users', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const otherUser = unitFixture.userMock({
      id: new UserId(uuid()),
      roles: [new UserRole(UserRoleEnum.Moderator)]
    })
    expect(user.equals(user)).toBe(true)
    expect(user.equals(otherUser)).toBe(false)
  })

  it('rename updates name and emits UserUpdatedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const newName = new UserName('New Name')
    user.clearEvents()

    user.rename(newName, new UserId(sampleAdminId))

    expect(user.name.value).toBe('New Name')
    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserUpdatedEvent)
    expect(user.domainEvents[0].data.name).toBe('New Name')
  })

  it('changeEmail updates email and emits UserUpdatedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const newEmail = new Email('new@example.com')
    user.clearEvents()

    user.changeEmail(newEmail, new UserId(sampleAdminId))

    expect(user.email.value).toBe('new@example.com')
    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserUpdatedEvent)
    expect(user.domainEvents[0].data.email).toBe('new@example.com')
  })

  it('changeRoles updates roles and emits UserUpdatedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    const newRoles = [new UserRole(UserRoleEnum.Moderator), new UserRole(UserRoleEnum.Admin)]
    user.clearEvents()

    user.changeRoles(newRoles, new UserId(sampleAdminId))

    expect(user.roles.map((r) => r.value)).toStrictEqual([UserRoleEnum.Moderator, UserRoleEnum.Admin])
    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserUpdatedEvent)
  })

  it('changeRoles throws InvalidRoleListError when roles array is empty', ({ unitFixture }) => {
    const user = unitFixture.userMock()

    expect(() => user.changeRoles([], new UserId(sampleAdminId))).toThrow(InvalidRoleListError)
    expect(user.roles).not.toStrictEqual([])
  })

  it('activate sets active to true and emits UserUpdatedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock({ active: false })
    user.clearEvents()

    user.activate(new UserId(sampleAdminId))

    expect(user.active).toBe(true)
    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserUpdatedEvent)
  })

  it('deactivate sets active to false and emits UserDeactivatedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock({ active: true })
    user.clearEvents()

    user.deactivate(new UserId(sampleAdminId))

    expect(user.active).toBe(false)
    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserDeactivatedEvent)
  })

  it('delete emits UserDeletedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    user.clearEvents()

    user.delete(new UserId(sampleAdminId))

    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserDeletedEvent)
  })
})

describe('User.tryCreate', () => {
  const validUserId = 'user-123-empty-roles-asdlkjgdsd-aspalkjgdsad'

  it('creates a user with valid properties', () => {
    const props: UserProps = {
      id: new UserId(validUserId),
      name: new UserName('John Doe'),
      email: new Email('john@example.com'),
      active: true,
      roles: [new UserRole(UserRoleEnum.Viewer)],
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    }
    User.assertCanCreate(props)
    const result = User.tryCreate(props, validUserId)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toBeDefined()
    expect(result.value?.id.value).toBe(props.id.value)
    expect(result.value?.name.value).toBe(props.name.value)
    expect(result.value?.email.value).toBe(props.email.value)
    expect(result.value?.roles.map((r) => r.value)).toStrictEqual(props.roles.map((r) => r.value))
    expect(result.value?.active).toBe(props.active)
    expect(result.value?.createdAt.value).toBe(props.createdAt.value)
    expect(result.value?.updatedAt.value).toBe(props.updatedAt.value)
  })

  it('returns error if id is missing', () => {
    const props = {
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = User.tryCreate(props, validUserId)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserIdError)
  })

  it('returns error if name is missing', () => {
    const props = {
      id: validUserId,
      email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = User.tryCreate(props, validUserId)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserNameError)
  })

  it('returns error if email is missing', () => {
    const props = {
      id: validUserId,
      name: 'John Doe',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = User.tryCreate(props, validUserId)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidEmailError)
  })

  it('returns error if roles are missing', () => {
    const props = {
      id: validUserId,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = User.tryCreate(props, validUserId)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidRoleListError)
  })

  it('returns error if roles is empty array', () => {
    const props: UserProps = {
      id: new UserId(validUserId),
      name: new UserName('John Doe'),
      email: new Email('john@example.com'),
      active: true,
      roles: [],
      createdAt: new CreatedAtTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    }
    const result = User.tryCreate(props, validUserId)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidRoleListError)
  })

  it('returns error if createdAt is missing', () => {
    const props = {
      id: validUserId,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      updatedAt: unixtimeNow()
    } as any
    const result = User.tryCreate(props, validUserId)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })
})
