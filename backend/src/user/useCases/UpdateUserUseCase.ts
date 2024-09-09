import {
  InsertUserQueryDTO,
  UpdateUserQueryDTO,
  IUserMapper,
  IUserService,
  IUpdateUserUseCase,
  IUpdateUserUseCaseOptions
} from '@hatsuportal/application'
import { ApiError, UserDTO, IUserRepository } from '@hatsuportal/domain'

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository<InsertUserQueryDTO, UpdateUserQueryDTO>,
    private readonly userMapper: IUserMapper,
    private readonly userService: IUserService
  ) {}

  async execute({ userUpdateRequest, user: loggedInUser }: IUpdateUserUseCaseOptions): Promise<UserDTO> {
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
