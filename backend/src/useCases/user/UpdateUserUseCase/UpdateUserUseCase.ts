import {
  IUserService,
  IUpdateUserUseCase,
  IUpdateUserUseCaseOptions,
  IUserApplicationMapper,
  UserId,
  Password,
  User,
  IUserRepository
} from '@hatsuportal/user-management'
import { unixtimeNow } from '@hatsuportal/common'
import { ApplicationError, AuthorizationError, ConcurrencyError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { isEmpty } from 'lodash'

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly userService: IUserService
  ) {}

  async execute({ updateUserInput, userUpdated, updateConflict }: IUpdateUserUseCaseOptions): Promise<void> {
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
        await this.userService.validatePasswordChange(updateData.id, updateData.newPassword, updateData.oldPassword)
      }

      const user = User.reconstruct({
        id: updateData.id,
        name: updateData.name || existingUser.name.value,
        email: updateData.email || existingUser.email.value,
        active: updateData.active || existingUser.active,
        roles: !updateData.roles || isEmpty(updateData.roles) ? existingUser.roles.map((role) => role.value) : updateData.roles,
        createdAt: existingUser.createdAt.value,
        updatedAt: unixtimeNow()
      })

      const updatedUser = await this.userRepository.update(user, updateData.newPassword ? new Password(updateData.newPassword) : undefined)
      userUpdated(this.userMapper.toDTO(updatedUser))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
      }
      if (!(error instanceof Error)) {
        throw new ApplicationError({ message: 'Unknown error', cause: error })
      }
      throw error
    }
  }
}
