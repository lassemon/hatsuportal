import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IUpdateStoryUseCase, IUpdateStoryUseCaseOptions } from './UpdateStoryUseCase'
import { IStoryWriteRepository, PostId, PostVisibility, Story } from '../../../../domain'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { NonEmptyString, NonNegativeInteger } from '@hatsuportal/shared-kernel'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { IStoryApplicationMapper } from '../../../mappers/StoryApplicationMapper'

const logger = new Logger('UpdateStoryUseCaseWithValidation')

export class UpdateStoryUseCaseWithValidation extends UseCaseWithValidation<IUpdateStoryUseCaseOptions> implements IUpdateStoryUseCase {
  constructor(
    private readonly useCase: IUpdateStoryUseCase,
    private readonly userGateway: IUserGateway,
    private readonly storyRepository: IStoryWriteRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateStoryUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    const userLoadResult = await this.userGateway.getUserById({ userId: options.updatedById })
    if (userLoadResult.isFailed()) throw new AuthorizationError('Not logged in.')
    const loggedInUser = userLoadResult.value

    const existingStory = await this.storyRepository.findByIdForUpdate(new PostId(options.updateStoryInput.id))

    if (!existingStory) throw new NotFoundError(`Cannot update story with id ${options.updateStoryInput.id} because it does not exist.`)

    const valid = this.validateAuthorization(loggedInUser, existingStory) && domainRulesValid

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: UserReadModelDTO, existingStory: Story): boolean {
    const authorizationResult = this.authorizationService.canUpdateStory(loggedInUser, this.storyMapper.toDTO(existingStory))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateStoryUseCaseOptions): boolean {
    const { visibility, name, description, image } = options.updateStoryInput

    return (
      this.testArgumentInstance(PostId, 'updateStoryInput.id', options) &&
      ((visibility ?? null) !== null ? this.testArgumentInstance(PostVisibility, 'updateStoryInput.visibility', options) : true) &&
      ((name ?? null) !== null ? this.testArgumentInstance(NonEmptyString, 'updateStoryInput.name', options) : true) &&
      ((description ?? null) !== null ? this.testArgumentInstance(NonEmptyString, 'updateStoryInput.description', options) : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(NonEmptyString, 'updateStoryInput.image.mimeType', options) : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(NonNegativeInteger, 'updateStoryInput.image.size', options) : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(NonEmptyString, 'updateStoryInput.image.base64', options) : true)
    )
  }
}
