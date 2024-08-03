import { Logger } from '@hatsuportal/common'
import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IDeleteStoryUseCase, IDeleteStoryUseCaseOptions, IStoryRepository, PostId } from '@hatsuportal/post-management'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('DeleteStoryUseCaseWithValidation')

export class DeleteStoryUseCaseWithValidation extends UseCaseWithValidation<IDeleteStoryUseCaseOptions> implements IDeleteStoryUseCase {
  constructor(
    private readonly useCase: IDeleteStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeleteStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeleteStoryUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.deleteStoryInput.loggedInUserId))
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const valid = await this.validateAuthorization(options, loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(options: IDeleteStoryUseCaseOptions, loggedInUser: User): Promise<boolean> {
    const existingStory = await this.storyRepository.findById(new PostId(options.deleteStoryInput.storyIdToDelete))

    if (!existingStory)
      throw new NotFoundError(`Cannot delete a story with id ${options.deleteStoryInput.storyIdToDelete} because it does not exist.`)

    const authorizationResult = this.authorizationService.canDeleteStory(loggedInUser, existingStory)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
