import { AuthenticationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IGetAllUsersUseCase, IGetAllUsersUseCaseOptions, IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import { AuthorizationError } from '@hatsuportal/common-bounded-context/src'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('GetAllUsersUseCaseWithValidation')

export class GetAllUsersUseCaseWithValidation extends UseCaseWithValidation<IGetAllUsersUseCaseOptions> implements IGetAllUsersUseCase {
  constructor(
    private readonly useCase: IGetAllUsersUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IGetAllUsersUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetAllUsersUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const valid = this.validateAuthorization(loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(user: User): boolean {
    const authorizationResult = this.authorizationService.canListAllUsers(user)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
