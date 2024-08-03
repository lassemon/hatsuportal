import { IFindImageUseCase, IFindImageUseCaseOptions, ImageId, UseCaseWithValidation } from '@hatsuportal/common-bounded-context'
import { Logger } from '@hatsuportal/common'

const logger = new Logger('FindImageUseCaseWithValidation')

export class FindImageUseCaseWithValidation extends UseCaseWithValidation<IFindImageUseCaseOptions> implements IFindImageUseCase {
  constructor(private readonly useCase: IFindImageUseCase) {
    super(logger)
  }

  async execute(options: IFindImageUseCaseOptions): Promise<void> {
    this.logger.debug('Validating FindImageUseCase arguments')

    const valid = this.validateDomainRules(options)
    if (valid) await this.useCase.execute(options)

    await this.useCase.execute(options)
  }

  private validateDomainRules(options: IFindImageUseCaseOptions): boolean {
    this.testArgumentInstance(ImageId, 'imageId', options)

    return true
  }
}
