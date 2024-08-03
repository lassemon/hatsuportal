import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'
import { IGetAllUsersUseCase, IGetAllUsersUseCaseOptions } from './GetAllUsersUseCase'
import { UserId, User, IUserRepository } from '../../../../domain'

const logger = new Logger('GetAllUsersUseCaseWithValidation')

export class GetAllUsersUseCaseWithValidation extends UseCaseWithValidation<IGetAllUsersUseCaseOptions> implements IGetAllUsersUseCase {
  constructor(
    private readonly useCase: IGetAllUsersUseCase,
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IGetAllUsersUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetAllUsersUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const valid = this.validateAuthorization(loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(user: User): boolean {
    const authorizationResult = this.authorizationService.canListAllUsers(this.userMapper.toDTO(user))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
