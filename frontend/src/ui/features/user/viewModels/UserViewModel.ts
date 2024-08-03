import { isNonStringOrEmpty, isNumber, isString } from '@hatsuportal/common'
import { UserRoleEnum } from '@hatsuportal/common'
import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'

export interface UserViewModelDTO {
  id: string
  name: string
  email: string
  roles: UserRoleEnum[]
  createdAt: number
  updatedAt: number | null
}

export class UserViewModel {
  private _id: string
  private _name: string
  private _email: string
  private _roles: UserRoleEnum[]

  private _createdAt: number
  private _updatedAt: number | null

  static isAdmin(user?: UserViewModelDTO) {
    return user?.roles.some((role) => ([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin] as UserRoleEnum[]).includes(role))
  }

  constructor(props: UserViewModelDTO) {
    if (isNonStringOrEmpty(props.id)) {
      throw new InvalidViewModelPropertyError(`Property "id" must be a string, was '${props.id}'`)
    }
    this._id = props.id
    if (!isString(props.name)) {
      throw new InvalidViewModelPropertyError(`Property "name" must be a string, was '${props.name}'`)
    }
    this._name = props.name
    if (!isString(props.email)) {
      throw new InvalidViewModelPropertyError(`Property "email" must be a string, was '${props.email}'`)
    }
    this._email = props.email

    if (!props.roles || props.roles.length <= 0) throw new InvalidViewModelPropertyError('User must have at least one role.')
    this._roles = props.roles

    this._createdAt = props.createdAt
    this._updatedAt = props.updatedAt ? props.updatedAt : null
  }

  get id(): string {
    return this._id
  }

  get name(): string {
    return this._name
  }

  set name(name: string) {
    if (!isString(name)) {
      throw new InvalidViewModelPropertyError(`Property "name" must be a string, was '${name}'`)
    }
    this._name = name
  }

  get email(): string {
    return this._email
  }

  set email(email: string) {
    if (!isString(email)) {
      throw new InvalidViewModelPropertyError(`Property "email" must be a string, was '${email}'`)
    }
    this._email = email
  }

  get roles(): UserRoleEnum[] {
    return this._roles
  }

  set roles(roles: UserRoleEnum[]) {
    if (!roles || roles.length <= 0) throw new InvalidViewModelPropertyError('User must have at least one role.')
    this._roles = roles
  }

  get createdAt(): number {
    return this._createdAt
  }

  get updatedAt(): number | null {
    return this._updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    if (!isNumber(updatedAt) && updatedAt !== null) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number or null, was '${updatedAt}'`)
    }
    this._updatedAt = updatedAt ? updatedAt : null // set to null if 0
  }

  isAdmin() {
    return this._roles.some((role) => ([UserRoleEnum.SuperAdmin, UserRoleEnum.Admin] as UserRoleEnum[]).includes(role))
  }

  public toJSON(): UserViewModelDTO {
    return {
      id: this._id,
      name: this._name,
      email: this._email,
      roles: this._roles,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt ?? null
    }
  }

  public clone(props?: Partial<UserViewModelDTO>): UserViewModel {
    if (props) {
      return new UserViewModel({ ...this.toJSON(), ...props })
    } else {
      return new UserViewModel(this.toJSON())
    }
  }

  equals(other: unknown): boolean {
    return (
      other instanceof UserViewModel &&
      this.id === other.id &&
      this.name === other.name &&
      this.email === other.email &&
      this.areRolesEqual(this.roles, other.roles) &&
      this.createdAt === other.createdAt
    )
  }

  private areRolesEqual(roles1: UserRoleEnum[], roles2: UserRoleEnum[]): boolean {
    if (roles1.length !== roles2.length) {
      return false
    }

    // use Set because order or the roles is not significant
    const roleSet1 = new Set(roles1.map((role) => role))
    const roleSet2 = new Set(roles2.map((role) => role))

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
