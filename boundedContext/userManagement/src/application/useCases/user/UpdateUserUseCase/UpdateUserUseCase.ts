import { AuthenticationError, ConcurrencyError, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { isUndefined } from 'lodash'
import { UpdateUserInputDTO, UserDTO } from '../../../dtos'
import { Email, User, UserId, UserName, UserRole, IUserRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserService } from '../../../services/IUserService'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'

export interface IUpdateUserUseCaseOptions extends IUseCaseOptions {
  updatedById: string
  updateUserInput: UpdateUserInputDTO
  userUpdated: (updatedUser: UserDTO) => void
  updateConflict: (error: ConcurrencyError<User>) => void
}

export type IUpdateUserUseCase = IUseCase<IUpdateUserUseCaseOptions>

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly userService: IUserService,
    private readonly passwordFactory: IPasswordFactory
  ) {}

  async execute({ updatedById, updateUserInput, userUpdated, updateConflict }: IUpdateUserUseCaseOptions): Promise<void> {
    try {
      const { id: userIdToUpdate, name, email, active, roles, newPassword, oldPassword } = updateUserInput
      const loggedInUser = await this.userRepository.findById(new UserId(updatedById))

      if (!loggedInUser) throw new AuthenticationError('Not logged in.')

      const existingUser = await this.userRepository.findById(new UserId(userIdToUpdate))

      if (!existingUser || !existingUser.active) {
        throw new NotFoundError()
      }

      if (!isUndefined(newPassword)) {
        await this.userService.validatePasswordChange(userIdToUpdate, newPassword, oldPassword)
      }

      const updatedUser = existingUser!.clone()

      if (!isUndefined(name)) updatedUser!.rename(new UserName(name))
      if (!isUndefined(email)) updatedUser!.changeEmail(new Email(email))
      if (!isUndefined(roles)) updatedUser!.changeRoles(roles.map((role) => new UserRole(role)))
      if (!isUndefined(active)) active ? updatedUser!.activate() : updatedUser!.deactivate()

      await this.userRepository.update(updatedUser, newPassword ? this.passwordFactory.create(newPassword) : undefined)

      userUpdated(this.userMapper.toDTO(updatedUser))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
