import { ImageScenarioBase } from './ImageScenarioBase'
import * as Fixture from '../testFactory'
import { expect } from 'vitest'
import { IMediaAuthorizationService, MediaAuthorizationService } from '../../application/authorization/services/MediaAuthorizationService'
import { UserToRequesterMapper } from '@hatsuportal/platform'

export abstract class ImageValidationScenarioBase<INPUT, CALLBACKS extends string> extends ImageScenarioBase<INPUT, CALLBACKS> {
  protected mediaAuthorizationService: IMediaAuthorizationService = Fixture.mediaAuthorizationServiceMock()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames)
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  authorizationWillFail(reason = 'Forbidden') {
    Object.values(this.mediaAuthorizationService).forEach((fn) => {
      if (typeof fn === 'function') (fn as any).mockReturnValue({ allowed: false, reason })
    })
    return this
  }

  withActualAuthorizationService() {
    this.mediaAuthorizationService = new MediaAuthorizationService(new UserToRequesterMapper())
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
