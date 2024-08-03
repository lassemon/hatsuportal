import { describe, it, expect } from 'vitest'
import { UserFactory } from './UserFactory'
import {
  InvalidUserNameError,
  InvalidUserIdError,
  InvalidEmailError,
  InvalidRoleListError,
  UserProps,
  UserName,
  UserRole
} from '../../domain'
import { DomainError, unixtimeNow, UserRoleEnum } from '@hatsuportal/foundation'
import { UserId } from '../../domain/valueObjects/UserId'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Email } from '../../domain/valueObjects/Email'

describe('UserFactory', () => {
  const factory = new UserFactory()
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
    const result = factory.createUser(props)
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
      // id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = factory.createUser(props)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserIdError)
  })

  it('returns error if name is missing', () => {
    const props = {
      id: validUserId,
      // name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = factory.createUser(props)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidUserNameError)
  })

  it('returns error if email is missing', () => {
    const props = {
      id: validUserId,
      name: 'John Doe',
      // email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = factory.createUser(props)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(InvalidEmailError)
  })

  it('returns error if roles are missing', () => {
    const props = {
      id: validUserId,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      // roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = factory.createUser(props)
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
    const result = factory.createUser(props)
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
      // createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    } as any
    const result = factory.createUser(props)
    expect(result.isFailure()).toBe(true)
    expect(result.error).toBeInstanceOf(DomainError)
  })
})
