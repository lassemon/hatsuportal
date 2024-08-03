import { IFindMyStoriesUseCase, IFindMyStoriesUseCaseOptions } from '@hatsuportal/post-management'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation, InvalidInputError } from '@hatsuportal/common-bounded-context'

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

    const valid = this.validateRequiredFields(options)
    if (valid) await this.useCase.execute(options)
  }

  private validateRequiredFields(options: IFindMyStoriesUseCaseOptions): boolean {
    return this.testArgument<'loggedInUserId'>('loggedInUserId', options, (loggedInUserId) => {
      if (!loggedInUserId) throw new InvalidInputError('User id is required')
      return true
    })
  }
}
