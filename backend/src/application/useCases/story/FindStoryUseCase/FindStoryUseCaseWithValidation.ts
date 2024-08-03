import { IFindStoryUseCase, IFindStoryUseCaseOptions, IStoryRepository, PostId, Story } from '@hatsuportal/post-management'
import { Logger } from '@hatsuportal/common'
import { AuthorizationError, NotFoundError, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IAuthorizationService } from '../../../../application/services/IAuthorizationService'
import { IUserRepository, UserId } from '@hatsuportal/user-management'

const logger = new Logger('FindStoryUseCaseWithValidation')

export class FindStoryUseCaseWithValidation extends UseCaseWithValidation<IFindStoryUseCaseOptions> implements IFindStoryUseCase {
  constructor(
    private readonly useCase: IFindStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IFindStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindStoryUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const { storyIdToFind, loggedInUserId } = options.findStoryInput

    const story = await this.storyRepository.findById(new PostId(storyIdToFind))
    if (!story) throw new NotFoundError()

    const valid = (await this.validateAuthorization(story, loggedInUserId)) && domainRulesValid
    if (valid) await this.useCase.execute(options)
  }

  async validateAuthorization(story: Story, loggedInUserId?: string): Promise<boolean> {
    const loggedInUser = loggedInUserId ? await this.userRepository.findById(new UserId(loggedInUserId)) : null
    const authorizationResult = this.authorizationService.canViewStory(loggedInUser, story)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IFindStoryUseCaseOptions): boolean {
    this.testArgumentInstance(PostId, 'findStoryInput.storyIdToFind', options)

    return true
  }
}
