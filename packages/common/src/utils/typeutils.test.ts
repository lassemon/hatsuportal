import { describe, expect, it } from 'vitest'
import { castToEnum } from './typeutils'

describe('typeutils', () => {
  it('can cast value to enum', () => {
    enum TEST_ENUM {
      FOO = 'foo',
      BAR = 'bar'
    }
    expect(castToEnum('test', TEST_ENUM, TEST_ENUM.FOO)).toBe(TEST_ENUM.FOO)
    expect(castToEnum('bar', TEST_ENUM, TEST_ENUM.FOO)).toBe(TEST_ENUM.BAR)
  })
})
