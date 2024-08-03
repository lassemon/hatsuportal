import { InvalidUserPropertyError } from '../errors/InvalidUserPropertyError'
import { UserId } from '../valueObjects/UserId'
import { UserName } from '../valueObjects/UserName'
import { UserRole } from '../valueObjects/UserRole'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { Email } from '../valueObjects/Email'
import { UserCreatedEvent, UserDeactivatedEvent, UserDeletedEvent, UserUpdatedEvent } from '../events/UserEvents'
import { unixtimeNow } from '@hatsuportal/common'
import {
  DomainError,
  Entity,
  EntityFactoryResult,
  EntityProps,
  IDomainEvent,
  IDomainEventHolder,
  UnixTimestamp
} from '@hatsuportal/shared-kernel'

export interface UserProps extends EntityProps {
  name: UserName
  email: Email
  active: boolean
  roles: UserRole[]
}

export class User extends Entity implements IDomainEventHolder<UserId, UnixTimestamp> {
  static canCreate(props: any): boolean {
    try {
      User.assertCanCreate(props)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    if (typeof props.active !== 'boolean') throw new InvalidUserPropertyError('Property "active" must be a boolean.')
    if (!props.roles || props.roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    new User(
      props.id instanceof UserId ? props.id : new UserId(props.id),
      props.name instanceof UserName ? props.name : new UserName(props.name),
      props.email instanceof Email ? props.email : new Email(props.email),
      props.active,
      props.roles.map((role: any) => (role instanceof UserRole ? role : new UserRole(role))),
      props.createdAt instanceof UnixTimestamp ? props.createdAt : new UnixTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: UserProps): User {
    const user = new User(props.id, props.name, props.email, props.active, props.roles, props.createdAt, props.updatedAt)
    user.addDomainEvent(new UserCreatedEvent(user))
    return user
  }

  static tryCreate(props: UserProps): EntityFactoryResult<User, DomainError> {
    try {
      User.assertCanCreate(props)
      const user = User.create(props)
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
    return new User(props.id, props.name, props.email, props.active, props.roles, props.createdAt, props.updatedAt)
  }

  protected _id: UserId
  private _name: UserName
  private _email: Email
  private _active: boolean
  private _roles: UserRole[]

  private constructor(
    id: UserId,
    name: UserName,
    email: Email,
    active: boolean,
    roles: UserRole[],
    createdAt: UnixTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)
    this._id = id
    this._name = name
    this._email = email

    if (!roles || roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = roles

    this._active = active
  }

  public rename(name: UserName, emitEvents: boolean = true): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new UserUpdatedEvent(this))
  }

  get name(): UserName {
    return this._name
  }

  public changeEmail(email: Email, emitEvents: boolean = true): void {
    this._email = email
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new UserUpdatedEvent(this))
  }

  get email(): Email {
    return this._email
  }

  public changeRoles(roles: UserRole[], emitEvents: boolean = true): void {
    if (roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = roles
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new UserUpdatedEvent(this))
  }

  get roles(): UserRole[] {
    return this._roles
  }

  public activate(emitEvents: boolean = true): void {
    this._active = true
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new UserUpdatedEvent(this))
  }

  public deactivate(emitEvents: boolean = true): void {
    this._active = false
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new UserDeactivatedEvent(this))
  }

  get active(): boolean {
    return this._active
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this._id.value,
      name: this._name.value,
      email: this._email.value,
      roles: this._roles.map((role) => role.value),
      active: this._active,
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
      this.createdAt.equals(other.createdAt)
    )
  }

  private areRolesEqual(roles1: UserRole[], roles2: UserRole[]): boolean {
    if (roles1.length !== roles2.length) {
      return false
    }

    // We cab use Set because order or the roles is not significant
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
    return new User(this._id, this._name, this._email, this._active, this._roles, this.createdAt, this._updatedAt)
  }

  public override delete(): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(new UserDeletedEvent(this))
  }

  public get domainEvents(): IDomainEvent<UnixTimestamp>[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent<UnixTimestamp>): void {
    this._domainEvents.push(event)
  }
}
