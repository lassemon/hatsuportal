import { userV1 } from '@hatsuportal/bounded-context-service-contracts'
import { CreateUserInputDTO, DeactivateUserInputDTO, UpdateUserInputDTO } from '../../../dtos'
import { UserRoleEnum, validateAndCastEnum } from '@hatsuportal/common'

export interface IUserCommandMapper {
  toCreateUserInput(command: userV1.CreateUserCommand): CreateUserInputDTO
  toCreateUserResult(result: { userId: string }): userV1.CreateUserResult

  toUpdateUserInput(command: userV1.UpdateUserCommand): UpdateUserInputDTO
  toUpdateUserResult(result: { userId: string }): userV1.UpdateUserResult

  toDeactivateUserInput(command: userV1.DeactivateUserCommand): DeactivateUserInputDTO
  toDeactivateUserResult(result: { userId: string }): userV1.DeactivateUserResult
}

export class UserCommandMapper implements IUserCommandMapper {
  public toCreateUserInput(command: userV1.CreateUserCommand): CreateUserInputDTO {
    return {
      name: command.name,
      email: command.email,
      password: command.password,
      roles: command.roles.map((role) => validateAndCastEnum(role, UserRoleEnum)) ?? []
    }
  }

  public toCreateUserResult(result: { userId: string }): userV1.CreateUserResult {
    return { userId: result.userId }
  }

  public toUpdateUserInput(command: userV1.UpdateUserCommand): UpdateUserInputDTO {
    return {
      id: command.id,
      name: command.name,
      email: command.email,
      roles: command.roles?.map((role) => validateAndCastEnum(role, UserRoleEnum)) ?? [],
      active: command.active,
      oldPassword: command.oldPassword,
      newPassword: command.newPassword
    }
  }

  public toUpdateUserResult(result: { userId: string }): userV1.UpdateUserResult {
    return { userId: result.userId }
  }

  public toDeactivateUserInput(command: userV1.DeactivateUserCommand): DeactivateUserInputDTO {
    return {
      userIdToDeactivate: command.id
    }
  }

  public toDeactivateUserResult(result: { userId: string }): userV1.DeactivateUserResult {
    return { userId: result.userId }
  }
}
