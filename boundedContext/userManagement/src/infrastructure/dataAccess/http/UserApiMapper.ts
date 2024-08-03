import { IUserApiMapper } from '../../../application/dataAccess/http/IUserApiMapper'
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '@hatsuportal/contracts'
import { CreateUserInputDTO, DeactivateUserInputDTO, FindUserInputDTO, UpdateUserInputDTO, UserDTO } from '../../../application/dtos'
import { InvalidRequestError } from '@hatsuportal/platform'
import _ from 'lodash'
import { isNonStringOrEmpty, UserRoleEnum, validateAndCastEnum } from '@hatsuportal/common'

export class UserApiMapper implements IUserApiMapper {
  public toCreateUserInputDTO(createUserRequest: CreateUserRequest, loggedInUserId?: string): CreateUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }
    if (isNonStringOrEmpty(createUserRequest.name)) {
      throw new InvalidRequestError(`Name is required and must be a string.`)
    }
    if (isNonStringOrEmpty(createUserRequest.email)) {
      throw new InvalidRequestError(`Email is required and must be a string.`)
    }
    if (isNonStringOrEmpty(createUserRequest.password)) {
      throw new InvalidRequestError(`Password is required and must be a string.`)
    }

    const parsedRoles = _.compact(
      createUserRequest.roles.map((role) => {
        return validateAndCastEnum(role, UserRoleEnum)
      })
    )

    return {
      name: createUserRequest.name,
      email: createUserRequest.email,
      password: createUserRequest.password,
      roles: !_.isEmpty(parsedRoles) ? parsedRoles : [UserRoleEnum.Viewer]
    }
  }

  public toUpdateUserInputDTO(updateUserRequest: UpdateUserRequest, userId: string, loggedInUserId?: string): UpdateUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    const parsedRoles = _.compact(
      updateUserRequest.roles?.map((role) => {
        return validateAndCastEnum(role, UserRoleEnum)
      })
    )

    return {
      id: userId,
      name: updateUserRequest.name,
      email: updateUserRequest.email,
      roles: parsedRoles,
      active: updateUserRequest.active,
      oldPassword: updateUserRequest.oldPassword,
      newPassword: updateUserRequest.newPassword
    }
  }

  public toFindUserInputDTO(userIdToFind: string, loggedInUserId: string): FindUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (isNonStringOrEmpty(userIdToFind)) {
      throw new InvalidRequestError('User id is required and must be a string.')
    }

    return {
      //  As of now, TypeScript does not provide a way to create type guards that assert a variable is NOT of a certain type directly in the function signature.
      userIdToFind: userIdToFind as string // safe to cast because we know it is not an empty string here
    }
  }

  public toDeactivateUserInputDTO(userIdToDeactivate: string, loggedInUserId?: string): DeactivateUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (isNonStringOrEmpty(userIdToDeactivate)) {
      throw new InvalidRequestError('User id to deactive is required and must be a string.')
    }

    return {
      userIdToDeactivate
    }
  }

  public toResponse(user: UserDTO): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }
  }
}
