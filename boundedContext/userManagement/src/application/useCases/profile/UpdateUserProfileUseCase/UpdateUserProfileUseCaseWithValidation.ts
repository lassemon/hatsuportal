import { AuthenticationError, AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { isUndefined } from 'lodash'
import { IUpdateUserProfileUseCase, IUpdateUserProfileUseCaseOptions } from './UpdateUserProfileUseCase'
import { Bio, StatusMessage, UserId } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'

const logger = new Logger('UpdateUserProfileUseCaseWithValidation')

export class UpdateUserProfileUseCaseWithValidation
  extends UseCaseWithValidation<IUpdateUserProfileUseCaseOptions>
  implements IUpdateUserProfileUseCase
{
  constructor(
    private readonly useCase: IUpdateUserProfileUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateUserProfileUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateUserProfileUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.updatedById))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const userToUpdate = await this.userReadRepository.findById(new UserId(options.userId))
    if (!userToUpdate) throw new NotFoundError('User to update not found.')

    const authorizationResult = this.authorizationService.canUpdateProfile(loggedInUser, userToUpdate)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    const domainRulesValid = this.validateDomainRules(options)
    if (domainRulesValid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IUpdateUserProfileUseCaseOptions): boolean {
    const { bio, statusMessage } = options.updateUserProfileInput
    return (
      (isUndefined(bio) ? true : this.testArgumentInstance(Bio, 'updateUserProfileInput.bio', options)) &&
      (isUndefined(statusMessage) ? true : this.testArgumentInstance(StatusMessage, 'updateUserProfileInput.statusMessage', options))
    )
  }
}
