import { AuthScenarioBase } from './AuthScenarioBase'
import { expect, vi } from 'vitest'
import { UserToRequesterMapper } from '@hatsuportal/platform'
import { IUserAuthorizationService, UserAuthorizationService } from '../../../application/authorization/services/UserAuthorizationService'
import * as Fixture from '../../testFactory'
import { UserRole } from '../../../domain'

export abstract class AuthValidationScenarioBase<INPUT, CALLBACKS extends string> extends AuthScenarioBase<INPUT, CALLBACKS> {
  protected authorizationService: IUserAuthorizationService = Fixture.userAuthorizationServiceMock()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withUserRoles(...roles: UserRole[]) {
    const user = Fixture.userMock({ roles })
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  authorizationWillFail(reason = 'Forbidden') {
    Object.values(this.authorizationService).forEach((fn) => {
      if (typeof fn === 'function') fn.mockReturnValue({ allowed: false, reason })
    })
    return this
  }

  withActualAuthorizationService() {
    this.authorizationService = new UserAuthorizationService(new UserToRequesterMapper())
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
