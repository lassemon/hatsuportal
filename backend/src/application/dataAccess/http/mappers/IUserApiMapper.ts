import { CreateUserRequest, UpdateUserRequest, UserResponse } from '@hatsuportal/contracts'
import { CreateUserInputDTO, UpdateUserInputDTO, FindUserInputDTO, DeactivateUserInputDTO, UserDTO } from '@hatsuportal/user-management'

export interface IUserApiMapper {
  toCreateUserInputDTO(createUserRequest: CreateUserRequest, loggedInUserId?: string): CreateUserInputDTO
  toUpdateUserInputDTO(updateUserRequest: UpdateUserRequest, loggedInUserId?: string): UpdateUserInputDTO
  toFindUserInputDTO(userIdToFind?: string, loggedInUserId?: string): FindUserInputDTO
  toDeactivateUserInputDTO(userIdToDeactivate: string, loggedInUserId?: string): DeactivateUserInputDTO
  toResponse(user: UserDTO): UserResponse
}
