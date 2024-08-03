import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IRemoveImageFromStoryUseCase, IRemoveImageFromStoryUseCaseOptions } from './RemoveImageFromStoryUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IStoryWriteRepository, PostId, Story } from '../../../../domain'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { IStoryApplicationMapper } from '../../../mappers/StoryApplicationMapper'

const logger = new Logger('RemoveImageFromStoryUseCaseWithValidation')

export class RemoveImageFromStoryUseCaseWithValidation
  extends UseCaseWithValidation<IRemoveImageFromStoryUseCaseOptions>
  implements IRemoveImageFromStoryUseCase
{
  constructor(
    private readonly useCase: IRemoveImageFromStoryUseCase,
    private readonly userGateway: IUserGateway,
    private readonly storyRepository: IStoryWriteRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IRemoveImageFromStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating RemoveImageFromStoryUseCase arguments')

    const loadUserResult = await this.userGateway.getUserById({ userId: options.removedById })
    if (loadUserResult.isFailed()) throw new AuthorizationError('Not logged in.')

    const story = await this.storyRepository.findByIdForUpdate(new PostId(options.removeImageFromStoryInput.storyIdFromWhichToRemoveImage))
    if (!story) throw new NotFoundError('Story not found.')

    const valid = (await this.validateAuthorization(loadUserResult.value, story)) && this.validateDomainRules(options)
    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(loggedInUser: UserReadModelDTO, story: Story): Promise<boolean> {
    const authorizationResult = this.authorizationService.canRemoveImageFromStory(loggedInUser, this.storyMapper.toDTO(story))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IRemoveImageFromStoryUseCaseOptions): boolean {
    this.testArgumentInstance(PostId, 'removeImageFromStoryInput.storyIdFromWhichToRemoveImage', options)
    return true
  }
}
