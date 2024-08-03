import { AuthenticationError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IFindUserUseCase, IFindUserUseCaseOptions, IUserRepository, UserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('FindUserUseCaseWithValidation')

export class FindUserUseCaseWithValidation extends UseCaseWithValidation<IFindUserUseCaseOptions> implements IFindUserUseCase {
  constructor(private readonly useCase: IFindUserUseCase, private readonly userRepository: IUserRepository) {
    super(logger)
  }

  async execute(options: IFindUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindUserUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.findUserInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('User not logged in.')

    const valid = this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IFindUserUseCaseOptions): boolean {
    const loggedInUserIdIsValid = this.testArgumentInstance(UserId, 'findUserInput.loggedInUserId', options)
    const userIdToFindIsValid = this.testArgumentInstance(UserId, 'findUserInput.userIdToFind', options)

    return loggedInUserIdIsValid && userIdToFindIsValid
  }
}
