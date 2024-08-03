import { LoginUserUseCaseWithValidation } from '../../../application/useCases/auth/LoginUserUseCase/LoginUserUseCaseWithValidation'
import { vi } from 'vitest'
import { ILoginUserUseCase } from '@hatsuportal/user-management'
import { AuthValidationScenarioBase } from './AuthValidationScenarioBase'
import { LoginUserInputDTO } from '@hatsuportal/user-management'

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
    const wrapped = new LoginUserUseCaseWithValidation(this.innerUseCaseMock)

    await this.capture(() => wrapped.execute({ loginUserInput: input, loginSuccess: vi.fn() }))

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
