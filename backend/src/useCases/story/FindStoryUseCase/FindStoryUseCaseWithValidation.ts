import { IFindStoryUseCase, IFindStoryUseCaseOptions, PostId } from '@hatsuportal/post-management'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation } from '@hatsuportal/common-bounded-context'

const logger = new Logger('FindStoryUseCaseWithValidation')

export class FindStoryUseCaseWithValidation extends UseCaseWithValidation<IFindStoryUseCaseOptions> implements IFindStoryUseCase {
  constructor(private readonly useCase: IFindStoryUseCase) {
    super(logger)
  }

  async execute(options: IFindStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindStoryUseCase arguments')

    const valid = this.validateDomainRules(options)
    if (valid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IFindStoryUseCaseOptions): boolean {
    this.testArgumentInstance(PostId, 'findStoryInput.storyIdToFind', options)

    return true
  }
}
