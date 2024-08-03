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
 * Attribute-Based Access Control (ABAC) engine factory.
 *
 * Builds an evaluation engine from an ordered list of `Rule`s. For each
 * `AuthorizationRequest`, rules are checked in order. A rule applies when:
 * - the request `action` matches the rule `action` (exact string or RegExp test)
 * - and, if `resourceType` is defined, it equals `request.resource.type`
 * - and the rule `condition(request)` returns true
 *
 * The first matching rule allows the request and returns its `reason`.
 * If no rules match, the engine follows the fallback strategy:
 * - when `defaultDeny` is true (default), deny with reason "No matching ABAC rule"
 * - when `defaultDeny` is false, allow with no reason
 *
 * @param rules List of ABAC rules evaluated in order of appearance.
 * @param defaultDeny When true, deny unmatched requests; when false, allow them. Default: true.
 * @returns An object with `evaluate(request: AuthorizationRequest): AuthorizationDecision`.
 *
 * @example
 * const engine = new AbacEngine([
 *   [UserAction.Create]: createUserRule,
 *   [UserAction.Update]: updateUserRule,
 *   [UserAction.Deactivate]: deactivateUserRule,
 *   [UserAction.View]: viewUserRule,
 *   [UserAction.ListAll]: listAllUsersRule
 * ], true)
 * const decision = engine.evaluate({
      requester: { userId: 'u1', roles: [UserRoleEnum.Admin] },
      action: UserAction.Create,
      resource: { type: UserResourceType.User, attributes: { newUsersRoles: [UserRoleEnum.Admin] } }
    })
 * // returns => { allowed: true, reason: 'Admins can create users' }
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
   * Evaluates an AuthorizationRequest against the configured ABAC rules.
   *
   * Request properties usage:
   * - requester: The acting subject aka the user, or null for anonymous. Contains `userId`, `roles`, and optional `attributes` used by rule conditions.
   * - action: A normalized string such as 'story:update'. Matched by a rule's `action` (string equality) or by RegExp.
   * - resource: Optional descriptor of the target. When present, `resource.type` is matched against the rule's `resourceType`.
   *   Its `id` and `attributes` are available to rule predicates.
   * - context: Optional bag of environment/request-scoped attributes (e.g., tenantId, ipAddress, time, ownership flags) available to rule predicates.
   *
   * If no rule matches, the decision follows the engine's fallback strategy (deny by default unless configured otherwise).
   *
   * @param request The authorization request to evaluate.
   * @param request.principal Actor performing the action, or null for anonymous callers.
   * @param request.action Action identifier to check (e.g., 'post:read').
   * @param request.resource Target resource descriptor; its `type` is compared with rule.resourceType.
   * @param request.context Additional attributes for condition evaluation that are neither principal nor resource attributes.
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

/**
 * Attribute-Based Access Control (ABAC) engine factory.
 *
 * Builds an evaluation engine from an ordered list of `Rule`s. For each
 * `AuthorizationRequest`, rules are checked in order. A rule applies when:
 * - the request `action` matches the rule `action` (exact string or RegExp test)
 * - and, if `resourceType` is defined, it equals `request.resource.type`
 * - and the rule `condition(request)` returns true
 *
 * The first matching rule allows the request and returns its `reason`.
 * If no rules match, the engine follows the fallback strategy:
 * - when `defaultDeny` is true (default), deny with reason "No matching ABAC rule"
 * - when `defaultDeny` is false, allow with no reason
 *
 * @param rules List of ABAC rules evaluated in order of appearance.
 * @param defaultDeny When true, deny unmatched requests; when false, allow them. Default: true.
 * @returns An object with `evaluate(request: AuthorizationRequest): AuthorizationDecision`.
 *
 * @example
 * const engine = createAbacEngine([
 *   { action: 'post:read', resourceType: 'Post', condition: () => true, reason: 'Readers can view posts' }
 * ], true)
 * const decision = engine.evaluate({ action: 'post:read', requester: { userId: 'u1', roles: [] }, resource: { type: 'Post' } })
 * // => { allowed: true, reason: 'Readers can view posts' }
 */
export function createAbacEngine<TRuleList extends readonly Rule<unknown>[]>(rules: TRuleList, defaultDeny: boolean = true) {
  return {
    /**
     * Evaluates an AuthorizationRequest against the configured ABAC rules.
     *
     * Request properties usage:
     * - requester: The acting subject aka the user, or null for anonymous. Contains `userId`, `roles`, and optional `attributes` used by rule conditions.
     * - action: A normalized string such as 'story:update'. Matched by a rule's `action` (string equality) or by RegExp.
     * - resource: Optional descriptor of the target. When present, `resource.type` is matched against the rule's `resourceType`.
     *   Its `id` and `attributes` are available to rule predicates.
     * - context: Optional bag of environment/request-scoped attributes (e.g., tenantId, ipAddress, time, ownership flags) available to rule predicates.
     *
     * If no rule matches, the decision follows the engine's fallback strategy (deny by default unless configured otherwise).
     *
     * @param request The authorization request to evaluate.
     * @param request.principal Actor performing the action, or null for anonymous callers.
     * @param request.action Action identifier to check (e.g., 'post:read').
     * @param request.resource Target resource descriptor; its `type` is compared with rule.resourceType.
     * @param request.context Additional attributes for condition evaluation that are neither principal nor resource attributes.
     * @returns AuthorizationDecision indicating whether the action is allowed and an optional reason.
     */
    evaluate<Attrs>(request: IAuthorizationRequest<Attrs>): IAuthorizationDecision {
      for (const rule of rules) {
        // Determine if the rule's action matches the request action (string equality or regex test)
        const actionMatches = typeof rule.action === 'string' ? rule.action === request.action : rule.action.test(request.action)
        // Skip rule if the action does not match
        if (!actionMatches) continue
        // If a resource type is specified, ensure the request's resource type matches
        if (rule.resourceType && request.resource?.type !== rule.resourceType) continue

        const condition = rule.condition
        // If the rule's condition predicate returns true, allow with the rule's reason
        return condition(request)
      }
      return defaultDeny ? { allowed: false, reason: 'No matching ABAC rule' } : { allowed: true }
    }
  }
}
