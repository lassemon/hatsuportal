import { isEnumValue, Logger, UserRoleEnum } from '@hatsuportal/common'
import {
  Email,
  ICreateUserUseCase,
  ICreateUserUseCaseOptions,
  IUserRepository,
  Password,
  User,
  UserId,
  UserName
} from '@hatsuportal/user-management'
import { AuthenticationError, AuthorizationError, InvalidInputError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('CreateUserUseCaseWithValidation')

export class CreateUserUseCaseWithValidation extends UseCaseWithValidation<ICreateUserUseCaseOptions> implements ICreateUserUseCase {
  constructor(
    private readonly useCase: ICreateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ICreateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateUser(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateUserUseCaseOptions): boolean {
    this.testArgumentInstance(UserName, 'createUserInput.creationData.name', options)
    this.testArgumentInstance(Email, 'createUserInput.creationData.email', options)
    this.testArgumentInstance(Password, 'createUserInput.creationData.password', options)
    this.testArgument<'createUserInput'>('createUserInput', options, (searchStoriesInput) => {
      const { roles } = searchStoriesInput.creationData

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
