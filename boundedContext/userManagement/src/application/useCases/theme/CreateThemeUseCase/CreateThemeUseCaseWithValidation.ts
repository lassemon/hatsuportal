import { AuthenticationError, AuthorizationError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { ICreateThemeUseCase, ICreateThemeUseCaseOptions } from './CreateThemeUseCase'
import { UserId } from '../../../../domain'
import { IThemeAuthorizationService } from '../../../authorization/services/ThemeAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

const logger = new Logger('CreateThemeUseCaseWithValidation')

export class CreateThemeUseCaseWithValidation extends UseCaseWithValidation<ICreateThemeUseCaseOptions> implements ICreateThemeUseCase {
  constructor(
    private readonly useCase: ICreateThemeUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IThemeAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ICreateThemeUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateThemeUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.createdById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const authorizationResult = this.authorizationService.canCreateTheme(loggedInUser)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    await this.useCase.execute(options)
  }
}
