import _ from 'lodash'
import { UserDTO } from '../dtos/UserDTO'
import { User } from '../../domain'

export interface IUserApplicationMapper {
  toDTO(user: User): UserDTO
  toDomainEntity(dto: UserDTO): User
}

export class UserApplicationMapper implements IUserApplicationMapper {
  toDTO(user: User): UserDTO {
    return {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      roles: user.roles.map((role) => role.value),
      active: user.active,
      createdAt: user.createdAt.value,
      updatedAt: user.updatedAt?.value ?? null
    }
  }

  toDomainEntity(dto: UserDTO): User {
    return new User(dto)
  }
}
