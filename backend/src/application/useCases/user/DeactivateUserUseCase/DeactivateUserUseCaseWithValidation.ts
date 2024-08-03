import { Logger } from '@hatsuportal/common'
import { AuthorizationError, AuthenticationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IDeactivateUserUseCase, IDeactivateUserUseCaseOptions, IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '../../../../application/services/IAuthorizationService'

const logger = new Logger('DeactivateUserUseCaseWithValidation')

export class DeactivateUserUseCaseWithValidation
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
