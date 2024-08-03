import { CreateUserInputDTO, DeactivateUserInputDTO, FindUserInputDTO, UpdateUserInputDTO, UserDTO } from '../../dtos'
import { CreateUserRequest, UpdateUserRequest, UserResponse } from '@hatsuportal/contracts'

export interface IUserApiMapper {
  toCreateUserInputDTO(createUserRequest: CreateUserRequest, loggedInUserId?: string): CreateUserInputDTO
  toUpdateUserInputDTO(updateUserRequest: UpdateUserRequest, userId: string, loggedInUserId?: string): UpdateUserInputDTO
  toFindUserInputDTO(userIdToFind?: string, loggedInUserId?: string): FindUserInputDTO
  toDeactivateUserInputDTO(userIdToDeactivate: string, loggedInUserId?: string): DeactivateUserInputDTO
  toResponse(user: UserDTO): UserResponse
}
