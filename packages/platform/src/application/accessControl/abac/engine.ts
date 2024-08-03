import { IAuthorizationRequest, IAuthorizationDecision } from './types'
import { Rule } from './rule'

export interface IAuthorizationEngine {
  evaluate<Attrs>(request: IAuthorizationRequest<Attrs>): IAuthorizationDecision
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
        // If the rule's condition predicate returns true, allow with the rule's reason
        return (rule.condition as (r: typeof request) => IAuthorizationDecision)(request)
      }
      return defaultDeny ? { allowed: false, reason: 'No matching ABAC rule' } : { allowed: true }
    }
  }
}
