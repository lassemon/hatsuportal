import { AuthValidationScenarioBase } from './AuthValidationScenarioBase'
import { RefreshTokenUseCaseWithValidation } from '../../../application/useCases/auth/RefreshTokenUseCase/RefreshTokenUseCaseWithValidation'
import { IRefreshTokenUseCase } from '@hatsuportal/user-management'
import { vi } from 'vitest'

export class RefreshTokenValidationScenario extends AuthValidationScenarioBase<string, 'tokenRefreshed'> {
  private readonly innerUseCaseMock: IRefreshTokenUseCase = {
    execute: vi.fn().mockResolvedValue(undefined)
  }

  static given() {
    return new RefreshTokenValidationScenario()
  }

  private constructor() {
    super(['tokenRefreshed'])
  }

  async whenExecutedWithInput(refreshToken: string) {
    const useCase = new RefreshTokenUseCaseWithValidation(this.innerUseCaseMock)

    await this.capture(() =>
      useCase.execute({
        refreshToken,
        tokenRefreshed: this.spyOutputBoundary('tokenRefreshed')
      })
    )

    return this
  }

  get useCaseMock() {
    return this.innerUseCaseMock
  }
}
