import { IFindMyStoriesUseCase, IFindMyStoriesUseCaseOptions } from '@hatsuportal/post-management'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation, AuthorizationError } from '@hatsuportal/common-bounded-context'
import { IUserRepository, UserId } from '@hatsuportal/user-management'

const logger = new Logger('FindMyStoriesUseCaseWithValidation')

export class FindMyStoriesUseCaseWithValidation
  extends UseCaseWithValidation<IFindMyStoriesUseCaseOptions>
  implements IFindMyStoriesUseCase
{
  constructor(private readonly useCase: IFindMyStoriesUseCase, private readonly userRepository: IUserRepository) {
    super(logger)
  }

  async execute(options: IFindMyStoriesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindMyStoriesUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.loggedInUserId))
    if (!loggedInUser) throw new AuthorizationError('Not logged in.')

    await this.useCase.execute(options)
  }
}
