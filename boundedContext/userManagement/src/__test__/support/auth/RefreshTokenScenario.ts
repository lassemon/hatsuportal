import { AuthScenarioBase } from './AuthScenarioBase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { RefreshTokenUseCase } from '../../../application/useCases/auth/RefreshTokenUseCase'

export class RefreshTokenScenario extends AuthScenarioBase<string, 'tokenRefreshed'> {
  private readonly tokenServiceMock = Fixture.tokenServiceMock()

  static given() {
    return new RefreshTokenScenario()
  }

  private constructor() {
    super(['tokenRefreshed'])
  }

  withActiveUser(user = Fixture.userMock()) {
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withInactiveUser(user = Fixture.userMock({ active: false })) {
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withoutUser() {
    this.userRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  verifyTokenWillFail(error = new Error('invalid')) {
    this.tokenServiceMock.verifyRefreshToken = vi.fn().mockImplementation(() => {
      throw error
    })
    return this
  }

  async whenExecutedWithInput(refreshToken: string) {
    const useCase = new RefreshTokenUseCase(this.userRepository, this.tokenServiceMock)

    await this.capture(() =>
      useCase.execute({
        refreshToken,
        tokenRefreshed: this.spyOutputBoundary('tokenRefreshed')
      })
    )

    return this
  }
}
