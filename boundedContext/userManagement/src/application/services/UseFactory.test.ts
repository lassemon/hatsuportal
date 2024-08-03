import { describe, it, expect } from 'vitest'
import { UserFactory } from './UserFactory'
import { UserRoleEnum, unixtimeNow } from '@hatsuportal/common'
import { InvalidUserNameError, InvalidUserIdError, InvalidEmailError, InvalidRoleListError } from '../../domain'
import { DomainError } from '@hatsuportal/common-bounded-context'

describe('UserFactory', () => {
  const factory = new UserFactory()
  const validUserId = 'user-123-empty-roles-asdlkjgdsd-aspalkjgdsad'

  it('creates a user with valid properties', () => {
    const props = {
      id: validUserId,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: [UserRoleEnum.Viewer],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
    }
    const result = factory.createUser(props)
    expect(result.isSuccess()).toBe(true)
    expect(result.value).toBeDefined()
    expect(result.value?.id.value).toBe(props.id)
    expect(result.value?.name.value).toBe(props.name)
    expect(result.value?.email.value).toBe(props.email)
    expect(result.value?.roles.map((r) => r.value)).toStrictEqual(props.roles)
    expect(result.value?.active).toBe(props.active)
    expect(result.value?.createdAt.value).toBe(props.createdAt)
    expect(result.value?.updatedAt.value).toBe(props.updatedAt)
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
    const props = {
      id: validUserId,
      name: 'John Doe',
      email: 'john@example.com',
      active: true,
      roles: [],
      createdAt: unixtimeNow(),
      updatedAt: unixtimeNow()
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
