import { IFindStoryUseCase, IFindStoryUseCaseOptions, UseCaseWithValidation } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
//import { PostId, User } from '@hatsuportal/domain'

const logger = new Logger('FindStoryUseCaseWithValidation')

export class FindStoryUseCaseWithValidation extends UseCaseWithValidation<IFindStoryUseCaseOptions> implements IFindStoryUseCase {
  constructor(private readonly useCase: IFindStoryUseCase) {
    super(logger)
  }

  async execute(options: IFindStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindStoryUseCase arguments')

    const valid = true //this.testArgumentInstance(User, 'user', options) && this.testArgumentInstance(PostId, 'storyId', options)

    if (valid) await this.useCase.execute(options)
  }
}
