import { UseCaseWithValidation, NotFoundError, AuthorizationError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IFindStoryUseCase, IFindStoryUseCaseOptions } from './FindStoryUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IStoryReadRepository } from '../../../read/IStoryReadRepository'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { PostId } from '../../../../domain'
import { StoryReadModelDTO } from '../../../dtos'
import { UserLoadResult } from '../../../acl/userManagement/outcomes/UserLoadResult'

const logger = new Logger('FindStoryUseCaseWithValidation')

export class FindStoryUseCaseWithValidation extends UseCaseWithValidation<IFindStoryUseCaseOptions> implements IFindStoryUseCase {
  constructor(
    private readonly useCase: IFindStoryUseCase,
    private readonly userGateway: IUserGateway,
    private readonly storyRepository: IStoryReadRepository,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IFindStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindStoryUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const { storyIdToFind } = options.findStoryInput
    const { loggedInUserId } = options

    const story = await this.storyRepository.findById(new PostId(storyIdToFind))
    if (!story) throw new NotFoundError()

    const valid = (await this.validateAuthorization(story, loggedInUserId)) && domainRulesValid
    if (valid) await this.useCase.execute(options)
  }

  async validateAuthorization(story: StoryReadModelDTO, loggedInUserId?: string): Promise<boolean> {
    const loadUserResult = loggedInUserId ? await this.userGateway.getUserById({ userId: loggedInUserId }) : UserLoadResult.notSet()
    const authorizationResult = this.authorizationService.canViewStory(!loadUserResult.isSuccess() ? null : loadUserResult.value, story)
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IFindStoryUseCaseOptions): boolean {
    this.testArgumentInstance(PostId, 'findStoryInput.storyIdToFind', options)

    return true
  }
}
