import { StoryScenarioBase } from './StoryScenarioBase'
import * as Fixture from '../../testFactory'
import { expect, vi } from 'vitest'
import {
  IStoryAuthorizationService,
  StoryAuthorizationService
} from '../../../application/authorization/services/StoryAuthorizationService'
import { UserLoadResult } from '../../../application/acl/userManagement/outcomes/UserLoadResult'
import { UserRoleEnum } from '@hatsuportal/common'
import { AbacEngine, UserToRequesterMapper } from '@hatsuportal/platform'
import {
  StoryAction,
  StoryAuthorizationPayloadMap,
  storyRuleMap,
  storyRequestBuilderMap
} from '../../../application/authorization/rules/story.rules'

export abstract class StoryValidationScenarioBase<INPUT, CALLBACKS extends string> extends StoryScenarioBase<INPUT, CALLBACKS> {
  protected authorizationService: IStoryAuthorizationService = Fixture.storyAuthorizationServiceMock()

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
    this.authorizationService = new StoryAuthorizationService(
      new UserToRequesterMapper(),
      new AbacEngine<StoryAction, StoryAuthorizationPayloadMap>(storyRuleMap, storyRequestBuilderMap)
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
