import { AuthScenarioBase } from './AuthScenarioBase'
import { RefreshTokenUseCase } from '../../../application/useCases/auth/RefreshTokenUseCase/RefreshTokenUseCase'
import * as Fixture from '../../testFactory'
import { vi } from 'vitest'

export class RefreshTokenScenario extends AuthScenarioBase<string, 'tokenRefreshed'> {
  private readonly authorizationMock = {
    verifyRefreshToken: vi.fn().mockReturnValue({ userId: Fixture.userDTOMock().id }),
    createAuthToken: vi.fn().mockReturnValue('new-auth-token')
  }

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
    this.authorizationMock.verifyRefreshToken = vi.fn(() => {
      throw error
    })
    return this
  }

  async whenExecutedWithInput(refreshToken: string) {
    const useCase = new RefreshTokenUseCase(this.userRepository, this.authorizationMock as any)

    await this.capture(() =>
      useCase.execute({
        refreshToken,
        tokenRefreshed: this.spyOutputBoundary('tokenRefreshed')
      })
    )

    return this
  }
}
