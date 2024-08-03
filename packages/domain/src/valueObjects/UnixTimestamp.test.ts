import { describe, expect, it } from 'vitest'
import { InvalidUnixTimestampError } from '../errors/InvalidUnixTimestampError'
import { UnixTimestamp } from './UnixTimestamp'

describe('UnixTimestamp', () => {
  it('can create a unix timestamp', () => {
    const timestamp = new UnixTimestamp(1727290472411)
    expect(timestamp).to.be.instanceOf(UnixTimestamp)
    expect(timestamp.value).to.eq(1727290472411)
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
