import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UseCaseWithValidation } from './UseCaseWithValidation'
import InvalidInputError from '../errors/InvalidInputError'
import { Logger } from '@hatsuportal/common'

class DummyLogger extends Logger {
  public override debug = vi.fn()
  public override info = vi.fn()
  public override warn = vi.fn()
  public override error = vi.fn()

  constructor() {
    super('DummyLogger')
  }
}

interface TestOptions {
  foo?: string
  bar?: number
  baz?: 'A' | 'B'
}

const BazEnum = {
  A: 'A',
  B: 'B'
} as const

class TestUseCase extends UseCaseWithValidation<TestOptions> {
  public executed = false
  public receivedOptions: TestOptions | null = null

  async execute(options: TestOptions): Promise<void> {
    this.testArgument('foo', options, (foo) => typeof foo === 'string' && foo.length > 0)
    this.testArgument('bar', options, (bar) => typeof bar === 'number' && bar > 0)
    // Validate that "baz" is either "A" or "B"
    this.testEnumArgument(BazEnum, 'baz', options)
    this.executed = true
    this.receivedOptions = options
  }
}

describe('UseCaseWithValidation', () => {
  let logger: DummyLogger
  let useCase: TestUseCase

  beforeEach(() => {
    logger = new DummyLogger()
    useCase = new TestUseCase(logger)
  })

  it('executes successfully with valid input', async () => {
    const options: TestOptions = { foo: 'hello', bar: 42, baz: 'A' }
    await expect(useCase.execute(options)).resolves.toBeUndefined()
    expect(useCase.executed).toBe(true)
    expect(useCase.receivedOptions).toEqual(options)
  })

  it('throws InvalidInputError if foo is missing', async () => {
    const options: TestOptions = { bar: 42, baz: 'A' }
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(useCase.executed).toBe(false)
  })

  it('throws InvalidInputError if foo is empty', async () => {
    const options: TestOptions = { foo: '', bar: 42, baz: 'A' }
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(useCase.executed).toBe(false)
  })

  it('throws InvalidInputError if bar is not a positive number', async () => {
    const options: TestOptions = { foo: 'hello', bar: 0, baz: 'A' }
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(useCase.executed).toBe(false)
  })

  it('throws InvalidInputError if baz is not a valid enum value', async () => {
    const options: TestOptions = { foo: 'hello', bar: 42, baz: 'C' as any }
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(useCase.executed).toBe(false)
  })

  it('throws InvalidInputError if baz is missing', async () => {
    const options: TestOptions = { foo: 'hello', bar: 42 }
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(useCase.executed).toBe(false)
  })

  it('logs error when validation fails', async () => {
    const options: TestOptions = { foo: '', bar: 42, baz: 'A' }
    await expect(useCase.execute(options)).rejects.toThrow(InvalidInputError)
    expect(logger.warn).toHaveBeenCalled()
  })
})
