import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { IDeleteThemeUseCase, IDeleteThemeUseCaseOptions } from './DeleteThemeUseCase'
import { IThemeRepository, ThemeId, UserId } from '../../../../domain'
import { IThemeAuthorizationService } from '../../../authorization/services/ThemeAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { IThemeApplicationMapper } from '../../../mappers/ThemeApplicationMapper'

const logger = new Logger('DeleteThemeUseCaseWithValidation')

export class DeleteThemeUseCaseWithValidation extends UseCaseWithValidation<IDeleteThemeUseCaseOptions> implements IDeleteThemeUseCase {
  constructor(
    private readonly useCase: IDeleteThemeUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly themeRepository: IThemeRepository,
    private readonly themeApplicationMapper: IThemeApplicationMapper,
    private readonly authorizationService: IThemeAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeleteThemeUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeleteThemeUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.deletedById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const existingTheme = await this.themeRepository.findById(new ThemeId(options.deleteThemeInput.themeIdToDelete))
    if (!existingTheme) {
      throw new NotFoundError(`Theme with id ${options.deleteThemeInput.themeIdToDelete} not found`)
    }

    const authorizationResult = this.authorizationService.canDeleteTheme(loggedInUser, this.themeApplicationMapper.toDTO(existingTheme))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    await this.useCase.execute(options)
  }
}
