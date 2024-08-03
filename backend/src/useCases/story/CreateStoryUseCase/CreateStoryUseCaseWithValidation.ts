import { ICreateStoryUseCase, ICreateStoryUseCaseOptions, PostVisibility } from '@hatsuportal/post-management'
import { Logger } from '@hatsuportal/common'
import {
  AuthorizationError,
  Base64Image,
  FileSize,
  MimeType,
  NonEmptyString,
  UseCaseWithValidation
} from '@hatsuportal/common-bounded-context'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { IAuthorizationService } from '/infrastructure/auth/services/AuthorizationService'

const logger = new Logger('CreateStoryUseCaseWithValidation')

export class CreateStoryUseCaseWithValidation extends UseCaseWithValidation<ICreateStoryUseCaseOptions> implements ICreateStoryUseCase {
  constructor(
    private readonly useCase: ICreateStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly authorizationService: IAuthorizationService
  ) {
    super(logger)
  }

  async execute(options: ICreateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStoryUseCase arguments')

    const loggedInUser = await this.userRepository.findById(new UserId(options.createStoryInput.loggedInUserId))
    if (!loggedInUser) throw new AuthorizationError('Not logged in.')

    const valid = this.validateAuthorization(loggedInUser) && this.validateDomainRules(options)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User): boolean {
    const authorizationResult = this.authorizationService.canCreateStory(loggedInUser)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: ICreateStoryUseCaseOptions): boolean {
    const { createStoryData } = options.createStoryInput
    const { image } = createStoryData
    this.testArgumentInstance(PostVisibility, 'createStoryInput.createStoryData.visibility', options)
    this.testArgumentInstance(NonEmptyString, 'createStoryInput.createStoryData.name', options)
    this.testArgumentInstance(NonEmptyString, 'createStoryInput.createStoryData.description', options)

    if (image) {
      this.testArgumentInstance(MimeType, 'createStoryInput.createStoryData.image.mimeType', options)
      this.testArgumentInstance(FileSize, 'createStoryInput.createStoryData.image.size', options)
      this.testArgumentInstance(Base64Image, 'createStoryInput.createStoryData.image.base64', options)
    }

    return true
  }
}
