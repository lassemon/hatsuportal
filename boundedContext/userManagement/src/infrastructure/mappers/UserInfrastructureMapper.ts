import { UserDatabaseSchema } from '../schemas/UserDatabaseSchema'
import { Password, User, UserRole, UserId, UserName, Email } from '../../domain'
import { Encryption, UserDTO } from '../../application'
import { MappingError } from '../errors/MappingError'
import { PartialExceptFor, unixtimeNow } from '@hatsuportal/common'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

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
      roles: user.roles.map((role) => role.value),
      active: user.active,
      createdAt: createdAt,
      updatedAt: createdAt
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
      roles: user.roles.map((role) => role.value),
      active: user.active,
      updatedAt: unixtimeNow()
    }
  }

  toDTO(userRecord: UserDatabaseSchema): UserDTO {
    return {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      roles: userRecord.roles ?? [],
      active: userRecord.active === 1 || userRecord.active === true,
      createdAt: userRecord.createdAt,
      updatedAt: userRecord.updatedAt
    }
  }

  toDomainEntity(userRecord: UserDatabaseSchema): User {
    return User.reconstruct({
      id: new UserId(userRecord.id),
      name: new UserName(userRecord.name),
      email: new Email(userRecord.email),
      active: userRecord.active === 1 || userRecord.active === true,
      roles: userRecord.roles.map((role) => new UserRole(role)),
      createdAt: new UnixTimestamp(userRecord.createdAt),
      updatedAt: new UnixTimestamp(userRecord.updatedAt)
    })
  }
}
