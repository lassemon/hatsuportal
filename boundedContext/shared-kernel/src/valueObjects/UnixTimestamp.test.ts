import { describe, expect, it } from 'vitest'
import { UnixTimestamp } from './UnixTimestamp'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import { unixtimeNow } from '@hatsuportal/common'

describe('UnixTimestamp', () => {
  it('can create a unix timestamp', () => {
    const timestamp = new UnixTimestamp(1727290472411)
    expect(timestamp).to.be.instanceOf(UnixTimestamp)
    expect(timestamp.value).to.eq(1727290472411)

    const timestamp2 = new UnixTimestamp(new Date().getTime())
    expect(timestamp2).to.be.instanceOf(UnixTimestamp)

    const timestamp3 = new UnixTimestamp(unixtimeNow())
    expect(timestamp3).to.be.instanceOf(UnixTimestamp)
  })

  it('does not allow creating a unix timestamp with an empty value', () => {
    expect(() => {
      new UnixTimestamp('' as any)
    }).toThrow(InvalidUnixTimestampError)
    expect(() => {
      new UnixTimestamp(undefined as any)
    }).toThrow(InvalidUnixTimestampError)
    expect(() => {
      new UnixTimestamp(null as any)
    }).toThrow(InvalidUnixTimestampError)
  })

  it('does not allow creating a unix timestamp with an invalid value', () => {
    const invalidUnixTimestamps = ['   ', 'master', 'admin', 'foobar', -1, -11454797] as any[]

    invalidUnixTimestamps.forEach((timestamp) => {
      expect(() => {
        new UnixTimestamp(timestamp)
      }).toThrow(InvalidUnixTimestampError)
    })
  })
})
