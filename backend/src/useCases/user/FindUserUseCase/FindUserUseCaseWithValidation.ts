import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IFindUserUseCase, IFindUserUseCaseOptions, IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('FindUserUseCaseWithValidation')

export class FindUserUseCaseWithValidation extends UseCaseWithValidation<IFindUserUseCaseOptions> implements IFindUserUseCase {
  constructor(
    private readonly useCase: IFindUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IFindUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.findUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const foundUser = await this.userRepository.findById(new UserId(options.findUserInput.userIdToFind))
    if (!foundUser) throw new NotFoundError(`User '${options.findUserInput.userIdToFind}' not found.`)

    const valid = this.validateAuthorization(loggedInUser, foundUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, userToView: User): boolean {
    const authorizationResult = this.authorizationService.canViewUser(loggedInUser, userToView)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
