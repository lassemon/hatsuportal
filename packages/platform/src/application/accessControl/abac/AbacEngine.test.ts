import { describe, expect, it, vi } from 'vitest'
import { AbacEngine } from './engine'
import type { Rule } from './rule'
import type { IAuthorizationDecision, IAuthorizationRequest, IRequester } from './types'

enum TestAction {
  View = 'item:view',
  Update = 'item:update'
}

type TestPayloadMap = {
  [TestAction.View]: undefined
  [TestAction.Update]: { item: { id: string; title: string } }
}

const requester: IRequester = {
  userId: 'user-1',
  roles: [],
  attributes: { active: true },
  name: 'Alice'
}

const viewRule: Rule = {
  action: TestAction.View,
  resourceType: 'Item',
  condition: (): IAuthorizationDecision => ({ allowed: true, reason: 'View allowed' })
}

const denyRule: Rule = {
  action: TestAction.View,
  resourceType: 'Item',
  condition: (): IAuthorizationDecision => ({ allowed: false, reason: 'Explicit deny' })
}

const updateRule: Rule = {
  action: TestAction.Update,
  resourceType: 'Item',
  condition: (req: IAuthorizationRequest<{ item: { id: string; title: string } }>): IAuthorizationDecision => {
    expect(req.resource?.id).toBe('item-1')
    expect(req.resource?.attributes).toEqual({ item: { id: 'item-1', title: 'Title' } })
    return { allowed: true, reason: 'Update allowed' }
  }
}

const noopRule: Rule = {
  action: TestAction.Update,
  resourceType: 'Item',
  condition: (): IAuthorizationDecision => ({ allowed: false, reason: 'Unused' })
}

const requestBuilders = {
  [TestAction.View]: (r: IRequester | null) => ({
    requester: r,
    action: TestAction.View,
    resource: { type: 'Item', id: 'item-1' }
  }),
  [TestAction.Update]: (r: IRequester | null, payload: { item: { id: string; title: string } }) => ({
    requester: r,
    action: TestAction.Update,
    resource: { type: 'Item', id: payload.item.id, attributes: { item: payload.item } }
  })
}

function rules(partial: Partial<Record<TestAction, Rule>>): Record<TestAction, Rule> {
  return {
    [TestAction.View]: partial[TestAction.View] ?? viewRule,
    [TestAction.Update]: partial[TestAction.Update] ?? noopRule
  }
}

describe('AbacEngine', () => {
  it('passes through allow decisions from the rule condition', () => {
    const engine = new AbacEngine<TestAction, TestPayloadMap>(rules({}), requestBuilders, true)

    expect(
      engine.evaluate({
        requester,
        action: TestAction.View,
        resource: { type: 'Item', id: 'item-1' }
      })
    ).toEqual({ allowed: true, reason: 'View allowed' })
  })

  it('passes through deny decisions from the rule condition verbatim', () => {
    const engine = new AbacEngine<TestAction, TestPayloadMap>(
      rules({ [TestAction.View]: denyRule }),
      requestBuilders,
      true
    )

    expect(
      engine.evaluate({
        requester,
        action: TestAction.View,
        resource: { type: 'Item', id: 'item-1' }
      })
    ).toEqual({ allowed: false, reason: 'Explicit deny' })
  })

  it('denies unknown actions when defaultDeny is true', () => {
    const engine = new AbacEngine<TestAction, TestPayloadMap>(rules({}), requestBuilders, true)

    expect(engine.evaluate({ requester, action: 'unknown:action' })).toEqual({
      allowed: false,
      reason: 'No matching ABAC rule'
    })
  })

  it('allows unknown actions when defaultDeny is false', () => {
    const engine = new AbacEngine<TestAction, TestPayloadMap>(rules({}), requestBuilders, false)

    expect(engine.evaluate({ requester, action: 'unknown:action' })).toEqual({ allowed: true })
  })

  it('falls back when action matches but resource type does not', () => {
    const engine = new AbacEngine<TestAction, TestPayloadMap>(rules({}), requestBuilders, true)

    expect(
      engine.evaluate({
        requester,
        action: TestAction.View,
        resource: { type: 'Other', id: 'item-1' }
      })
    ).toEqual({ allowed: false, reason: 'No matching ABAC rule' })
  })

  it('authorize delegates no-payload actions through the request builder', () => {
    const engine = new AbacEngine<TestAction, TestPayloadMap>(rules({}), requestBuilders, true)

    expect(engine.authorize(TestAction.View, requester)).toEqual({ allowed: true, reason: 'View allowed' })
  })

  it('authorize wires payload-required actions into resource attributes', () => {
    const conditionSpy = vi.fn(updateRule.condition)
    const engine = new AbacEngine<TestAction, TestPayloadMap>(
      rules({ [TestAction.Update]: { ...updateRule, condition: conditionSpy } }),
      requestBuilders,
      true
    )
    const testItem = { id: 'item-1', title: 'Title' }

    const decision = engine.authorize(TestAction.Update, requester, { item: testItem })

    expect(decision).toEqual({ allowed: true, reason: 'Update allowed' })
    expect(conditionSpy).toHaveBeenCalledOnce()
  })
})
