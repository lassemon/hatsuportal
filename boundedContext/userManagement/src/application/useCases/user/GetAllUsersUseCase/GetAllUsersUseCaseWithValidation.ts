import { AuthenticationError, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { UserReadModelDTO } from '../../../dtos'
import { IGetAllUsersUseCase, IGetAllUsersUseCaseOptions } from './GetAllUsersUseCase'
import { UserId } from '../../../../domain'

const logger = new Logger('GetAllUsersUseCaseWithValidation')

export class GetAllUsersUseCaseWithValidation extends UseCaseWithValidation<IGetAllUsersUseCaseOptions> implements IGetAllUsersUseCase {
  constructor(
    private readonly useCase: IGetAllUsersUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IGetAllUsersUseCaseOptions): Promise<void> {
    this.logger.debug('Validating GetAllUsersUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const valid = this.validateAuthorization(loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(user: UserReadModelDTO): boolean {
    const authorizationResult = this.authorizationService.canListAllUsers(user)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
