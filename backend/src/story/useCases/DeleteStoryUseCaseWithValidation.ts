import { IDeleteStoryUseCase, IDeleteStoryUseCaseOptions, UseCaseWithValidation } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import { PostId, User } from '@hatsuportal/domain'

const logger = new Logger('DeleteStoryUseCaseWithValidation')

export class DeleteStoryUseCaseWithValidation extends UseCaseWithValidation<IDeleteStoryUseCaseOptions> implements IDeleteStoryUseCase {
  constructor(private readonly useCase: IDeleteStoryUseCase) {
    super(logger)
  }

  async execute(options: IDeleteStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating DeleteStoryUseCase arguments')

    const valid = this.testArgumentInstance(User, 'user', options) && this.testArgumentInstance(PostId, 'storyId', options)

    if (valid) await this.useCase.execute(options)
  }
}
