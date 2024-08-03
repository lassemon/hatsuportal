import { IAuthorizationRequest, IAuthorizationDecision, IRequester } from './types'
import { Rule } from './rule'

/**
 * Payload map type - maps each action to its payload type. Use `undefined` for actions with no payload.
 */
export type AuthorizationPayloadMap<TAction extends string> = Partial<Record<TAction, unknown>>

/**
 * Request builder type: for actions with payload (TPayloadMap[K] not undefined), payload is required.
 * For actions with no payload (undefined), the second parameter is omitted.
 */
export type RequestBuilderMap<TAction extends string, TPayloadMap extends AuthorizationPayloadMap<TAction>> = {
  [K in TAction]: TPayloadMap[K] extends undefined
    ? (requester: IRequester | null) => IAuthorizationRequest<unknown>
    : (requester: IRequester | null, payload: TPayloadMap[K]) => IAuthorizationRequest<unknown>
}

export interface IAuthorizationEngine<
  TAction extends string = string,
  TPayloadMap extends AuthorizationPayloadMap<TAction> = AuthorizationPayloadMap<TAction>
> {
  readonly rules: Record<TAction, Rule<unknown>>
  evaluate<Attrs>(request: IAuthorizationRequest<Attrs>): IAuthorizationDecision
  authorize<A extends TAction>(action: A, requester: IRequester | null, payload?: TPayloadMap[A]): IAuthorizationDecision
}

/**
 * Attribute-Based Access Control (ABAC) engine.
 *
 * Evaluates authorization requests against a fixed map of rules keyed by action.
 * Each action has at most one rule. When a rule defines `resourceType`, it must
 * match `request.resource.type` before the rule condition runs.
 *
 * On match, {@link evaluate} returns `rule.condition(request)` verbatim — the
 * condition decides allow or deny; the engine does not coerce the outcome.
 *
 * When no rule matches the action, or the resource type does not match, the
 * engine follows the fallback strategy:
 * - when `defaultDeny` is true (default), deny with reason "No matching ABAC rule"
 * - when `defaultDeny` is false, allow with no reason
 *
 * @example
 * const engine = new AbacEngine(
 *   {
 *     [UserAction.Create]: createUserRule,
 *     [UserAction.Update]: updateUserRule
 *   },
 *   requestBuilderMap,
 *   true
 * )
 * const decision = engine.evaluate({
 *   requester: { userId: 'u1', roles: [UserRoleEnum.Admin] },
 *   action: UserAction.Create,
 *   resource: { type: UserResourceType.User, attributes: { newUsersRoles: [UserRoleEnum.Admin] } }
 * })
 */
export class AbacEngine<
  TAction extends string,
  TPayloadMap extends AuthorizationPayloadMap<TAction> = AuthorizationPayloadMap<TAction>
> implements IAuthorizationEngine<TAction, TPayloadMap> {
  constructor(
    readonly rules: Record<TAction, Rule<unknown>>,
    readonly requestBuilders: RequestBuilderMap<TAction, TPayloadMap>,
    readonly defaultDeny: boolean = true
  ) {}

  /**
   * Convenience method for domain flows. Builds the request via the configured request builder and evaluates.
   * Callers must pass payload for actions that require it (enforced by RequestBuilderMap at build time).
   */
  authorize<A extends TAction>(action: A, requester: IRequester | null, payload?: TPayloadMap[A]): IAuthorizationDecision {
    const builder = this.requestBuilders[action] as (r: IRequester | null, p?: TPayloadMap[A]) => IAuthorizationRequest<unknown>
    const request = builder(requester, payload)
    return this.evaluate(request)
  }

  /**
   * Evaluates an authorization request against the configured ABAC rule map.
   *
   * Looks up the rule by `request.action`. When the rule defines `resourceType`,
   * it must equal `request.resource.type` before the condition runs. On match,
   * returns `rule.condition(request)` unchanged. Otherwise follows `defaultDeny`.
   *
   * @param request The authorization request to evaluate.
   * @param request.requester The acting subject, or null for anonymous callers. Contains `userId`, `roles`, and optional `attributes` used by rule conditions.
   * @param request.action Action identifier to check (e.g., 'story:update'). Used as the key into the rule map.
   * @param request.resource Optional target resource descriptor. When present, `resource.type` is compared with the rule's `resourceType`; `id` and `attributes` are available to rule conditions.
   * @param request.context Optional environment or request-scoped attributes (e.g., tenantId, ownership flags) available to rule conditions.
   * @returns AuthorizationDecision indicating whether the action is allowed and an optional reason.
   */
  evaluate<Attrs>(request: IAuthorizationRequest<Attrs>): IAuthorizationDecision {
    const rule = this.rules[request.action as TAction]
    if (!rule) {
      return this.defaultDeny ? { allowed: false, reason: 'No matching ABAC rule' } : { allowed: true }
    }
    if (rule.resourceType && request.resource?.type !== rule.resourceType) {
      return this.defaultDeny ? { allowed: false, reason: 'No matching ABAC rule' } : { allowed: true }
    }
    return rule.condition(request)
  }
}
