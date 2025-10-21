import { Email, User, UserId, UserName, UserRole } from '../../domain'
import { IUserFactory } from '../services/UserFactory'
import isEmpty from 'lodash/isEmpty'
import { CreateUserInputDTO, UserDTO } from '../dtos'
import uniq from 'lodash/uniq'
import { castToEnum, unixtimeNow, UserRoleEnum, uuid } from '@hatsuportal/foundation'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IUserApplicationMapper {
  toDTO(user: User): UserDTO
  dtoToDomainEntity(dto: UserDTO): User
  createInputToDomainEntity(createUserInput: CreateUserInputDTO): User
}

export class UserApplicationMapper implements IUserApplicationMapper {
  constructor(private readonly userFactory: IUserFactory) {}
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

  createInputToDomainEntity(createUserInput: CreateUserInputDTO): User {
    const now = unixtimeNow()
    // TODO, could be replaced with User.tryCreate(props): Result<User, DomainError> ?
    // is a separate factory overkill?
    const result = this.userFactory.createUser({
      id: new UserId(uuid()),
      name: new UserName(createUserInput.name.trim()),
      email: new Email(createUserInput.email.trim()),
      active: true,
      roles: isEmpty(createUserInput.roles)
        ? [new UserRole(UserRoleEnum.Viewer)]
        : uniq(createUserInput.roles.map((role) => new UserRole(castToEnum(role, UserRoleEnum, UserRoleEnum.Viewer)))),
      createdAt: new UnixTimestamp(now),
      updatedAt: new UnixTimestamp(now)
    })

    if (result.isFailure()) {
      throw result.error
    }

    return result.value
  }
}
