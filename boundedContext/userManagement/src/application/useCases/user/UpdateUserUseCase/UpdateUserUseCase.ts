import { ConcurrencyError, IUnitOfWork, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { isEmpty, isUndefined } from 'lodash'
import { UpdateUserInputDTO, UserDTO } from '../../../dtos'
import { Email, User, UserId, UserName, UserRole, IUserWriteRepository } from '../../../../domain'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IUserLookupService } from '../../../services/UserLookupService'
import { IUserAuthenticationService } from '../../../services/IUserAuthenticationService'
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
    private readonly userWriteRepository: IUserWriteRepository,
    private readonly userLookupService: IUserLookupService,
    private readonly userApplicationMapper: IUserApplicationMapper,
    private readonly userService: IUserAuthenticationService,
    private readonly passwordFactory: IPasswordFactory,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async execute({ updatedById, updateUserInput, userUpdated, updateConflict }: IUpdateUserUseCaseOptions): Promise<void> {
    try {
      const { id: userIdToUpdate, name, email, active, roles, newPassword, oldPassword } = updateUserInput
      const updatedBy = new UserId(updatedById)

      const targetUser = await this.userWriteRepository.findById(new UserId(userIdToUpdate))
      if (!targetUser || !targetUser.active) {
        throw new NotFoundError(`Cannot update target user with id ${userIdToUpdate}, user not found`)
      }

      if (!isUndefined(newPassword)) {
        await this.userService.validatePasswordChange(userIdToUpdate, newPassword, oldPassword)
      }

      const [updatedUser] = await this.unitOfWork.execute<[User]>(async () => {
        const existingUser = await this.userWriteRepository.findByIdForUpdate(new UserId(userIdToUpdate))
        if (!existingUser || !existingUser.active) {
          throw new NotFoundError(`User with id ${userIdToUpdate} not found`)
        }

        const user = existingUser.clone()

        if (!isUndefined(name)) user.rename(new UserName(name), updatedBy)
        if (!isUndefined(email)) user.changeEmail(new Email(email), updatedBy)
        if (!isUndefined(roles) && !isEmpty(roles)) {
          user.changeRoles(
            roles.map((role) => new UserRole(role)),
            new UserId(updatedById)
          )
        }
        if (!isUndefined(active)) {
          active ? user.activate(updatedBy) : user.deactivate(updatedBy)
        }

        await this.userWriteRepository.update(user, newPassword ? this.passwordFactory.create(newPassword) : undefined)
        return [user]
      })

      this.userLookupService.invalidateById(updatedUser.id)
      userUpdated(this.userApplicationMapper.toDTO(updatedUser))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
