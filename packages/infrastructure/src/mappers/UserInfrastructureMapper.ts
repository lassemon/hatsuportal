import { Password, User } from '@hatsuportal/domain'
import _ from 'lodash'
import { UserDatabaseSchema } from '../schemas/UserDatabaseSchema'
import { Encryption, UserDTO } from '@hatsuportal/application'
import { PartialExceptFor, unixtimeNow, UserRoleEnum } from '@hatsuportal/common'
import { MappingError } from '../errors/MappingError'

export interface IUserInfrastructureMapper {
  toInsertQuery(user: User, password: Password): Promise<UserDatabaseSchema>
  toUpdateQuery(user: User, password?: Password): Promise<PartialExceptFor<Omit<UserDatabaseSchema, 'createdAt'>, 'id'>>
  toDTO(userRecord: UserDatabaseSchema): UserDTO
  toDomainEntity(userRecord: UserDatabaseSchema): User
}

export class UserInfrastructureMapper implements IUserInfrastructureMapper {
  async toInsertQuery(user: User, password: Password): Promise<UserDatabaseSchema> {
    const createdAt = unixtimeNow()
    const encryptedPassword = await Encryption.encrypt(password.value)

    if (typeof password !== 'undefined' && password.value === encryptedPassword) {
      throw new MappingError('Attempted to add unencrypted password to database')
    }

    return {
      id: user.id.value,
      name: user.name.value,
      password: encryptedPassword,
      email: user.email.value,
      roles: JSON.stringify(user.roles.map((role) => role.value)),
      active: user.active === true ? 1 : 0,
      createdAt: createdAt,
      updatedAt: null
    }
  }

  async toUpdateQuery(user: User, password?: Password): Promise<PartialExceptFor<Omit<UserDatabaseSchema, 'createdAt'>, 'id'>> {
    const newPassword = password ? await Encryption.encrypt(password.value) : undefined

    if (typeof password !== 'undefined' && password.value === newPassword) {
      throw new MappingError('Attempted to add unencrypted password to database')
    }

    return {
      id: user.id.value,
      name: user.name.value,
      ...(newPassword ? { password: newPassword } : {}),
      email: user.email.value,
      roles: JSON.stringify(user.roles.map((role) => role.value)),
      active: user.active === true ? 1 : 0,
      updatedAt: unixtimeNow()
    }
  }

  toDTO(userRecord: UserDatabaseSchema): UserDTO {
    const parsedRoles = JSON.parse(userRecord.roles) as unknown as UserRoleEnum[]
    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      roles: parsedRoles ?? [],
      active: userRecord.active === 1 ? true : false,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt
    }
  }

  toDomainEntity(userRecord: UserDatabaseSchema): User {
    return new User(this.toDTO(userRecord))
  }
}
