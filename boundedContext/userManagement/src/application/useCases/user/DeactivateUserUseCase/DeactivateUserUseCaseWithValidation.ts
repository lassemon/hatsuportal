import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IDeactivateUserUseCase, IDeactivateUserUseCaseOptions } from './DeactivateUserUseCase'
import { UserId } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { UserReadModelDTO } from '../../../dtos'

const logger = new Logger('DeactivateUserUseCaseWithValidation')

export class DeactivateUserUseCaseWithValidation
  extends UseCaseWithValidation<IDeactivateUserUseCaseOptions>
  implements IDeactivateUserUseCase
{
  constructor(
    private readonly useCase: IDeactivateUserUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeactivateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeactivateUserUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.deactivatingUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = await this.validateAuthorization(loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: UserReadModelDTO): Promise<boolean> {
    const authorizationResult = this.authorizationService.canDeactivateUser(loggedInUser)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
