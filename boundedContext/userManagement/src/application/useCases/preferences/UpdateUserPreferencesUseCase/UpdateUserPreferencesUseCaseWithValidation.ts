import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { isUndefined } from 'lodash'
import { IUpdateUserPreferencesUseCase, IUpdateUserPreferencesUseCaseOptions } from './UpdateUserPreferencesUseCase'
import { IThemeRepository, ThemeId, UserId } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

const logger = new Logger('UpdateUserPreferencesUseCaseWithValidation')

export class UpdateUserPreferencesUseCaseWithValidation
  extends UseCaseWithValidation<IUpdateUserPreferencesUseCaseOptions>
  implements IUpdateUserPreferencesUseCase
{
  constructor(
    private readonly useCase: IUpdateUserPreferencesUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly themeRepository: IThemeRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateUserPreferencesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateUserPreferencesUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.updatedById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const userToUpdate = await this.userReadRepository.findById(new UserId(options.userId))
    if (!userToUpdate) throw new NotFoundError('User to update not found.')

    const authorizationResult = this.authorizationService.canUpdatePreferences(loggedInUser, userToUpdate)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    const { selectedThemeId } = options.updateUserPreferencesInput
    if (!isUndefined(selectedThemeId)) {
      const theme = await this.themeRepository.findById(new ThemeId(selectedThemeId))
      if (!theme) throw new NotFoundError(`Theme with id ${selectedThemeId} not found`)
    }

    await this.useCase.execute(options)
  }
}
