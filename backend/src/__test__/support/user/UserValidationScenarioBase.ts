import { UserScenarioBase } from './UserScenarioBase'
import * as Fixture from '../../testFactory'
import { expect, vi } from 'vitest'
import { UserRoleEnum } from '@hatsuportal/common'
import { IAuthorizationService } from '../../../application/services/IAuthorizationService'
import { AuthorizationService } from '../../../infrastructure/auth/services/AuthorizationService'

export abstract class UserValidationScenarioBase<INPUT, CALLBACKS extends string> extends UserScenarioBase<INPUT, CALLBACKS> {
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
      if (typeof fn === 'function') (fn as any).mockReturnValue({ isAuthorized: false, reason })
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
