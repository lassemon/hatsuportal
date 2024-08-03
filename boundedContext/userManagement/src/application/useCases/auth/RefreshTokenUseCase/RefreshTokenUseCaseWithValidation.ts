import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { IRefreshTokenUseCase, IRefreshTokenUseCaseOptions } from './RefreshTokenUseCase'

const logger = new Logger('RefreshTokenUseCaseWithValidation')

export class RefreshTokenUseCaseWithValidation extends UseCaseWithValidation<IRefreshTokenUseCaseOptions> implements IRefreshTokenUseCase {
  constructor(private readonly useCase: IRefreshTokenUseCase) {
    super(logger)
  }

  async execute(options: IRefreshTokenUseCaseOptions): Promise<void> {
    this.logger.debug('Validating RefreshTokenUseCase arguments')

    const valid = this.validateDomainRules(options)
    if (valid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: IRefreshTokenUseCaseOptions): boolean {
    this.testArgumentInstance(NonEmptyString, 'refreshToken', options)

    return true
  }
}
