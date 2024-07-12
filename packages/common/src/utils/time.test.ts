import { describe, expect, it } from 'vitest'
import { dateStringFromUnixTime, unixtimeNow } from './time'

describe('time', () => {
  it('give unix time as number', () => {
    expect(unixtimeNow()).toBeTypeOf('number')
  })

  it('can add to unix time', () => {
    expect(unixtimeNow() < unixtimeNow({ add: { hours: 1 } })).toBe(true)
  })

  it('can subtract from unix time', () => {
    expect(unixtimeNow() > unixtimeNow({ substract: { hours: 1 } })).toBe(true)
  })

  it('can give date string from unix time', () => {
    const unixtime = 1722164637
    expect(dateStringFromUnixTime(unixtime)).toBeTypeOf('string')
    expect(dateStringFromUnixTime(unixtime)).toBe('28/07/2024, 14:03:57')
  })
})
