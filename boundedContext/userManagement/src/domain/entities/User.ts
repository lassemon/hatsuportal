import { Logger, omitNullAndUndefined, unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { Entity, EntityProps, IDomainEvent, IDomainEventHolder, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import { InvalidUserPropertyError } from '../errors/InvalidUserPropertyError'
import { UserId } from '../valueObjects/UserId'
import { UserName } from '../valueObjects/UserName'
import { UserRole } from '../valueObjects/UserRole'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { Email } from '../valueObjects/Email'
import { UserCreatedEvent, UserDeactivatedEvent, UserDeletedEvent, UserUpdatedEvent } from '../events/UserEvents'

const logger = new Logger('User')

export interface UserProps extends EntityProps {
  id: string
  name: string
  email: string
  active: boolean
  roles: UserRoleEnum[]
  createdAt: number
  updatedAt: number
}

interface CanCreateOptions {
  throwError?: boolean
}

export class User extends Entity<UserProps> implements IDomainEventHolder {
  static canCreate(props: any, { throwError = false }: CanCreateOptions = {}) {
    try {
      new User(props)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  static create(props: UserProps): User {
    const user = new User(props)
    user.addDomainEvent(new UserCreatedEvent(user))
    return user
  }

  static reconstruct(props: UserProps): User {
    return new User(props)
  }

  protected _id: UserId
  private _name: UserName
  private _email: Email
  private _active: boolean
  private _roles: UserRole[]

  private _domainEvents: IDomainEvent[] = []

  private constructor(props: UserProps) {
    super(props)
    this._id = new UserId(props.id)
    this._name = new UserName(props.name)
    this._email = new Email(props.email)

    if (!props.roles || props.roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = props.roles.map((role) => new UserRole(role))

    if ((props.active ?? null) === null || typeof props.active !== 'boolean')
      throw new InvalidUserPropertyError('Property "active" must be a boolean.')
    this._active = props.active

    this.addDomainEvent(new UserCreatedEvent(this))
  }

  get id(): UserId {
    return this._id
  }

  get name(): UserName {
    return this._name
  }

  get email(): Email {
    return this._email
  }

  get roles(): UserRole[] {
    return this._roles
  }

  get active(): boolean {
    return this._active
  }

  get createdAt(): UnixTimestamp {
    return this._createdAt
  }

  get updatedAt(): UnixTimestamp {
    return this._updatedAt
  }

  // TODO authorization is typically a cross-cutting concern that should be handled by a dedicated authorization service.
  isAdmin() {
    return this._roles.some((role) => ([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin] as UserRoleEnum[]).includes(role.value))
  }

  // TODO authorization is typically a cross-cutting concern that should be handled by a dedicated authorization service.
  isCreator() {
    return this._roles.some((role) =>
      ([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin, UserRoleEnum.Creator] as UserRoleEnum[]).includes(role.value)
    )
  }

  // TODO, is it smelly to have both getProps and ApplicationMapper.toDTO ?
  public getProps() {
    return {
      id: this._id.value,
      name: this._name.value,
      email: this._email.value,
      roles: this._roles.map((role) => role.value),
      active: this._active,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  // TODO, should this return a new User or the instance itself?
  /**
   * Use this update function to update any property of the user.
   * This allows encapsulating the domain events as well as the updated at timestamp in the update function.
   *
   * @param props - The properties to update.
   * @throws {InvalidUserPropertyError} If the user is not a valid user.
   */
  public update(props: Partial<UserProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (User.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (sanitizedProps.name) this._name = new UserName(sanitizedProps.name)
      if (sanitizedProps.email) this._email = new Email(sanitizedProps.email)

      if (!sanitizedProps.roles || sanitizedProps.roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
      this._roles = sanitizedProps.roles.map((role) => new UserRole(role))

      if ((sanitizedProps.active ?? null) === null || typeof sanitizedProps.active !== 'boolean')
        throw new InvalidUserPropertyError('Property "active" must be a boolean.')
      this._active = sanitizedProps.active

      this._updatedAt = new UnixTimestamp(unixtimeNow())

      this.addDomainEvent(new UserUpdatedEvent(this))
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

  public deactivate(): void {
    this.addDomainEvent(new UserDeactivatedEvent(this))
  }

  public override delete(): void {
    this.addDomainEvent(new UserDeletedEvent(this))
  }

  public get domainEvents(): IDomainEvent[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent): void {
    this._domainEvents.push(event)
  }
}
