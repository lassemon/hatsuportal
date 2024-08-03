import { AuthScenarioBase } from './AuthScenarioBase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { RefreshTokenUseCase } from '../../../application/useCases/auth/RefreshTokenUseCase'
import { UserApplicationMapper } from '../../../application/mappers/UserApplicationMapper'

export class RefreshTokenScenario extends AuthScenarioBase<string, 'tokenRefreshed'> {
  private readonly tokenServiceMock = Fixture.tokenServiceMock()
  private readonly userApplicationMapper = new UserApplicationMapper()

  static given() {
    return new RefreshTokenScenario()
  }

  private constructor() {
    super(['tokenRefreshed'])
  }

  withActiveUser(user = Fixture.userMock()) {
    this.userReadRepository.findById = vi.fn().mockResolvedValue(Fixture.userReadModelFromUser(user))
    return this
  }

  withInactiveUser(user = Fixture.userMock({ active: false })) {
    this.userReadRepository.findById = vi.fn().mockResolvedValue(Fixture.userReadModelFromUser(user))
    return this
  }

  withoutUser() {
    this.userReadRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  readRepositoryWillReject(error = new Error('Repository failure')) {
    this.userReadRepository.findById = vi.fn().mockRejectedValue(error)
    return this
  }

  verifyTokenWillFail(error = new Error('invalid')) {
    this.tokenServiceMock.verifyRefreshToken = vi.fn().mockImplementation(() => {
      throw error
    })
    return this
  }

  createAuthTokenWillFail(error = new Error('token creation failed')) {
    this.tokenServiceMock.createAuthToken = vi.fn().mockImplementation(() => {
      throw error
    })
    return this
  }

  async whenExecutedWithInput(refreshToken: string) {
    const useCase = new RefreshTokenUseCase(this.userReadRepository, this.userApplicationMapper, this.tokenServiceMock)

    await this.capture(() =>
      useCase.execute({
        refreshToken,
        tokenRefreshed: this.spyOutputBoundary('tokenRefreshed')
      })
    )

    return this
  }
}
