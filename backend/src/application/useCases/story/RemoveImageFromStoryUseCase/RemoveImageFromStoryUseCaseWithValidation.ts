import { Logger } from '@hatsuportal/common'
import { AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import {
  IRemoveImageFromStoryUseCase,
  IRemoveImageFromStoryUseCaseOptions,
  IStoryRepository,
  PostId,
  Story
} from '@hatsuportal/post-management'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '../../../../application/services/IAuthorizationService'

const logger = new Logger('RemoveImageFromStoryUseCaseWithValidation')

export class RemoveImageFromStoryUseCaseWithValidation
  extends UseCaseWithValidation<IRemoveImageFromStoryUseCaseOptions>
  implements IRemoveImageFromStoryUseCase
{
  constructor(
    private readonly useCase: IRemoveImageFromStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IRemoveImageFromStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating RemoveImageFromStoryUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.removeImageFromStoryInput.loggedInUserId))
    if (!loggedInUser) throw new AuthorizationError('Not logged in.')

    const story = await this.storyRepository.findById(new PostId(options.removeImageFromStoryInput.storyIdFromWhichToRemoveImage))
    if (!story) throw new NotFoundError('Story not found.')

    const valid = await this.validateAuthorization(loggedInUser, story)
    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: User, story: Story): Promise<boolean> {
    const authorizationResult = this.authorizationService.canRemoveImageFromStory(loggedInUser, story)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
