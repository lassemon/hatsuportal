import { ICreateStoryUseCase, ICreateStoryUseCaseOptions, UseCaseWithValidation } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import { PostId, Image, Story, User } from '@hatsuportal/domain'

const logger = new Logger('CreateStoryUseCaseWithValidation')

export class CreateStoryUseCaseWithValidation extends UseCaseWithValidation<ICreateStoryUseCaseOptions> implements ICreateStoryUseCase {
  constructor(private readonly useCase: ICreateStoryUseCase) {
    super(logger)
  }

  async execute(options: ICreateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating CreateStoryUseCase arguments')

    const valid =
      this.testArgumentInstance(User, 'user', options) &&
      this.testArgumentInstance(PostId, 'storyId', options) &&
      this.testArgument('createUserRequest.story', options, (story) => Story.canCreate(story)) &&
      this.testArgument('createUserRequest.image', options, (story) => Image.canCreate(story))

    if (valid) await this.useCase.execute(options)
  }
}
