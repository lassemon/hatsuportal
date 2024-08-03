import { UseCaseWithValidation, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IFindMyStoriesUseCase, IFindMyStoriesUseCaseOptions } from './FindMyStoriesUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'

const logger = new Logger('FindMyStoriesUseCaseWithValidation')

export class FindMyStoriesUseCaseWithValidation
  extends UseCaseWithValidation<IFindMyStoriesUseCaseOptions>
  implements IFindMyStoriesUseCase
{
  constructor(private readonly useCase: IFindMyStoriesUseCase, private readonly userGateway: IUserGateway) {
    super(logger)
  }

  async execute(options: IFindMyStoriesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindMyStoriesUseCase arguments')

    const loggedInUser = await this.userGateway.getUserById({ userId: options.loggedInUserId })
    if (loggedInUser.isFailed()) throw new AuthorizationError('Not logged in.')

    await this.useCase.execute(options)
  }
}
