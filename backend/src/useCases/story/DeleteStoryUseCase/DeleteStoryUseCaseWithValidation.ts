import {
  AuthorizationError,
  IDeleteStoryUseCase,
  IDeleteStoryUseCaseOptions,
  InvalidInputError,
  NotFoundError,
  UseCaseWithValidation
} from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import { IStoryRepository, IUserRepository, PostId, UserId } from '@hatsuportal/domain'

const logger = new Logger('DeleteStoryUseCaseWithValidation')

export class DeleteStoryUseCaseWithValidation extends UseCaseWithValidation<IDeleteStoryUseCaseOptions> implements IDeleteStoryUseCase {
  constructor(
    private readonly useCase: IDeleteStoryUseCase,
    private readonly userRepository: IUserRepository,
    private readonly storyRepository: IStoryRepository
  ) {
    super(logger)
  }

  async execute(options: IDeleteStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeleteStoryUseCase arguments')

    const valid = this.validateRequiredFields(options) && (await this.validateAuthorization(options))

    if (valid) await this.useCase.execute(options)
  }

  private validateRequiredFields(options: IDeleteStoryUseCaseOptions): boolean {
    return this.testArgument<'deleteStoryInput'>('deleteStoryInput', options, (createStoryInput) => {
      const { loggedInUserId, storyIdToDelete } = createStoryInput
      if (!loggedInUserId) throw new InvalidInputError('User id is required')
      if (!storyIdToDelete) throw new InvalidInputError('Id of which story to delete is required')
      return true
    })
  }

  private async validateAuthorization(options: IDeleteStoryUseCaseOptions): Promise<boolean> {
    const loggedInUser = await this.userRepository.findById(new UserId(options.deleteStoryInput.loggedInUserId))
    const existingStory = await this.storyRepository.findById(new PostId(options.deleteStoryInput.storyIdToDelete))

    if (!existingStory)
      throw new NotFoundError(`Cannot delete a story with id ${options.deleteStoryInput.storyIdToDelete} because it does not exist.`)

    if (!existingStory.createdBy.equals(loggedInUser!.id) && !loggedInUser?.isAdmin())
      throw new AuthorizationError('Cannot delete a story that is not created by you.')

    return true
  }
}
