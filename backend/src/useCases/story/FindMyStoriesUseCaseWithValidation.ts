import { IFindMyStoriesUseCase, IFindMyStoriesUseCaseOptions, UseCaseWithValidation } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import { User } from '@hatsuportal/domain'

const logger = new Logger('FindMyStoriesUseCaseWithValidation')

export class FindMyStoriesUseCaseWithValidation
  extends UseCaseWithValidation<IFindMyStoriesUseCaseOptions>
  implements IFindMyStoriesUseCase
{
  constructor(private readonly useCase: IFindMyStoriesUseCase) {
    super(logger)
  }

  async execute(options: IFindMyStoriesUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindMyStoriesUseCase arguments')

    const valid = this.testArgumentInstance(User, 'user', options)

    if (valid) await this.useCase.execute(options)
  }
}
