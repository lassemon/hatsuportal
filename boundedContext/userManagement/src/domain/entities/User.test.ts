import { describe, expect, it } from 'vitest'
import _ from 'lodash'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { UserRoleEnum } from '@hatsuportal/common'
import { DomainError, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { UserId } from '../valueObjects/UserId'
import { UserRole } from '../valueObjects/UserRole'
import { User, UserProps } from './User'
import { UserName } from '../valueObjects/UserName'
import { Email } from '../valueObjects/Email'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { InvalidUserNameError } from '../errors/InvalidUserNameError'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'

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

  // TODO add tests for domain methods like rename etc.
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
      createdAt: new UnixTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    }
    const result = User.tryCreate(props)
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
    const result = User.tryCreate(props)
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
    const result = User.tryCreate(props)
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
    const result = User.tryCreate(props)
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
    const result = User.tryCreate(props)
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
      createdAt: new UnixTimestamp(unixtimeNow()),
      updatedAt: new UnixTimestamp(unixtimeNow())
    }
    const result = User.tryCreate(props)
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
    const result = User.tryCreate(props)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })
})
