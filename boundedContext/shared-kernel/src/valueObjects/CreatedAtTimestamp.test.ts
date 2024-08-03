import { describe, expect, it } from 'vitest'
import { unixtimeNow } from '@hatsuportal/common'
import { CreatedAtTimestamp } from './CreatedAtTimestamp'
import { InvalidCreatedAtTimestampError } from '../errors/InvalidCreatedAtTimestampError'

describe('CreatedAtTimestamp', () => {
  it('constructs with a valid past epoch second', () => {
    const epochSecond = 1_727_290_472
    const timestamp = new CreatedAtTimestamp(epochSecond)
    expect(timestamp).toBeInstanceOf(CreatedAtTimestamp)
    expect(timestamp.value).toBe(epochSecond)
  })

  it('M1: rejects -1 / UNKNOWN sentinel for creation time', () => {
    expect(() => new CreatedAtTimestamp(-1)).toThrow(InvalidCreatedAtTimestampError)
  })

  it('M2: rejects epoch 0 as creation instant', () => {
    expect(() => new CreatedAtTimestamp(0)).toThrow(InvalidCreatedAtTimestampError)
  })

  it('M3: rejects Date.now() milliseconds as creation time', () => {
    expect(() => new CreatedAtTimestamp(Date.now())).toThrow(InvalidCreatedAtTimestampError)
  })

  it('M4: rejects future creation instant at construction', () => {
    expect(() => new CreatedAtTimestamp(unixtimeNow() + 1000)).toThrow(InvalidCreatedAtTimestampError)
  })

  describe('M5: addSeconds re-runs constructor guards including future check', () => {
    it('allow: addSeconds staying in the past returns a valid instance', () => {
      const createdAt = new CreatedAtTimestamp(unixtimeNow() - 3600)
      const adjusted = createdAt.addSeconds(60)

      expect(adjusted).toBeInstanceOf(CreatedAtTimestamp)
      expect(adjusted.value).toBe(createdAt.value + 60)
    })

    it('reject: addSeconds crossing unixtimeNow() throws', () => {
      const createdAt = new CreatedAtTimestamp(unixtimeNow() - 10)
      expect(() => createdAt.addSeconds(20)).toThrow(InvalidCreatedAtTimestampError)
    })
  })
})
