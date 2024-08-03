import { AuthenticationError, AuthorizationError, InvalidInputError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger, UserRoleEnum, isEnumValue } from '@hatsuportal/common'
import { ICreateUserUseCase, ICreateUserUseCaseOptions } from './CreateUserUseCase'
import { Email, User, UserId, UserName, IUserRepository } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'

const logger = new Logger('CreateUserUseCaseWithValidation')

export class CreateUserUseCaseWithValidation extends UseCaseWithValidation<ICreateUserUseCaseOptions> implements ICreateUserUseCase {
  constructor(
    private readonly useCase: ICreateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly authorizationService: IUserAuthorizationService,
    private readonly passwordFactory: IPasswordFactory
  ) {
    super(logger)
  }

  async execute(options: ICreateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createdById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateUser(this.userMapper.toDTO(loggedInUser))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateUserUseCaseOptions): boolean {
    this.testArgumentInstance(UserName, 'createUserInput.name', options)
    this.testArgumentInstance(Email, 'createUserInput.email', options)
    this.testArgument<'createUserInput'>('createUserInput', options, (createUserInput) => {
      const { password } = createUserInput
      this.passwordFactory.create(password)
      return true
    })
    this.testArgument<'createUserInput'>('createUserInput', options, (createUserInput) => {
      const { roles } = createUserInput
      if (roles && roles.length > 0) {
        roles.forEach((role) => {
          if (!isEnumValue(role, UserRoleEnum)) {
            throw new InvalidInputError(`Invalid role '${role}'.`)
          }
        })
      }

      return true
    })

    return true
  }
}
