import { UseCaseWithValidation } from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/common'
import { IFindAllTagsUseCase, IFindAllTagsUseCaseOptions } from './FindAllTagsUseCase'

const logger = new Logger('FindAllTagsUseCaseWithValidation')

export class FindAllTagsUseCaseWithValidation extends UseCaseWithValidation<IFindAllTagsUseCaseOptions> implements IFindAllTagsUseCase {
  constructor(private readonly useCase: IFindAllTagsUseCase) {
    super(logger)
  }

  async execute(options: IFindAllTagsUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindAllTagsUseCase arguments')
    const domainRulesValid = this.validateDomainRules(options)

    if (domainRulesValid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IFindAllTagsUseCaseOptions): boolean {
    // TODO, validation
    return true
  }
}
