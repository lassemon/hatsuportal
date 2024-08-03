import type { IAuthorizationDecision } from './abac/types'
import type { IAuthorizationEngine, AuthorizationPayloadMap } from './abac/engine'
import type { IUserForAuthorization, IUserToRequesterMapper } from './abac/mappers/UserToRequesterMapper'

export abstract class AuthorizationServiceBase<TAction extends string, TPayloadMap extends AuthorizationPayloadMap<TAction>> {
  constructor(
    protected readonly requesterMapper: IUserToRequesterMapper,
    protected readonly engine: IAuthorizationEngine<TAction, TPayloadMap>
  ) {}

  protected authorize<A extends TAction>(action: A, user: IUserForAuthorization | null, payload?: TPayloadMap[A]): IAuthorizationDecision {
    return this.engine.authorize(action, this.requesterMapper.fromSession(user), payload)
  }
}
