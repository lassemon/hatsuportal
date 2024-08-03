import { afterEach, describe, it, vi } from 'vitest'
import { RefreshTokenScenario } from '../../../../__test__/support/auth/RefreshTokenScenario'
import { AuthenticationError } from '@hatsuportal/platform'

describe('RefreshTokenUseCase', () => {
  afterEach(() => vi.restoreAllMocks())

  const token = 'refresh-token-123'

  it('should refresh auth token for active user', async () => {
    const scenario = await RefreshTokenScenario.given().withActiveUser().whenExecutedWithInput(token)

    scenario.thenOutputBoundaryCalled('tokenRefreshed', 'new-auth-token')
  })

  it('should throw AuthenticationError when user inactive', async () => {
    const scenario = await RefreshTokenScenario.given()
      .withInactiveUser()
      .expectErrorOfType(AuthenticationError)
      .whenExecutedWithInput(token)

    scenario.thenOutputBoundaryNotCalled('tokenRefreshed')
  })

  it('should throw AuthenticationError when user not found', async () => {
    const scenario = await RefreshTokenScenario.given().withoutUser().expectErrorOfType(AuthenticationError).whenExecutedWithInput(token)

    scenario.thenOutputBoundaryNotCalled('tokenRefreshed')
  })

  it('should propagate error when token verification fails', async () => {
    const scenario = await RefreshTokenScenario.given()
      .withActiveUser()
      .verifyTokenWillFail(new Error('invalid'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(token)

    scenario.thenOutputBoundaryNotCalled('tokenRefreshed')
  })

  it('should propagate error when user repository fails', async () => {
    const scenario = await RefreshTokenScenario.given()
      .withActiveUser()
      .repositoryWillReject('findById', new Error('Repository failure'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(token)

    scenario.thenOutputBoundaryNotCalled('tokenRefreshed')
  })

  it('should propagate error when createAuthToken fails', async () => {
    const scenario = await RefreshTokenScenario.given()
      .withActiveUser()
      .createAuthTokenWillFail(new Error('token creation failed'))
      .expectErrorOfType(Error)
      .whenExecutedWithInput(token)

    scenario.thenOutputBoundaryNotCalled('tokenRefreshed')
  })
})
