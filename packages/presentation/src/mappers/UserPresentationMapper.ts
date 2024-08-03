import { CreateUserInputDTO, DeactivateUserInputDTO, FindUserInputDTO, UpdateUserInputDTO, UserDTO } from '@hatsuportal/application'
import { isNonStringOrEmpty, UserRoleEnum, validateAndCastEnum } from '@hatsuportal/common'
import { CreateUserRequest } from '../api/requests/CreateUserRequest'
import { UpdateUserRequest } from '../api/requests/UpdateUserRequest'
import { UserResponse } from '../api/responses/UserResponse'
import { InvalidRequestError } from '../errors/InvalidRequestError'
import _ from 'lodash'
import { UserPresentation } from '../entities/UserPresentation'

export interface IUserPresentationMapper {
  toCreateUserInputDTO(createUserRequest: CreateUserRequest, loggedInUserId?: string): CreateUserInputDTO
  toUpdateUserInputDTO(updateUserRequest: UpdateUserRequest, loggedInUserId?: string): UpdateUserInputDTO
  toFindUserInputDTO(userIdToFind?: string, loggedInUserId?: string): FindUserInputDTO
  toDeactivateUserInputDTO(userIdToDeactivate: string, loggedInUserId?: string): DeactivateUserInputDTO
  toResponse(user: UserDTO): UserResponse
  toUserPresentation(response: UserResponse): UserPresentation
}

export class UserPresentationMapper implements IUserPresentationMapper {
  public toCreateUserInputDTO(createUserRequest: CreateUserRequest, loggedInUserId?: string): CreateUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }
    if (isNonStringOrEmpty(createUserRequest.username)) {
      throw new InvalidRequestError(`Username is required and must be a string.`)
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
      loggedInUserId,
      creationData: {
        username: createUserRequest.username,
        email: createUserRequest.email,
        password: createUserRequest.password,
        roles: !_.isEmpty(parsedRoles) ? parsedRoles : [UserRoleEnum.Viewer]
      }
    }
  }

  public toUpdateUserInputDTO(updateUserRequest: UpdateUserRequest, loggedInUserId?: string): UpdateUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    const parsedRoles = _.compact(
      updateUserRequest.roles?.map((role) => {
        return validateAndCastEnum(role, UserRoleEnum)
      })
    )

    return {
      loggedInUserId,
      updateData: {
        id: updateUserRequest.id,
        username: updateUserRequest.username,
        email: updateUserRequest.email,
        roles: parsedRoles,
        active: updateUserRequest.active,
        oldPassword: updateUserRequest.oldPassword,
        newPassword: updateUserRequest.newPassword
      }
    }
  }

  public toFindUserInputDTO(userIdToFind?: string, loggedInUserId?: string): FindUserInputDTO {
    if (!loggedInUserId) {
      throw new InvalidRequestError('Invalid user authentication data.')
    }

    if (isNonStringOrEmpty(userIdToFind)) {
      throw new InvalidRequestError('User id is required and must be a string.')
    }

    return {
      loggedInUserId,
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
      loggedInUserId,
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

  public toUserPresentation(response: UserResponse): UserPresentation {
    return new UserPresentation({
      id: response.id,
      name: response.name,
      email: response.email,
      roles: response.roles.map((role) => validateAndCastEnum(role, UserRoleEnum)),
      createdAt: response.createdAt,
      updatedAt: response.updatedAt
    })
  }
}
