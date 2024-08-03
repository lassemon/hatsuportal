import { UserName } from '../valueObjects/UserName'
import { Email } from '../valueObjects/Email'
import { UnixTimestamp } from '../valueObjects/UnixTimestamp'
import { InvalidRoleListError } from '../errors/InvalidRoleListError'
import { UserRole } from '../valueObjects/UserRole'
import { omitNullAndUndefined, unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { InvalidUserPropertyError } from '../errors/InvalidUserPropertyError'
import { UserId } from '../valueObjects/UserId'

export interface UserProps {
  id: string
  name: string
  email: string
  active: boolean
  roles: UserRoleEnum[]
  createdAt: number
  updatedAt: number | null
}

export class User {
  static canCreate(props: any) {
    try {
      new User(props)
      return true
    } catch {
      return false
    }
  }

  private _id: UserId
  private _name: UserName
  private _email: Email
  private _active: boolean
  private _roles: UserRole[]

  private _createdAt: UnixTimestamp
  private _updatedAt: UnixTimestamp | null

  constructor(props: UserProps) {
    this._id = new UserId(props.id)
    this._name = new UserName(props.name)
    this._email = new Email(props.email)

    if (!props.roles || props.roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = props.roles.map((role) => new UserRole(role))

    if ((props.active ?? null) === null || typeof props.active !== 'boolean')
      throw new InvalidUserPropertyError('Property "active" must be a boolean.')
    this._active = props.active

    this._createdAt = new UnixTimestamp(props.createdAt)
    this._updatedAt = props.updatedAt ? new UnixTimestamp(props.updatedAt) : null
  }

  get id(): UserId {
    return this._id
  }

  get name(): UserName {
    return this._name
  }

  set name(name: string) {
    this._name = new UserName(name)
  }

  get email(): Email {
    return this._email
  }

  set email(email: string) {
    this._email = new Email(email)
  }

  get roles(): UserRole[] {
    return this._roles
  }

  get active(): boolean {
    return this._active
  }

  set active(active: boolean) {
    if ((active ?? null) === null || typeof active !== 'boolean') throw new InvalidUserPropertyError('Property "active" must be a boolean.')
    this._active = active
  }

  set roles(roles: UserRoleEnum[]) {
    if (!roles || roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
    this._roles = roles.map((role) => new UserRole(role))
  }

  get createdAt(): UnixTimestamp {
    return this._createdAt
  }

  get updatedAt(): UnixTimestamp | null {
    return this._updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    this._updatedAt = updatedAt ? new UnixTimestamp(updatedAt) : null
  }

  isAdmin() {
    return this._roles.some((role) => ([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin] as UserRoleEnum[]).includes(role.value))
  }

  isCreator() {
    return this._roles.some((role) =>
      ([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin, UserRoleEnum.Creator] as UserRoleEnum[]).includes(role.value)
    )
  }

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
  public update(props: Partial<UserProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (User.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (sanitizedProps.name) this.name = sanitizedProps.name
      if (sanitizedProps.email) this.email = sanitizedProps.email

      if (!sanitizedProps.roles || sanitizedProps.roles.length <= 0) throw new InvalidRoleListError('User must have at least one role.')
      this.roles = sanitizedProps.roles

      if ((sanitizedProps.active ?? null) === null || typeof sanitizedProps.active !== 'boolean')
        throw new InvalidUserPropertyError('Property "active" must be a boolean.')
      this.active = sanitizedProps.active

      this.updatedAt = unixtimeNow()
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

    // use Set because order or the roles is not significant
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
}
