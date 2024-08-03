import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IGetUserPreferencesUseCase, IGetUserPreferencesUseCaseOptions } from './GetUserPreferencesUseCase'
import { UserId } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

const logger = new Logger('GetUserPreferencesUseCaseWithValidation')

export class GetUserPreferencesUseCaseWithValidation
  extends UseCaseWithValidation<IGetUserPreferencesUseCaseOptions>
  implements IGetUserPreferencesUseCase
{
  constructor(
    private readonly useCase: IGetUserPreferencesUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IGetUserPreferencesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetUserPreferencesUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const targetUser = await this.userReadRepository.findById(new UserId(options.userId))
    if (!targetUser) throw new NotFoundError(`User '${options.userId}' not found.`)

    const authorizationResult = this.authorizationService.canViewPreferences(loggedInUser, targetUser)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    await this.useCase.execute(options)
  }
}
