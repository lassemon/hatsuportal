import {
  IUpdateStoryUseCase,
  IUpdateStoryUseCaseOptions,
  IStoryRepository,
  PostId,
  Story,
  PostVisibility
} from '@hatsuportal/post-management'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import {
  AuthorizationError,
  Base64Image,
  FileSize,
  ImageId,
  MimeType,
  NonEmptyString,
  NotFoundError
} from '@hatsuportal/common-bounded-context'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('UpdateStoryUseCaseWithValidation')

export class UpdateStoryUseCaseWithValidation extends UseCaseWithValidation<IUpdateStoryUseCaseOptions> implements IUpdateStoryUseCase {
  constructor(
    private readonly useCase: IUpdateStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly storyRepository: IStoryRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: IUpdateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateStoryUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.updateStoryInput.loggedInUserId))
    if (!loggedInUser) throw new AuthorizationError('Not logged in.')

    const existingStory = await this.storyRepository.findById(new PostId(options.updateStoryInput.updateStoryData.id))

    if (!existingStory)
      throw new NotFoundError(`Cannot update story with id ${options.updateStoryInput.updateStoryData.id} because it does not exist.`)

    const valid = this.validateAuthorization(loggedInUser, existingStory) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, existingStory: Story): boolean {
    const authorizationResult = this.authorizationService.canUpdateStory(loggedInUser, existingStory)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateStoryUseCaseOptions): boolean {
    const { updateStoryData } = options.updateStoryInput
    const { visibility, name, description, image } = updateStoryData

    return (
      this.testArgumentInstance(PostId, 'updateStoryInput.updateStoryData.id', options) &&
      ((visibility ?? null) !== null
        ? this.testArgumentInstance(PostVisibility, 'updateStoryInput.updateStoryData.visibility', options)
        : true) &&
      ((name ?? null) !== null ? this.testArgumentInstance(NonEmptyString, 'updateStoryInput.updateStoryData.name', options) : true) &&
      ((description ?? null) !== null
        ? this.testArgumentInstance(NonEmptyString, 'updateStoryInput.updateStoryData.description', options)
        : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(ImageId, 'updateStoryInput.updateStoryData.image.id', options) : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(MimeType, 'updateStoryInput.updateStoryData.image.mimeType', options) : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(FileSize, 'updateStoryInput.updateStoryData.image.size', options) : true) &&
      ((image ?? null) !== null ? this.testArgumentInstance(Base64Image, 'updateStoryInput.updateStoryData.image.base64', options) : true)
    )
  }
}
