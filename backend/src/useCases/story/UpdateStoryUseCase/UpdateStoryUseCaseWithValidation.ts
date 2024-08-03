import { IUpdateStoryUseCase, IUpdateStoryUseCaseOptions, IStoryRepository, PostId } from '@hatsuportal/post-management'
import { IUserRepository, UserId as UserIdFromUserManagement } from '@hatsuportal/user-management'
import { Logger } from '@hatsuportal/common'
import { AuthorizationError, InvalidInputError, NotFoundError } from '@hatsuportal/common-bounded-context'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'

const logger = new Logger('UpdateStoryUseCaseWithValidation')

export class UpdateStoryUseCaseWithValidation extends UseCaseWithValidation<IUpdateStoryUseCaseOptions> implements IUpdateStoryUseCase {
  constructor(
    private readonly useCase: IUpdateStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly storyRepository: IStoryRepository
  ) {
    super(logger)
  }

  async execute(options: IUpdateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateStoryUseCase arguments')

    const valid = (await this.validateAuthorization(options)) && this.validateRequiredFields(options)

    if (valid) await this.useCase.execute(options)
  }

  private async validateAuthorization(options: IUpdateStoryUseCaseOptions): Promise<boolean> {
    const loggedInUser = await this.userRepository.findById(new UserIdFromUserManagement(options.updateStoryInput.loggedInUserId))
    const existingStory = await this.storyRepository.findById(new PostId(options.updateStoryInput.updateStoryData.id))

    if (!existingStory)
      throw new NotFoundError(`Cannot update story with id ${options.updateStoryInput.updateStoryData.id} because it does not exist.`)

    // TODO: remove isCreator and use Policy Based Access Control instead
    if (existingStory.createdById.value !== loggedInUser!.id.value)
      throw new AuthorizationError('Cannot update story that is not created by you.')

    return true
  }

  private validateRequiredFields(options: IUpdateStoryUseCaseOptions): boolean {
    return this.testArgument<'updateStoryInput'>('updateStoryInput', options, (createStoryInput) => {
      const { id } = createStoryInput.updateStoryData
      if (!id) throw new InvalidInputError('Story id is required')
      return true
    })
  }
}
