import { AuthenticationError, AuthorizationError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { IListThemesUseCase, IListThemesUseCaseOptions } from './ListThemesUseCase'
import { UserId } from '../../../../domain'
import { IThemeAuthorizationService } from '../../../authorization/services/ThemeAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

const logger = new Logger('ListThemesUseCaseWithValidation')

export class ListThemesUseCaseWithValidation extends UseCaseWithValidation<IListThemesUseCaseOptions> implements IListThemesUseCase {
  constructor(
    private readonly useCase: IListThemesUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IThemeAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IListThemesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating ListThemesUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const authorizationResult = this.authorizationService.canListThemes(loggedInUser)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    await this.useCase.execute(options)
  }
}
