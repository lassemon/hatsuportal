import {
  IUserService,
  IUpdateUserUseCase,
  IUpdateUserUseCaseOptions,
  IUserApplicationMapper,
  NotFoundError,
  AuthorizationError,
  ApplicationError
} from '@hatsuportal/application'
import { unixtimeNow } from '@hatsuportal/common'
import { UserId, Password, User, IUserRepository } from '@hatsuportal/domain'
import _ from 'lodash'

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly userService: IUserService
  ) {}

  async execute({ updateUserInput, userUpdated }: IUpdateUserUseCaseOptions): Promise<void> {
    try {
      const { loggedInUserId, updateData } = updateUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(loggedInUserId))
      if (!loggedInUser?.isAdmin()) throw new AuthorizationError('You are not authorized to create a user.')

      const existingUser = await this.userRepository.findById(new UserId(updateData.id))
      if (!existingUser || !existingUser.active) {
        throw new NotFoundError()
      }
      if (loggedInUser.id !== existingUser.id && !loggedInUser.isAdmin()) {
        throw new AuthorizationError('Cannot update somebody elses account.')
      }
      if (updateData.newPassword) {
        try {
          await this.userService.validatePasswordChange(updateData.id, updateData.newPassword, updateData.oldPassword)
        } catch (error) {
          throw new AuthorizationError('Unauthorized')
        }
      }

      const user = new User({
        id: updateData.id,
        name: updateData.username || existingUser.name.value,
        email: updateData.email || existingUser.email.value,
        active: updateData.active || existingUser.active,
        roles: !updateData.roles ? existingUser.roles.map((role) => role.value) : updateData.roles,
        createdAt: existingUser.createdAt.value,
        updatedAt: unixtimeNow()
      })

      const updatedUser = await this.userRepository.update(user, updateData.newPassword ? new Password(updateData.newPassword) : undefined)
      userUpdated(this.userMapper.toDTO(updatedUser))
    } catch (error) {
      if (!(error instanceof ApplicationError)) {
        if (error instanceof Error) throw new ApplicationError(error.stack || error.message)
        throw new ApplicationError(String(error))
      }
      throw error
    }
  }
}
