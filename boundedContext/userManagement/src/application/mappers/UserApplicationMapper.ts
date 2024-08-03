import isEmpty from 'lodash/isEmpty'
import { unixtimeNow } from '@hatsuportal/common'
import { UserDTO } from '../dtos/UserDTO'
import { User } from '../../domain'
import { IUserFactory } from '../services/UserFactory'
import { CreateUserInputDTO } from '../dtos/CreateUserInputDTO'
import { UserRoleEnum, uuid } from '@hatsuportal/common'

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
      updatedAt: user.updatedAt?.value ?? null
    }
  }

  dtoToDomainEntity(dto: UserDTO): User {
    return User.create(dto)
  }

  createInputToDomainEntity(createUserInput: CreateUserInputDTO): User {
    const { creationData } = createUserInput

    const now = unixtimeNow()
    const result = this.userFactory.createUser({
      id: uuid(),
      name: creationData.name,
      email: creationData.email,
      active: true,
      roles: isEmpty(creationData.roles) ? [UserRoleEnum.Viewer] : creationData.roles,
      createdAt: now,
      updatedAt: now
    })

    if (result.isFailure()) {
      throw result.error
    }

    return result.value
  }
}
