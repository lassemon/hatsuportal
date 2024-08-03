import { IUpdateStoryUseCase, IUpdateStoryUseCaseOptions, IStoryRepository, PostId, Story } from '@hatsuportal/post-management'
import { IUserRepository, User, UserId } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import { AuthenticationError, AuthorizationError, NotFoundError } from '@hatsuportal/common-bounded-context'
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
    if (!loggedInUser) throw new AuthenticationError('Not logged in.')

    const existingStory = await this.storyRepository.findById(new PostId(options.updateStoryInput.updateStoryData.id))

    if (!existingStory)
      throw new NotFoundError(`Cannot update story with id ${options.updateStoryInput.updateStoryData.id} because it does not exist.`)

    const valid = this.validateAuthorization(loggedInUser, existingStory) && this.validateDomainRules(options, existingStory)

    if (valid) await this.useCase.execute(options)
  }

  private validateAuthorization(loggedInUser: User, existingStory: Story): boolean {
    const authorizationResult = this.authorizationService.canUpdateStory(loggedInUser, existingStory)
    if (!authorizationResult.isAuthorized) throw new AuthorizationError(authorizationResult.reason)

    return true
  }

  private validateDomainRules(options: IUpdateStoryUseCaseOptions, existingStory: Story): boolean {
    return this.testArgument<'updateStoryInput'>('updateStoryInput', options, (updateStoryInput) => {
      const {
        updateStoryData: { visibility, name, description, image }
      } = updateStoryInput

      if (existingStory.image && image) {
        // update function throws error if input is invalid
        existingStory.image.update({
          id: image.id,
          mimeType: image.mimeType,
          size: image.size,
          base64: image.base64
        })
      }

      // update function throws error if input is invalid
      existingStory.update({
        visibility,
        name,
        description
      })

      return true
    })
  }
}
