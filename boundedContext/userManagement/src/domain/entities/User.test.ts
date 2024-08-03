import { describe, expect, it } from 'vitest'
import { uuid, unixtimeNow } from '@hatsuportal/common'
import { UserRoleEnum } from '@hatsuportal/common'
import { CreatedAtTimestamp, DomainError, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { UserId } from '../valueObjects/UserId'
import { UserRole } from '../valueObjects/UserRole'
import { User, UserProps } from './User'
import { UserName } from '../valueObjects/UserName'
import { Email } from '../valueObjects/Email'
import { InvalidUserIdError } from '../errors/InvalidUserIdError'
import { UserNameEmptyError } from '../errors/UserNameEmptyError'
import { InvalidEmailError } from '../errors/InvalidEmailError'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { UserDeactivatedEvent, UserDeletedEvent, UserUpdatedEvent } from '../events/UserEvents'
import { UserPreferences } from '../valueObjects/UserPreferences'
import { UserProfile } from '../valueObjects/UserProfile'
import { ProfileImageId } from '../valueObjects/ProfileImageId'
import { ColorScheme } from '../valueObjects/ColorScheme'
import { NotificationSettings } from '../valueObjects/NotificationSettings'
import { DefaultThemeId, StatusMessage } from '../..'
import { Bio } from '../valueObjects/Bio'

const sampleAdminId = 'test1b19-admin-4792-a2f0-f95ccab82d92'

describe('User', () => {
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

  it('second activate on already-active user is a no-op', ({ unitFixture }) => {
    const user = unitFixture.userMock({ active: true })
    const updatedAtBefore = user.updatedAt.value
    user.clearEvents()

    user.activate(new UserId(sampleAdminId))

    expect(user.active).toBe(true)
    expect(user.updatedAt.value).toBe(updatedAtBefore)
    expect(user.domainEvents).toHaveLength(0)
  })

  it('second deactivate on already-inactive user is a no-op', ({ unitFixture }) => {
    const user = unitFixture.userMock({ active: false })
    const updatedAtBefore = user.updatedAt.value
    user.clearEvents()

    user.deactivate(new UserId(sampleAdminId))

    expect(user.active).toBe(false)
    expect(user.updatedAt.value).toBe(updatedAtBefore)
    expect(user.domainEvents).toHaveLength(0)
  })

  it('delete emits UserDeletedEvent', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    user.clearEvents()

    user.delete(new UserId(sampleAdminId))

    expect(user.domainEvents).toHaveLength(1)
    expect(user.domainEvents[0]).toBeInstanceOf(UserDeletedEvent)
  })

  it('materializes default profile and preferences on reconstruct', ({ unitFixture }) => {
    const user = unitFixture.userMock()

    expect(user.profile.bio.value).toBe('')
    expect(user.profile.statusMessage.value).toBe('')
    expect(user.profile.profileImageId.value).toBeTruthy()
    expect(user.preferences.colorScheme.value).toBe('light')
    expect(user.preferences.selectedThemeId.value).toBe('00000000-0000-0000-0000-000000000001')
  })

  it('clone copies profile and preferences value objects', ({ unitFixture }) => {
    const user = unitFixture.userMock()
    user.updateBio(new Bio('Hello'), user.id)
    const cloned = user.clone()

    expect(cloned.profile.bio.value).toBe('Hello')
    expect(cloned.preferences.selectedThemeId.value).toBe(user.preferences.selectedThemeId.value)
    expect(cloned).not.toBe(user)
  })

  it('throws when inactive user changes preferences', ({ unitFixture }) => {
    const user = unitFixture.userMock({ active: false })

    expect(() => user.selectTheme(user.preferences.selectedThemeId, user.id)).toThrow()
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
      profile: UserProfile.reconstruct({
        bio: new Bio(''),
        statusMessage: new StatusMessage(''),
        profileImageId: ProfileImageId.NOT_SET
      }),
      preferences: UserPreferences.reconstruct({
        colorScheme: ColorScheme.default(),
        selectedThemeId: new DefaultThemeId(),
        notificationSettings: NotificationSettings.reconstruct({
          emailNotifications: true,
          pushNotifications: true
        })
      }),
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
    expect(result.error).toBeInstanceOf(UserNameEmptyError)
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
      profile: UserProfile.reconstruct({
        bio: new Bio(''),
        statusMessage: new StatusMessage(''),
        profileImageId: ProfileImageId.NOT_SET
      }),
      preferences: UserPreferences.reconstruct({
        colorScheme: ColorScheme.default(),
        selectedThemeId: new DefaultThemeId(),
        notificationSettings: NotificationSettings.reconstruct({
          emailNotifications: true,
          pushNotifications: true
        })
      }),
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
