import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IGetUserProfileUseCase, IGetUserProfileUseCaseOptions } from './GetUserProfileUseCase'
import { UserId } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

const logger = new Logger('GetUserProfileUseCaseWithValidation')

export class GetUserProfileUseCaseWithValidation
  extends UseCaseWithValidation<IGetUserProfileUseCaseOptions>
  implements IGetUserProfileUseCase
{
  constructor(
    private readonly useCase: IGetUserProfileUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IGetUserProfileUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetUserProfileUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const targetUser = await this.userReadRepository.findById(new UserId(options.userId))
    if (!targetUser) throw new NotFoundError(`User '${options.userId}' not found.`)

    const authorizationResult = this.authorizationService.canViewProfile(loggedInUser, targetUser)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    await this.useCase.execute(options)
  }
}
