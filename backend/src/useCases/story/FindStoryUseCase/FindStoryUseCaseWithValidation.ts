import { IFindStoryUseCase, IFindStoryUseCaseOptions } from '@hatsuportal/post-management'
import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation, InvalidInputError } from '@hatsuportal/common-bounded-context'

const logger = new Logger('FindStoryUseCaseWithValidation')

export class FindStoryUseCaseWithValidation extends UseCaseWithValidation<IFindStoryUseCaseOptions> implements IFindStoryUseCase {
  constructor(private readonly useCase: IFindStoryUseCase) {
    super(logger)
  }

  async execute(options: IFindStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindStoryUseCase arguments')

    const valid = this.validateRequiredFields(options)
    if (valid) await this.useCase.execute(options)
  }

  private validateRequiredFields(options: IFindStoryUseCaseOptions): boolean {
    return this.testArgument<'findStoryInput'>('findStoryInput', options, (findStoryInput) => {
      const { storyIdToFind } = findStoryInput
      if (!storyIdToFind) throw new InvalidInputError('Id of which story to find is required')
      return true
    })
  }
}
