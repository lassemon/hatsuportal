import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { StatusMessage } from './StatusMessage'
import { StatusMessageTooLongError } from '../errors/StatusMessageTooLongError'
import { InvalidStatusMessageError } from '../errors/InvalidStatusMessageError'

describe('StatusMessage', () => {
  it('can create a status message', () => {
    const statusMessage = new StatusMessage('Away')
    expect(statusMessage).to.be.instanceOf(StatusMessage)
    expect(statusMessage.value).to.eq('Away')
  })

  it('empty returns an empty status message', () => {
    const statusMessage = StatusMessage.empty()
    expect(statusMessage.value).to.eq('')
  })

  it('exposes equals and toString helpers', () => {
    const statusMessage = new StatusMessage('Away')
    expect(statusMessage.equals(new StatusMessage('Away'))).toBe(true)
    expect(statusMessage.equals(new StatusMessage('Online'))).toBe(false)
    expect(statusMessage.toString()).toBe('Away')
  })

  it('trims whitespace before validation', () => {
    const statusMessage = new StatusMessage('  Away  ')
    expect(statusMessage.value).toBe('Away')
  })

  it('rejects non-string input', () => {
    expect(() => new StatusMessage(undefined as any)).toThrow(InvalidStatusMessageError)
    expect(() => new StatusMessage(null as any)).toThrow(InvalidStatusMessageError)
    expect(() => new StatusMessage(123 as any)).toThrow(InvalidStatusMessageError)
  })

  it('rejects over-limit status message after trim', () => {
    expect(() => new StatusMessage(`  ${'x'.repeat(InputLimits.statusMessage + 1)}  `)).toThrow(StatusMessageTooLongError)
  })
})
