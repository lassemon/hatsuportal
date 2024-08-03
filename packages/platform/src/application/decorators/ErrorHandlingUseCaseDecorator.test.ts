import { describe, it, expect, vi } from 'vitest'
import { ErrorHandlingUseCaseDecorator } from './ErrorHandlingUseCaseDecorator'
import { DomainError } from '@hatsuportal/shared-kernel'
import ApplicationError from '../errors/ApplicationError'

describe('ErrorHandlingUseCaseDecorator', () => {
  it('wraps unknown errors into ApplicationError', async () => {
    const inner = { execute: vi.fn().mockRejectedValue(new Error('DB down')) }
    const decorated = new ErrorHandlingUseCaseDecorator(inner)

    await expect(decorated.execute({} as any)).rejects.toBeInstanceOf(ApplicationError)
  })

  it('passes through DomainError', async () => {
    const domainIssue = new DomainError('validation')
    const inner = { execute: vi.fn().mockRejectedValue(domainIssue) }
    const decorated = new ErrorHandlingUseCaseDecorator(inner)

    await expect(decorated.execute({} as any)).rejects.toBe(domainIssue)
  })

  it('passes through ApplicationError', async () => {
    const applicationIssue = new ApplicationError('validation')
    const inner = { execute: vi.fn().mockRejectedValue(applicationIssue) }
    const decorated = new ErrorHandlingUseCaseDecorator(inner)

    await expect(decorated.execute({} as any)).rejects.toBe(applicationIssue)
  })
})
