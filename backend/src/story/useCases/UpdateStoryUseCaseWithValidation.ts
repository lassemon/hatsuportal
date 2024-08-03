import { IUpdateStoryUseCase, IUpdateStoryUseCaseOptions, UseCaseWithValidation } from '@hatsuportal/application'
import { Logger } from '@hatsuportal/common'
import { User } from '@hatsuportal/domain'

const logger = new Logger('UpdateStoryUseCaseWithValidation')

export class UpdateStoryUseCaseWithValidation extends UseCaseWithValidation<IUpdateStoryUseCaseOptions> implements IUpdateStoryUseCase {
  constructor(private readonly useCase: IUpdateStoryUseCase) {
    super(logger)
  }

  async execute(options: IUpdateStoryUseCaseOptions): Promise<void> {
    this.logger.debug('Validating UpdateStoryUseCase arguments')

    //TODO how to validate updateStoryRequest
    const valid = this.testArgumentInstance(User, 'user', options)

    if (valid) await this.useCase.execute(options)
  }
}
