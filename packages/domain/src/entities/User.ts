import { isArray } from 'lodash'
import { UserRole } from '../enums/UserRole'

export interface UserDatabaseEntity {
  id: string
  name: string
  password: string
  email: string
  roles: string // json types are strings in database
  active: number
  createdAt: number
  updatedAt: number | null
}

export interface UserDTO extends Omit<UserDatabaseEntity, 'password' | 'roles' | 'active'> {
  roles: `${UserRole}`[]
  active: boolean
}

export class User {
  props: UserDTO
  constructor(props: UserDTO) {
    if (!props.id) throw new Error('User must have an id.')
    if (!props.name) throw new Error('User must have a name.')
    if (!props.email) throw new Error('User must have an email.')
    if (!props.roles || props.roles.length <= 0) throw new Error('User must have at least one role.')
    if (!props.createdAt) throw new Error('User must have a createdAt timestamp.')

    this.props = {
      ...props,
      active: !!props.active // active is stored as numeric 1 (MariaDB Tinyint) in database, convert it to boolean here just in case it hasn't been converted already
    }
    this.validateProps(props)
  }

  private validateProps(props: UserDTO) {
    const allowedKeys = this.getAllowedKeys()
    const extraKeys = Object.keys(props).filter((key) => !allowedKeys.includes(key as keyof UserDTO))
    if (extraKeys.length > 0) {
      throw new Error(`Props contain extra keys: ${extraKeys.join(', ')}.`)
    }
  }

  protected getAllowedKeys(): (keyof UserDTO)[] {
    return ['id', 'name', 'email', 'roles', 'active', 'createdAt', 'updatedAt'] as (keyof UserDTO)[]
  }

  get id(): string {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get roles(): `${UserRole}`[] {
    return this.props.roles
  }

  set roles(roles: `${UserRole}`[]) {
    this.props.roles = roles
  }

  get active(): boolean {
    return this.props.active
  }

  get createdAt(): number {
    return this.props.createdAt
  }

  get updatedAt(): number | null {
    return this.props.updatedAt
  }

  set updatedAt(updatedAt: number | null) {
    this.props.updatedAt = updatedAt
  }

  isAdmin() {
    return this.props.roles.some((role) => ([UserRole.SuperAdmin, UserRole.Admin] as `${UserRole}`[]).includes(role))
  }

  isEqual(otherUser: this | object | null): boolean {
    if (otherUser === null) {
      return false
    }
    return JSON.stringify(this) === JSON.stringify(otherUser)
  }

  public clone<C extends User>(props?: Partial<UserDTO>): C {
    if (props) {
      const cloneProps = {
        ...this.props,
        ...props
      }
      return new (this.constructor as { new (props: UserDTO): C })(cloneProps as UserDTO)
    } else {
      return new (this.constructor as { new (props: UserDTO): C })(this.serialize() as UserDTO)
    }
  }

  public serialize(): UserDTO {
    return JSON.parse(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(this.props).map((entry) => {
            let [key, value] = entry
            const valueIsArray = isArray(value)
            if (valueIsArray) value = value.map((item: any) => (item?.serialize ? item.serialize() : item))
            const serializedValue = value?.serialize ? value.serialize() : value
            return [key, serializedValue]
          })
        )
      )
    )
  }

  public toString(): string {
    return JSON.stringify(this.serialize())
  }

  public static fromRecord(userRecord: Omit<UserDatabaseEntity, 'password'>): User {
    return new User({
      ...userRecord,
      active: !!userRecord.active,
      roles: JSON.parse(userRecord.roles)
    })
  }
}
