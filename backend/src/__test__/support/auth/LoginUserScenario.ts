import { UserScenarioBase } from '../user/UserScenarioBase'
import * as Fixture from '../../testFactory'
import { vi } from 'vitest'
import { LoginUserUseCase } from '../../../application/useCases/auth/LoginUserUseCase/LoginUserUseCase'
import { Encryption } from '@hatsuportal/user-management'
import { LoginUserInputDTO } from '@hatsuportal/user-management'

export class LoginUserScenario extends UserScenarioBase<LoginUserInputDTO, 'loginSuccess'> {
  static given() {
    return new LoginUserScenario()
  }

  private constructor() {
    super(['loginSuccess'])
  }

  withValidCredentials(user = Fixture.userMock()) {
    this.userRepository.findByName = vi.fn().mockResolvedValue(user)
    this.userRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: user.id.value, passwordHash: 'hash' })
    vi.spyOn(Encryption, 'compare').mockResolvedValue(true)
    return this
  }

  withInvalidPassword(user = Fixture.userMock()) {
    this.userRepository.findByName = vi.fn().mockResolvedValue(user)
    this.userRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: user.id.value, passwordHash: 'hash' })
    vi.spyOn(Encryption, 'compare').mockResolvedValue(false)
    return this
  }

  withoutUser() {
    this.userRepository.findByName = vi.fn().mockResolvedValue(null)
    this.userRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue(null)
    return this
  }

  withInactiveUser() {
    const user = Fixture.userMock({ active: false })
    this.userRepository.findByName = vi.fn().mockResolvedValue(user)
    this.userRepository.getUserCredentialsByUsername = vi.fn().mockResolvedValue({ userId: user.id.value, passwordHash: 'hash' })
    vi.spyOn(Encryption, 'compare').mockResolvedValue(true)
    return this
  }

  async whenExecutedWithInput(input: LoginUserInputDTO) {
    const useCase = new LoginUserUseCase(this.userMapper, this.userRepository, Fixture.authorizationMock())

    await this.capture(() =>
      useCase.execute({
        loginUserInput: input,
        loginSuccess: this.spyOutputBoundary('loginSuccess')
      })
    )

    return this
  }
}
