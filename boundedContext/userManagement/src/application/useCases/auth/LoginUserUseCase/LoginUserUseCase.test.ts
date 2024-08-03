import { afterEach, describe, expect, it, vi } from 'vitest'
import { LoginUserScenario } from '../../../../__test__/support/auth/LoginUserScenario'
import { AuthenticationError } from '@hatsuportal/platform'

describe('LoginUserUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const baseInput = (username: string, password: string) => ({ username, password })

  it('should login successfully and return tokens', async () => {
    const scenario = await LoginUserScenario.given().withValidCredentials().whenExecutedWithInput(baseInput('username', 'Password123'))

    scenario.thenOutputBoundaryCalled('loginSuccess', 'new-auth-token', 'refresh-token', expect.any(Object))
  })

  it('should throw AuthenticationError for wrong password', async () => {
    const scenario = await LoginUserScenario.given()
      .withInvalidPassword()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput('username', 'badpass'))

    scenario.thenOutputBoundaryNotCalled('loginSuccess')
  })

  it('should throw AuthenticationError when user not found', async () => {
    const scenario = await LoginUserScenario.given()
      .withoutUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput('nouser', 'pass'))

    scenario.thenOutputBoundaryNotCalled('loginSuccess')
  })

  it('should throw AuthenticationError when user inactive', async () => {
    const scenario = await LoginUserScenario.given()
      .withInactiveUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(baseInput('username', 'Password123'))

    scenario.thenOutputBoundaryNotCalled('loginSuccess')
  })
})
