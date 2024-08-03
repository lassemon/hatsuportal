import { Logger, unixtimeNow, uuid } from '@hatsuportal/common'
import {
  ICreateUserUseCase,
  ICreateUserUseCaseOptions,
  IUserFactory,
  IUserRepository,
  Password,
  User,
  UserId
} from '@hatsuportal/user-management'
import { AuthenticationError, AuthorizationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('CreateUserUseCaseWithValidation')

export class CreateUserUseCaseWithValidation extends UseCaseWithValidation<ICreateUserUseCaseOptions> implements ICreateUserUseCase {
  constructor(
    private readonly useCase: ICreateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService,
    private readonly userFactory: IUserFactory
  ) {
    super(logger)
  }

  async execute(options: ICreateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options, loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateUser(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateUserUseCaseOptions, loggedInUser: User): boolean {
    return this.testArgument<'createUserInput'>('createUserInput', options, (createUserInput) => {
      const { name, email, password, roles } = createUserInput.creationData

      // Create user creation input props with actual user input
      // fill in the missing mandatory props with dummy values
      new Password(password)
      const userProps = {
        id: uuid(),
        name,
        email,
        roles,
        active: true,
        createdAt: unixtimeNow(),
        updatedAt: unixtimeNow()
      }

      const result = this.userFactory.createUser(userProps)

      return result.match(
        () => true,
        (error) => {
          throw error
        }
      )
    })
  }
}
