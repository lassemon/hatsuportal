import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { IFindUserUseCase, IFindUserUseCaseOptions } from './FindUserUseCase'
import { UserId } from '../../../../domain'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserReadRepository } from '../../../read/IUserReadRepository'
import { UserReadModelDTO } from '../../../dtos'

const logger = new Logger('FindUserUseCaseWithValidation')

export class FindUserUseCaseWithValidation extends UseCaseWithValidation<IFindUserUseCaseOptions> implements IFindUserUseCase {
  constructor(
    private readonly useCase: IFindUserUseCase,
    private readonly userReadRepository: IUserReadRepository,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IFindUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindUserUseCase arguments')

    const loggedInUser = await this.userReadRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const foundUser = await this.userReadRepository.findById(new UserId(options.findUserInput.userIdToFind))
    if (!foundUser) throw new NotFoundError(`User '${options.findUserInput.userIdToFind}' not found.`)

    const valid = this.validateAuthorization(loggedInUser, foundUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, userToView: UserReadModelDTO): boolean {
    const authorizationResult = this.authorizationService.canViewUser(loggedInUser, userToView)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
