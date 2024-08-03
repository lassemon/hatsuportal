import { Logger, UseCaseWithValidation } from '@hatsuportal/foundation'
import { ILoginUserUseCase, ILoginUserUseCaseOptions } from './LoginUserUseCase'
import { Password, UserName } from '../../../../domain'

const logger = new Logger('LoginUserUseCaseWithValidation')

export class LoginUserUseCaseWithValidation extends UseCaseWithValidation<ILoginUserUseCaseOptions> implements ILoginUserUseCase {
  constructor(private readonly useCase: ILoginUserUseCase) {
    super(logger)
  }

  async execute(options: ILoginUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating LoginUserUseCase arguments')

    const valid = this.validateDomainRules(options)
    if (valid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: ILoginUserUseCaseOptions): boolean {
    this.testArgumentInstance(UserName, 'loginUserInput.username', options)
    this.testArgumentInstance(Password, 'loginUserInput.password', options)

    return true
  }
}
