import {
  AuthenticationError,
  AuthorizationError,
  InvalidInputError,
  NotFoundError,
  UseCaseWithValidation
} from '@hatsuportal/common-bounded-context'
import {
  Email,
  IUpdateUserUseCase,
  IUpdateUserUseCaseOptions,
  IUserRepository,
  Password,
  User,
  UserId,
  UserName
} from '@hatsuportal/user-management'
import { isEnumValue, Logger, UserRoleEnum } from '@hatsuportal/common'
import { IAuthorizationService } from '../../../../application/services/IAuthorizationService'

const logger = new Logger('UpdateUserUseCaseWithValidation')

export class UpdateUserUseCaseWithValidation extends UseCaseWithValidation<IUpdateUserUseCaseOptions> implements IUpdateUserUseCase {
  constructor(
    private readonly useCase: IUpdateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.updateUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const userToUpdate = await this.userRepository.findById(new UserId(options.updateUserInput.updateData.id))
    if (!userToUpdate) throw new NotFoundError('User to update not found.')

    const valid = this.validateAuthorization(loggedInUser, userToUpdate) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, userToUpdate: User): boolean {
    const authorizationResult = this.authorizationService.canUpdateUser(loggedInUser, userToUpdate)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateUserUseCaseOptions): boolean {
    const { updateData } = options.updateUserInput
    const { name, email, active, oldPassword, newPassword, roles } = updateData

    return (
      this.testArgumentInstance(UserId, 'updateUserInput.updateData.id', options) &&
      ((name ?? null) !== null ? this.testArgumentInstance(UserName, 'updateUserInput.updateData.name', options) : true) &&
      ((email ?? null) !== null ? this.testArgumentInstance(Email, 'updateUserInput.updateData.email', options) : true) &&
      ((active ?? null) !== null ? this.testArgumentInstance(Boolean, 'updateUserInput.updateData.active', options) : true) &&
      ((oldPassword ?? null) !== null ? this.testArgumentInstance(Password, 'updateUserInput.updateData.oldPassword', options) : true) &&
      ((newPassword ?? null) !== null ? this.testArgumentInstance(Password, 'updateUserInput.updateData.newPassword', options) : true) &&
      ((roles ?? null) !== null
        ? this.testArgument<'updateUserInput'>('updateUserInput', options, (searchStoriesInput) => {
            const { roles } = searchStoriesInput.updateData

            if (roles && roles.length > 0) {
              roles.forEach((role) => {
                if (!isEnumValue(role, UserRoleEnum)) {
                  throw new InvalidInputError(`Invalid role '${role}'.`)
                }
              })
            }

            return true
          })
        : true)
    )
  }
}
