import { Logger } from '@hatsuportal/common'
import { UseCaseWithValidation } from '@hatsuportal/platform'
import { ILoginUserUseCase, ILoginUserUseCaseOptions } from './LoginUserUseCase'
import { UserName } from '../../../../domain'
import { IPasswordFactory } from '../../../../domain/authentication/IPasswordFactory'

const logger = new Logger('LoginUserUseCaseWithValidation')

export class LoginUserUseCaseWithValidation extends UseCaseWithValidation<ILoginUserUseCaseOptions> implements ILoginUserUseCase {
  constructor(private readonly useCase: ILoginUserUseCase, private readonly passwordFactory: IPasswordFactory) {
    super(logger)
  }

  async execute(options: ILoginUserUseCaseOptions): Promise<void> {
    this.logger.debug('Validating LoginUserUseCase arguments')

    const valid = this.validateDomainRules(options)
    if (valid) await this.useCase.execute(options)
  }

  private validateDomainRules(options: ILoginUserUseCaseOptions): boolean {
    this.testArgumentInstance(UserName, 'loginUserInput.username', options)
    this.testArgument<'loginUserInput'>('loginUserInput', options, (loginUserInput) => {
      const { password } = loginUserInput
      this.passwordFactory.create(password)
      return true
    })

    return true
  }
}
