import { CommentScenarioBase } from './CommentScenarioBase'
import * as Fixture from '../../testFactory'
import { vi } from 'vitest'
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

export abstract class CommentValidationScenarioBase<INPUT, CALLBACKS extends string> extends CommentScenarioBase<INPUT, CALLBACKS> {
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
}
