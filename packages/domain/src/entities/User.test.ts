import { describe, expect, it } from 'vitest'
import { User } from './User'
import { UserRole } from '../enums/UserRole'

describe('User', () => {
  it('can create user with all properties', ({ unitFixture }) => {
    const user = new User(unitFixture.user())
    expect(user.id).toBe(unitFixture.serializedUser().id)
    expect(user.name).toBe(unitFixture.serializedUser().name)
    expect(user.email).toBe(unitFixture.serializedUser().email)
    expect(user.roles).toStrictEqual(unitFixture.serializedUser().roles)
    expect(user.active).toBe(unitFixture.serializedUser().active)
    expect(user.createdAt).toBe(unitFixture.serializedUser().createdAt)
    expect(user.updatedAt).toBe(unitFixture.serializedUser().updatedAt)
  })

  it('fails to create a user without an id', ({ unitFixture }) => {
    const { id, ...userWithoutId } = unitFixture.user()
    expect(() => {
      new User(userWithoutId as any)
    }).toThrow('User must have an id.')
  })

  it('fails to create a user without a name', ({ unitFixture }) => {
    const { name, ...userWithoutName } = unitFixture.user()
    expect(() => {
      new User(userWithoutName as any)
    }).toThrow('User must have a name.')
  })

  it('fails to create a user without an email.', ({ unitFixture }) => {
    const { email, ...userWithoutEmail } = unitFixture.user()
    expect(() => {
      new User(userWithoutEmail as any)
    }).toThrow('User must have an email.')
  })

  it('fails to create a user without roles', ({ unitFixture }) => {
    const { roles, ...userWithoutRoles } = unitFixture.user()
    expect(() => {
      new User(userWithoutRoles as any)
    }).toThrow('User must have at least one role.')
    expect(() => {
      new User({ ...userWithoutRoles, roles: [] })
    }).toThrow('User must have at least one role.')
  })

  it('fails to create a user without a creation time', ({ unitFixture }) => {
    const { createdAt, ...userWithoutCreationTime } = unitFixture.user()
    expect(() => {
      new User(userWithoutCreationTime as any)
    }).toThrow('User must have a createdAt timestamp.')
  })

  it('fails to create user with extra props', ({ unitFixture }) => {
    expect(() => {
      new User({ ...unitFixture.user(), extraProp: 'foobar' } as any)
    }).toThrow('Props contain extra keys: extraProp.')
  })

  it('can compare users', ({ unitFixture }) => {
    const user = new User(unitFixture.user())
    const otherUser = new User({
      ...unitFixture.user(),
      id: 'testId2',
      roles: [UserRole.Moderator]
    })
    expect(user.isEqual(user)).toBe(true)
    expect(user.isEqual(otherUser)).toBe(false)
  })

  it('can clone user', ({ unitFixture }) => {
    const original = new User(unitFixture.user())
    const clone = original.clone({ name: 'some other user name' })
    expect(original.name).toBe(unitFixture.user().name)
    expect(clone.name).toBe('some other user name')

    const { name: origName, ...serializedOriginalWithoutName } = original.serialize()
    const { name: cloneName, ...serializedCloneWithoutName } = clone.serialize()

    expect(JSON.stringify(serializedOriginalWithoutName)).toBe(JSON.stringify(serializedCloneWithoutName))
  })

  it('can serialize user', ({ unitFixture }) => {
    const user = new User(unitFixture.user())
    expect(typeof user.serialize()).toBe('object')
    expect(user.serialize()).toStrictEqual(unitFixture.serializedUser())
  })

  it('can stringify user', ({ unitFixture }) => {
    const user = new User(unitFixture.user())
    expect(typeof user.toString()).toBe('string')
    // we need to use JSON.parse and toStringEqual here instead of
    // JSON.stringify === JSON.stringify comparison because serializing the entity
    // (which the toString method calls) changes the order of the
    // properties from the original JSON
    expect(JSON.parse(user.toString())).toStrictEqual(unitFixture.serializedUser())
  })

  it('can create user from a database record', ({ unitFixture }) => {
    const fixtureUser = unitFixture.user()
    const user = User.fromRecord({
      ...fixtureUser,
      roles: JSON.stringify(unitFixture.serializedUser().roles),
      active: fixtureUser.active === true ? 1 : 0
    })

    expect(user.active).toBeTypeOf('boolean')
    expect(user.serialize()).toStrictEqual(unitFixture.serializedUser())
  })

  it('can check if user is admin', ({ unitFixture }) => {
    const adminUser = new User({ ...unitFixture.user(), roles: [UserRole.Admin] })
    const nonAdminUser = new User({ ...unitFixture.user(), roles: [UserRole.Creator] })

    expect(adminUser.isAdmin()).toBe(true)
    expect(nonAdminUser.isAdmin()).toBe(false)
  })
})
