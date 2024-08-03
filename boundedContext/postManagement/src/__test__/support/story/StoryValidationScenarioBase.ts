import { StoryScenarioBase } from './StoryScenarioBase'
import * as Fixture from '../../testFactory'
import { expect, vi } from 'vitest'
import { IPostAuthorizationService, PostAuthorizationService } from '../../../application/authorization/services/PostAuthorizationService'
import { UserLoadResult } from '../../../application/acl/userManagement/outcomes/UserLoadResult'
import { UserRoleEnum } from '@hatsuportal/common'
import { UserToRequesterMapper } from '@hatsuportal/platform'
import { CommentApplicationMapper } from '../../../application'

export abstract class StoryValidationScenarioBase<INPUT, CALLBACKS extends string> extends StoryScenarioBase<INPUT, CALLBACKS> {
  protected authorizationService: IPostAuthorizationService = Fixture.postAuthorizationServiceMock()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames)
  }

  withUserRoles(...roles: UserRoleEnum[]) {
    const user = Fixture.userReadModelDTOMock({ roles })
    this.userGateway.getUserById = vi.fn().mockResolvedValue(UserLoadResult.success(user))
    return this
  }

  authorizationWillFail(reason = 'Forbidden') {
    Object.values(this.authorizationService).forEach((fn) => {
      if (typeof fn === 'function') (fn as any).mockReturnValue({ allowed: false, reason })
    })
    return this
  }

  withActualAuthorizationService() {
    this.authorizationService = new PostAuthorizationService(new CommentApplicationMapper(), new UserToRequesterMapper())
    return this
  }

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
