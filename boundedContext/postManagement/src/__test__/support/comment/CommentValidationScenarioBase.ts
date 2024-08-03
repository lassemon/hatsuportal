import { CommentScenarioBase } from './CommentScenarioBase'
import * as Fixture from '../../testFactory'
import { expect, vi } from 'vitest'
import {
  CommentAuthorizationService,
  ICommentAuthorizationService
} from '../../../application/authorization/services/CommentAuthorizationService'
import { UserRoleEnum } from '@hatsuportal/common'
import { AbacEngine, EntityLoadResult, UserToRequesterMapper } from '@hatsuportal/platform'
import {
  CommentAction,
  CommentAuthorizationPayloadMap,
  commentRuleMap,
  commentRequestBuilderMap
} from '../../../application/authorization/rules/comment.rules'

export abstract class CommentValidationScenarioBase<INPUT, CALLBACKS extends string> extends CommentScenarioBase<
  INPUT,
  CALLBACKS
> {
  protected authorizationService: ICommentAuthorizationService = Fixture.commentAuthorizationServiceMock()

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames)
  }

  withUserRoles(...roles: UserRoleEnum[]) {
    const user = Fixture.userReadModelDTOMock({ roles })
    this.userGateway.getUserById = vi.fn().mockResolvedValue(EntityLoadResult.success(user))
    return this
  }

  authorizationWillFail(reason = 'Forbidden') {
    Object.values(this.authorizationService).forEach((fn) => {
      if (typeof fn === 'function') (fn as ReturnType<typeof vi.fn>).mockReturnValue({ allowed: false, reason })
    })
    return this
  }

  withActualAuthorizationService() {
    this.authorizationService = new CommentAuthorizationService(
      new UserToRequesterMapper(),
      new AbacEngine<CommentAction, CommentAuthorizationPayloadMap>(commentRuleMap, commentRequestBuilderMap)
    )
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
