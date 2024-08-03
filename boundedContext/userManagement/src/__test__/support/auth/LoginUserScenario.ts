import { UserScenarioBase } from '../user/UserScenarioBase'
import { vi } from 'vitest'
import * as Fixture from '../../testFactory'
import { Encryption, LoginUserInputDTO } from '../../../application'
import { LoginUserUseCase } from '../../../application/useCases/auth/LoginUserUseCase'

export class LoginUserScenario extends UserScenarioBase<LoginUserInputDTO, 'loginSuccess'> {
  static given() {
    return new LoginUserScenario()
  }

  private constructor() {
    super(['loginSuccess'])
  }

  withValidCredentials(user = Fixture.userMock()) {
    this.userWriteRepository.findByName = vi.fn().mockResolvedValue(user)
    this.userWriteRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: user.id.value, passwordHash: 'hash' })
    vi.spyOn(Encryption, 'compare').mockResolvedValue(true)
    return this
  }

  withInvalidPassword(user = Fixture.userMock()) {
    this.userWriteRepository.findByName = vi.fn().mockResolvedValue(user)
    this.userWriteRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: user.id.value, passwordHash: 'hash' })
    vi.spyOn(Encryption, 'compare').mockResolvedValue(false)
    return this
  }

  withoutUser() {
    this.userWriteRepository.findByName = vi.fn().mockResolvedValue(null)
    this.userWriteRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue(null)
    return this
  }

  withInactiveUser() {
    const user = Fixture.userMock({ active: false })
    this.userWriteRepository.findByName = vi.fn().mockResolvedValue(user)
    this.userWriteRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: user.id.value, passwordHash: 'hash' })
    vi.spyOn(Encryption, 'compare').mockResolvedValue(true)
    return this
  }

  async whenExecutedWithInput(input: LoginUserInputDTO) {
    const useCase = new LoginUserUseCase(this.userApplicationMapper, this.userWriteRepository, Fixture.tokenServiceMock())

    await this.capture(() =>
      useCase.execute({
        loginUserInput: input,
        loginSuccess: this.spyOutputBoundary('loginSuccess')
      })
    )

    return this
  }
}
