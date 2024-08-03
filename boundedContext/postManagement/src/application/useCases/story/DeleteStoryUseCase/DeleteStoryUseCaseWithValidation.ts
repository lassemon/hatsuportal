import { UseCaseWithValidation, AuthorizationError, NotFoundError } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IDeleteStoryUseCase, IDeleteStoryUseCaseOptions } from './DeleteStoryUseCase'
import { IUserGateway } from '../../../acl/userManagement/IUserGateway'
import { IStoryWriteRepository, PostId } from '../../../../domain'
import { IPostAuthorizationService } from '../../../authorization/services/PostAuthorizationService'
import { UserReadModelDTO } from '../../../dtos/user/UserReadModelDTO'
import { IStoryApplicationMapper } from '../../../mappers/StoryApplicationMapper'

const logger = new Logger('DeleteStoryUseCaseWithValidation')

export class DeleteStoryUseCaseWithValidation extends UseCaseWithValidation<IDeleteStoryUseCaseOptions> implements IDeleteStoryUseCase {
  constructor(
    private readonly useCase: IDeleteStoryUseCase,
    private readonly userGateway: IUserGateway,
    private readonly storyRepository: IStoryWriteRepository,
    private readonly storyMapper: IStoryApplicationMapper,
    private readonly authorizationService: IPostAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IDeleteStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeleteStoryUseCase arguments')

    const loadUserResult = await this.userGateway.getUserById({ userId: options.deletedById })

    if (loadUserResult.isFailed()) throw new AuthorizationError('Not logged in.')
    const loggedInUser = loadUserResult.value

    const valid = await this.validateAuthorization(options, loggedInUser)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(options: IDeleteStoryUseCaseOptions, loggedInUser: UserReadModelDTO): Promise<boolean> {
    const existingStory = await this.storyRepository.findByIdForUpdate(new PostId(options.deleteStoryInput.storyIdToDelete))

    if (!existingStory)
      throw new NotFoundError(`Cannot delete a story with id ${options.deleteStoryInput.storyIdToDelete} because it does not exist.`)

    const authorizationResult = this.authorizationService.canDeleteStory(loggedInUser, this.storyMapper.toDTO(existingStory))
    if (!authorizationResult.allowed) throw new AuthorizationError(authorizationResult.reason)

    return true
  }
}
