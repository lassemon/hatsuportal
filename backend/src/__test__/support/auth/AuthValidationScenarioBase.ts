import { AuthScenarioBase } from './AuthScenarioBase'
import { IAuthorizationService } from '../../../application/services/IAuthorizationService'
import * as Fixture from '../../testFactory'
import { AuthorizationService } from '../../../infrastructure/auth/services/AuthorizationService'
import { expect, vi } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'

export abstract class AuthValidationScenarioBase<INPUT, CALLBACKS extends string> extends AuthScenarioBase<INPUT, CALLBACKS> {
  protected authorizationService: IAuthorizationService = Fixture.authorizationServiceMock()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withUserRoles(...roles: UserRoleEnum[]) {
    const user = Fixture.userMock({ roles })
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  authorizationWillFail(reason = 'Forbidden') {
    Object.values(this.authorizationService).forEach((fn) => {
      if (typeof fn === 'function') fn.mockReturnValue({ isAuthorized: false, reason })
    })
    return this
  }

  withActualAuthorizationService() {
    this.authorizationService = new AuthorizationService()
    return this
  }

  // ───────────────────────────────────────────────────────────────────
  // THEN helpers
  // ───────────────────────────────────────────────────────────────────
  thenUnderlyingUseCaseExecuted<T extends { execute: (...args: any[]) => Promise<any> }>(useCaseMock: T) {
    this.ensureNoUnexpectedError()
    expect(useCaseMock.execute).toHaveBeenCalledTimes(1)
    return this
  }

  thenUnderlyingUseCaseNotExecuted<T extends { execute: (...args: any[]) => Promise<any> }>(useCaseMock: T) {
    this.ensureNoUnexpectedError()
    expect(useCaseMock.execute).not.toHaveBeenCalled()
    return this
  }
}
