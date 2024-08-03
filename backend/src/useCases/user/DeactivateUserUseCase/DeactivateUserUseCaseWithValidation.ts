import { Logger } from '@hatsuportal/common'
import { AuthorizationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { AuthenticationError } from '@hatsuportal/common-bounded-context/src'
import { IDeactivateUserUseCase, IDeactivateUserUseCaseOptions, IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('DeadtivateUserUseCaseWithValidation')

export class DeadtivateUserUseCaseWithValidation
  extends UseCaseWithValidation<IDeactivateUserUseCaseOptions>
  implements IDeactivateUserUseCase
{
  constructor(
    private readonly useCase: IDeactivateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeactivateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeactivateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.deactivateUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = await this.validateAuthorization(loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: User): Promise<boolean> {
    const authorizationResult = this.authorizationService.canDeactivateUser(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
