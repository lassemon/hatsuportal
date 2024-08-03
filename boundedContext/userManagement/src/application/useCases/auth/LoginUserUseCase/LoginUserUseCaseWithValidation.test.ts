import { afterEach, describe, it, vi } from 'vitest'
import { LoginUserValidationScenario } from '../../../../__test__/support/auth/LoginUserValidationScenario'
import { InvalidInputError } from '@hatsuportal/platform'

describe('LoginUserUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should execute inner use case when username and password valid', async () => {
    const scenario = await LoginUserValidationScenario.given().whenExecutedWithInput({
      username: 'validUser',
      password: 'ValidPassword123'
    })

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when username invalid', async () => {
    const scenario = await LoginUserValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({ username: '', password: 'somePass' })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when password invalid', async () => {
    const scenario = await LoginUserValidationScenario.given()
      .expectErrorOfType(InvalidInputError)
      .whenExecutedWithInput({ username: 'validUser', password: '' })

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
