import { describe, expect, it } from 'vitest'
import { SystemUserId } from './SystemUserId'
import { UserId } from './UserId'

describe('SystemUserId', () => {
  it('extends UserId and exposes the well-known default UUID', () => {
    const systemUserId = SystemUserId.default()

    expect(systemUserId).toBeInstanceOf(UserId)
    expect(systemUserId.value).toBe('00000000-0000-0000-0000-000000000001')
  })

  it('canCreate validates like UserId', () => {
    expect(SystemUserId.canCreate(SystemUserId.DEFAULT)).toBe(true)
    expect(SystemUserId.canCreate('')).toBe(false)
  })
})
