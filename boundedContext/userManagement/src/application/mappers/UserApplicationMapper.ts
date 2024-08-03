import { Email, User, UserId, UserName, UserRole } from '../../domain'
import { UserDTO } from '../dtos'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IUserApplicationMapper {
  toDTO(user: User): UserDTO
  dtoToDomainEntity(dto: UserDTO): User
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
      updatedAt: user.updatedAt.value
    }
  }

  dtoToDomainEntity(dto: UserDTO): User {
    return User.reconstruct({
      id: new UserId(dto.id),
      name: new UserName(dto.name),
      email: new Email(dto.email),
      active: dto.active,
      roles: dto.roles.map((role) => new UserRole(role)),
      createdAt: new UnixTimestamp(dto.createdAt),
      updatedAt: new UnixTimestamp(dto.updatedAt)
    })
  }
}
