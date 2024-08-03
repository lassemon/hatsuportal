import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { IUpdateThemeUseCase, IUpdateThemeUseCaseOptions } from './UpdateThemeUseCase'
import { IThemeRepository, ThemeId, UserId } from '../../../../domain'
import { IThemeAuthorizationService } from '../../../authorization/services/ThemeAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { IThemeApplicationMapper } from '../../../mappers/ThemeApplicationMapper'

const logger = new Logger('UpdateThemeUseCaseWithValidation')

export class UpdateThemeUseCaseWithValidation extends UseCaseWithValidation<IUpdateThemeUseCaseOptions> implements IUpdateThemeUseCase {
  constructor(
    private readonly useCase: IUpdateThemeUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly themeRepository: IThemeRepository,
    private readonly themeApplicationMapper: IThemeApplicationMapper,
    private readonly authorizationService: IThemeAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateThemeUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateThemeUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.updatedById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const existingTheme = await this.themeRepository.findById(new ThemeId(options.themeId))
    if (!existingTheme) {
      throw new NotFoundError(`Theme with id ${options.themeId} not found`)
    }

    const authorizationResult = this.authorizationService.canUpdateTheme(loggedInUser, this.themeApplicationMapper.toDTO(existingTheme))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    await this.useCase.execute(options)
  }
}
