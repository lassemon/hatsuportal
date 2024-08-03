import {
  AuthorizationError,
  InvalidInputError,
  IUpdateStoryUseCase,
  IUpdateStoryUseCaseOptions,
  NotFoundError,
  UseCaseWithValidation
} from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import { IStoryRepository, IUserRepository, PostId, UserId } from '@hatsuportal/domain'

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
    const loggedInUser = await this.userRepository.findById(new UserId(options.updateStoryInput.loggedInUserId))
    const existingStory = await this.storyRepository.findById(new PostId(options.updateStoryInput.updateStoryData.id))

    if (!existingStory)
      throw new NotFoundError(`Cannot update story with id ${options.updateStoryInput.updateStoryData.id} because it does not exist.`)

    if (!existingStory.createdBy.equals(loggedInUser!.id)) throw new AuthorizationError('Cannot update story that is not created by you.')

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
