import {
  InsertUserQueryDTO,
  UpdateUserQueryDTO,
  UpdateUserRequestDTO,
  UseCaseInterface,
  UseCaseOptionsInterface,
  UserMapperInterface,
  UserServiceInterface
} from '@hatsuportal/application'
import { ApiError, User, UserDTO, UserRepositoryInterface } from '@hatsuportal/domain'

export interface UpdateUserUseCaseOptions extends UseCaseOptionsInterface {
  userUpdateRequest: UpdateUserRequestDTO
  user: User
}

export type UpdateUserUseCaseInterface = UseCaseInterface<UpdateUserUseCaseOptions, UserDTO>

export class UpdateUserUseCase implements UpdateUserUseCaseInterface {
  constructor(
    private readonly userMapper: UserMapperInterface,
    private readonly userRepository: UserRepositoryInterface<InsertUserQueryDTO, UpdateUserQueryDTO>,
    private readonly userService: UserServiceInterface
  ) {}

  async execute({ userUpdateRequest, user: loggedInUser }: UpdateUserUseCaseOptions): Promise<UserDTO> {
    // TODO allow updating other than the logged in user here or create new ModifyUserUseCase where an admin can change other users
    const existingUser = await this.userRepository.findById(userUpdateRequest.id)
    if (!existingUser || !existingUser.active) {
      throw new ApiError(404, 'NotFound')
    }
    if (loggedInUser.id !== existingUser.id) {
      throw new ApiError(401, 'Unauthorized', 'Cannot update somebody elses account.')
    }

    const user = this.userMapper.updateRequestToUser(existingUser, userUpdateRequest)

    if (userUpdateRequest.newPassword) {
      await this.userService.validatePasswordChange(user.id, userUpdateRequest.newPassword, userUpdateRequest.oldPassword)
    }

    const userUpdateQuery = await this.userMapper.toUpdateQuery(user, userUpdateRequest.newPassword)
    const updatedUser = await this.userRepository.update(userUpdateQuery)
    return updatedUser.serialize()
  }
}
