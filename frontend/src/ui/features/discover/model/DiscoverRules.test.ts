import { describe, expect, it } from 'vitest'
import { DiscoverRules } from './DiscoverRules'

describe('DiscoverRules', () => {
  it('forCurrentDiscoverFeed is stable across repeated calls', () => {
    const first = DiscoverRules.forCurrentDiscoverFeed().toPersisted()
    const second = DiscoverRules.forCurrentDiscoverFeed().toPersisted()
    expect(second).toBe(first)
  })

  it('identity does not depend on pageNumber in toSearchRequest', () => {
    const rules = DiscoverRules.forCurrentDiscoverFeed()
    const before = rules.toPersisted()
    rules.toSearchRequest(5)
    expect(DiscoverRules.forCurrentDiscoverFeed().toPersisted()).toBe(before)
  })

  it('fromPersisted matches current when serialized from current', () => {
    const persisted = DiscoverRules.forCurrentDiscoverFeed().toPersisted()
    expect(DiscoverRules.fromPersisted(persisted).matchesCurrentDiscoverFeed()).toBe(true)
  })
})
