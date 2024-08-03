import { vi } from 'vitest'
import { AuthValidationScenarioBase } from './AuthValidationScenarioBase'
import { LoginUserInputDTO } from '../../../application'
import { ILoginUserUseCase, LoginUserUseCaseWithValidation } from '../../../application/useCases/auth/LoginUserUseCase'

export class LoginUserValidationScenario extends AuthValidationScenarioBase<LoginUserInputDTO, 'loginSuccess'> {
  private readonly innerUseCaseMock: ILoginUserUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  static given() {
    return new LoginUserValidationScenario()
  }

  private constructor() {
    super(['loginSuccess'])
  }

  async whenExecutedWithInput(input: LoginUserInputDTO) {
    const wrapped = new LoginUserUseCaseWithValidation(this.innerUseCaseMock, this.passwordFactory)

    await this.capture(() => wrapped.execute({ loginUserInput: input, loginSuccess: vi.fn() }))

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
