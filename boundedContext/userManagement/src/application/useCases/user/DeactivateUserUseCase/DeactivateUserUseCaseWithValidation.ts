import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IDeactivateUserUseCase, IDeactivateUserUseCaseOptions } from './DeactivateUserUseCase'
import { User, UserId, IUserRepository } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'

const logger = new Logger('DeactivateUserUseCaseWithValidation')

export class DeactivateUserUseCaseWithValidation
  extends UseCaseWithValidation<IDeactivateUserUseCaseOptions>
  implements IDeactivateUserUseCase
{
  constructor(
    private readonly useCase: IDeactivateUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeactivateUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeactivateUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.deactivatingUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = await this.validateAuthorization(loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: User): Promise<boolean> {
    const authorizationResult = this.authorizationService.canDeactivateUser(this.userMapper.toDTO(loggedInUser))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
