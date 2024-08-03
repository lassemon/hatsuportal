import { AuthenticationError, AuthorizationError, InvalidInputError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger, UserRoleEnum, isEnumValue } from '@hatsuportal/common'
import { IUpdateUserUseCase, IUpdateUserUseCaseOptions } from './UpdateUserUseCase'
import { Email, User, UserId, UserName, IUserRepository } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'

const logger = new Logger('UpdateUserUseCaseWithValidation')

export class UpdateUserUseCaseWithValidation extends UseCaseWithValidation<IUpdateUserUseCaseOptions> implements IUpdateUserUseCase {
  constructor(
    private readonly useCase: IUpdateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly authorizationService: IUserAuthorizationService,
    private readonly passwordFactory: IPasswordFactory
  ) {
    super(logger)
  }

  async execute(options: IUpdateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.updatedById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const userToUpdate = await this.userRepository.findById(new UserId(options.updateUserInput.id))
    if (!userToUpdate) throw new NotFoundError('User to update not found.')

    const valid = this.validateAuthorization(loggedInUser, userToUpdate) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, userToUpdate: User): boolean {
    const authorizationResult = this.authorizationService.canUpdateUser(
      this.userMapper.toDTO(loggedInUser),
      this.userMapper.toDTO(userToUpdate)
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateUserUseCaseOptions): boolean {
    const { name, email, active, oldPassword, newPassword, roles } = options.updateUserInput

    return (
      this.testArgumentInstance(UserId, 'updateUserInput.id', options) &&
      ((name ?? null) !== null ? this.testArgumentInstance(UserName, 'updateUserInput.name', options) : true) &&
      ((email ?? null) !== null ? this.testArgumentInstance(Email, 'updateUserInput.email', options) : true) &&
      ((active ?? null) !== null ? this.testArgumentInstance(Boolean, 'updateUserInput.active', options) : true) &&
      ((oldPassword ?? null) !== null
        ? this.testArgument<'updateUserInput'>('updateUserInput', options, (updateUserInput) => {
            const { oldPassword } = updateUserInput
            this.passwordFactory.create(oldPassword!)
            return true
          })
        : true) &&
      ((newPassword ?? null) !== null
        ? this.testArgument<'updateUserInput'>('updateUserInput', options, (updateUserInput) => {
            const { newPassword } = updateUserInput
            this.passwordFactory.create(newPassword!)
            return true
          })
        : true) &&
      ((roles ?? null) !== null
        ? this.testArgument<'updateUserInput'>('updateUserInput', options, (updateUserInput) => {
            const { roles } = updateUserInput

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
