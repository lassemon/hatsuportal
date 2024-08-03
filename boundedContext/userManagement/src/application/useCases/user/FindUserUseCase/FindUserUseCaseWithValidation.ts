import { AuthenticationError, AuthorizationError, Logger, NotFoundError, UseCaseWithValidation } from '@hatsuportal/foundation'
import { IFindUserUseCase, IFindUserUseCaseOptions } from './FindUserUseCase'
import { User, UserId } from '../../../../domain'
import { IUserRepository } from '../../../repositories/IUserRepository'
import { IUserAuthorizationService } from '../../../authorization/services/UserAuthorizationService'
import { IUserApplicationMapper } from '../../../mappers/UserApplicationMapper'

const logger = new Logger('FindUserUseCaseWithValidation')

export class FindUserUseCaseWithValidation extends UseCaseWithValidation<IFindUserUseCaseOptions> implements IFindUserUseCase {
  constructor(
    private readonly useCase: IFindUserUseCase,
    private readonly userRepository: IUserRepository,
    private readonly userMapper: IUserApplicationMapper,
    private readonly authorizationService: IUserAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IFindUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const foundUser = await this.userRepository.findById(new UserId(options.findUserInput.userIdToFind))
    if (!foundUser) throw new NotFoundError(`User '${options.findUserInput.userIdToFind}' not found.`)

    const valid = this.validateAuthorization(loggedInUser, foundUser)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, userToView: User): boolean {
    const authorizationResult = this.authorizationService.canViewUser(
      this.userMapper.toDTO(loggedInUser),
      this.userMapper.toDTO(userToView)
    )
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
