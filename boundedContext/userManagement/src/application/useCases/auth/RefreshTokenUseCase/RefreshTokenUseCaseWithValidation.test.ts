import { afterEach, describe, it, vi } from 'vitest'
import { RefreshTokenValidationScenario } from '../../../../__test__/support/auth/RefreshTokenValidationScenario'
import { InvalidInputError } from '@hatsuportal/platform'

describe('RefreshTokenUseCaseWithValidation', () => {
  afterEach(() => vi.restoreAllMocks())

  it('should execute inner use case when token valid', async () => {
    const scenario = await RefreshTokenValidationScenario.given().whenExecutedWithInput('abc')

    scenario.thenUnderlyingUseCaseExecuted(scenario.useCaseMock)
  })

  it('should throw InvalidInputError when token empty', async () => {
    const scenario = await RefreshTokenValidationScenario.given().expectErrorOfType(InvalidInputError).whenExecutedWithInput('')

    scenario.thenUnderlyingUseCaseNotExecuted(scenario.useCaseMock)
  })
})
