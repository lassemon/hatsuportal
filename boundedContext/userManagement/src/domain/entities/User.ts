import { InvalidUserActivePropertyError } from '../errors/InvalidUserActivePropertyError'
import { InactiveUserCannotChangePreferencesError } from '../errors/InactiveUserCannotChangePreferencesError'
import { UserId } from '../valueObjects/UserId'
import { UserName } from '../valueObjects/UserName'
import { UserRole } from '../valueObjects/UserRole'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { Email } from '../valueObjects/Email'
import { UserCreatedEvent, UserDeactivatedEvent, UserDeletedEvent, UserUpdatedEvent } from '../events/UserEvents'
import { EntityFactoryResult, unixtimeNow } from '@hatsuportal/common'
import {
  CreatedAtTimestamp,
  DomainError,
  DomainEvent,
  Entity,
  EntityProps,
  IDomainEventHolder,
  UniqueId,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'
import { UserProfile } from '../valueObjects/UserProfile'
import { UserPreferences } from '../valueObjects/UserPreferences'
import { ProfileImageId } from '../valueObjects/ProfileImageId'
import { StatusMessage } from '../valueObjects/StatusMessage'
import { ThemeId } from '../valueObjects/ThemeId'
import { ColorScheme } from '../valueObjects/ColorScheme'
import { NotificationSettings } from '../valueObjects/NotificationSettings'
import { Bio } from '../valueObjects/Bio'

export interface UserProps extends EntityProps {
  name: UserName
  email: Email
  active: boolean
  roles: UserRole[]
  profile: UserProfile
  preferences: UserPreferences
}

export class User extends Entity implements IDomainEventHolder {
  static canCreate(props: unknown): boolean {
    try {
      User.assertCanCreate(props)
      return true
    } catch {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    if (typeof props.active !== 'boolean') throw new InvalidUserActivePropertyError('Property "active" must be a boolean.')
    if (!props.roles || props.roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    new User(
      props.id instanceof UserId ? props.id : new UserId(props.id),
      props.name instanceof UserName ? props.name : new UserName(props.name),
      props.email instanceof Email ? props.email : new Email(props.email),
      props.active,
      props.roles.map((role: any) => (role instanceof UserRole ? role : new UserRole(role))),
      props.profile,
      props.preferences,
      props.createdAt instanceof CreatedAtTimestamp ? props.createdAt : new CreatedAtTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: UserProps, createdById: string): User {
    const user = new User(
      props.id,
      props.name,
      props.email,
      props.active,
      props.roles,
      props.profile,
      props.preferences,
      props.createdAt,
      props.updatedAt
    )
    user.addDomainEvent(
      new UserCreatedEvent({
        id: user.id.value,
        name: user.name.value,
        email: user.email.value,
        createdAt: user.createdAt.value,
        createdById: createdById
      })
    )
    return user
  }

  static tryCreate(props: UserProps, createdById: string): EntityFactoryResult<User, DomainError> {
    try {
      User.assertCanCreate(props)
      const user = User.create(props, createdById)
      return EntityFactoryResult.ok(user)
    } catch (error) {
      if (error instanceof DomainError) {
        return EntityFactoryResult.fail(error)
      }
      return EntityFactoryResult.fail(
        new DomainError({
          message: 'Unknown error occurred while creating user',
          cause: error
        })
      )
    }
  }

  static reconstruct(props: UserProps): User {
    return new User(
      props.id,
      props.name,
      props.email,
      props.active,
      props.roles,
      props.profile,
      props.preferences,
      props.createdAt,
      props.updatedAt
    )
  }

  protected _id: UserId
  private _name: UserName
  private _email: Email
  private _active: boolean
  private _roles: UserRole[]
  private _profile: UserProfile
  private _preferences: UserPreferences

  private constructor(
    id: UserId,
    name: UserName,
    email: Email,
    active: boolean,
    roles: UserRole[],
    profile: UserProfile,
    preferences: UserPreferences,
    createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)
    this._id = id
    this._name = name
    this._email = email

    if (!roles || roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = roles

    this._active = active
    this._profile = profile
    this._preferences = preferences
  }

  get profile(): UserProfile {
    return this._profile
  }

  get preferences(): UserPreferences {
    return this._preferences
  }

  public rename(name: UserName, updatedById: UniqueId): void {
    this._name = name
    this.touch(updatedById)
  }

  get name(): UserName {
    return this._name
  }

  public changeEmail(email: Email, updatedById: UniqueId): void {
    this._email = email
    this.touch(updatedById)
  }

  get email(): Email {
    return this._email
  }

  public changeRoles(roles: UserRole[], updatedById: UniqueId): void {
    if (roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = roles
    this.touch(updatedById)
  }

  get roles(): UserRole[] {
    return this._roles
  }

  public activate(activatedById: UniqueId): void {
    if (this._active) return

    this._active = true
    this.touch(activatedById)
  }

  public deactivate(deactivatedById: UniqueId): void {
    if (!this._active) return

    this._active = false
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new UserDeactivatedEvent({
        id: this.id.value,
        deactivatedAt: this.updatedAt.value,
        deactivatedById: deactivatedById.value
      })
    )
  }

  get active(): boolean {
    return this._active
  }

  public updateBio(bio: Bio, updatedById: UniqueId): void {
    this._profile = this._profile.withBio(bio)
    this.touch(updatedById)
  }

  public updateStatusMessage(statusMessage: StatusMessage, updatedById: UniqueId): void {
    this._profile = this._profile.withStatusMessage(statusMessage)
    this.touch(updatedById)
  }

  public setProfileImage(profileImageId: ProfileImageId, updatedById: UniqueId): void {
    this._profile = this._profile.withProfileImage(profileImageId)
    this.touch(updatedById)
  }

  public selectTheme(themeId: ThemeId, updatedById: UniqueId): void {
    this.assertCanChangePreferences()
    this._preferences = this._preferences.withSelectedTheme(themeId)
    this.touch(updatedById)
  }

  public updateColorScheme(colorScheme: ColorScheme, updatedById: UniqueId): void {
    this.assertCanChangePreferences()
    this._preferences = this._preferences.withColorScheme(colorScheme)
    this.touch(updatedById)
  }

  public updateNotificationSettings(notificationSettings: NotificationSettings, updatedById: UniqueId): void {
    this.assertCanChangePreferences()
    this._preferences = this._preferences.withNotificationSettings(notificationSettings)
    this.touch(updatedById)
  }

  private assertCanChangePreferences(): void {
    if (!this._active) {
      throw new InactiveUserCannotChangePreferencesError()
    }
  }

  private touch(updatedById: UniqueId): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new UserUpdatedEvent({
        id: this.id.value,
        name: this.name.value,
        email: this.email.value,
        updatedAt: this.updatedAt.value,
        updatedById: updatedById.value
      })
    )
  }

  public serialize(): Record<string, unknown> {
    return {
      id: this._id.value,
      name: this._name.value,
      email: this._email.value,
      roles: this._roles.map((role) => role.value),
      active: this._active,
      profile: this._profile.serialize(),
      preferences: this._preferences.serialize(),
      createdAt: this.createdAt.value,
      updatedAt: this._updatedAt.value
    }
  }

  equals(other: unknown): boolean {
    return (
      other instanceof User &&
      this.id.equals(other.id) &&
      this.name.equals(other.name) &&
      this.email.equals(other.email) &&
      this.areRolesEqual(this.roles, other.roles) &&
      this.active === other.active &&
      this.createdAt.equals(other.createdAt) &&
      this._profile.equals(other._profile) &&
      this._preferences.equals(other._preferences)
    )
  }

  private areRolesEqual(roles1: UserRole[], roles2: UserRole[]): boolean {
    if (roles1.length !== roles2.length) {
      return false
    }

    const roleSet1 = new Set(roles1.map((role) => role.value))
    const roleSet2 = new Set(roles2.map((role) => role.value))

    if (roleSet1.size !== roleSet2.size) {
      return false
    }

    for (const role of roleSet1) {
      if (!roleSet2.has(role)) {
        return false
      }
    }

    return true
  }

  public clone(): User {
    return new User(
      this._id,
      this._name,
      this._email,
      this._active,
      this._roles,
      this._profile.clone(),
      this._preferences.clone(),
      this.createdAt,
      this._updatedAt
    )
  }

  public delete(deletedById: UserId): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new UserDeletedEvent({
        id: this.id.value,
        deletedAt: this.updatedAt.value,
        deletedById: deletedById.value
      })
    )
  }

  public get domainEvents(): DomainEvent[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }
}
