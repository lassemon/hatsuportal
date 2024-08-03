import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UseCaseWithValidation } from './UseCaseWithValidation'
import InvalidInputError from '../errors/InvalidInputError'
import { Logger } from '@hatsuportal/platform'

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

class DomainValue {
  constructor(value: unknown) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error('Invalid domain value')
    }
  }
}

class DomainInstanceUseCase extends UseCaseWithValidation<{ value?: string }> {
  async execute(options: { value?: string }): Promise<void> {
    this.testArgumentInstance(DomainValue, 'value', options)
  }
}

class PredicateThrowsUseCase extends UseCaseWithValidation<{ value?: string }> {
  async execute(options: { value?: string }): Promise<void> {
    this.testArgument('value', options, () => {
      throw new Error('Predicate exploded')
    })
  }
}

class UndefinedPredicateUseCase extends UseCaseWithValidation<{ value?: string }> {
  async execute(options: { value?: string }): Promise<void> {
    this.testArgument('value', options, () => undefined as unknown as boolean)
  }
}

class InvalidInputRethrowUseCase extends UseCaseWithValidation<{ value?: string }> {
  async execute(options: { value?: string }): Promise<void> {
    this.testArgument('value', options, () => {
      throw new InvalidInputError('Already invalid')
    })
  }
}

class GenericErrorWrapUseCase extends UseCaseWithValidation<{ value?: string }> {
  async execute(options: { value?: string }): Promise<void> {
    this.testArgument('value', options, () => {
      throw new Error('Wrapped failure')
    })
  }
}

class UnknownErrorWrapUseCase extends UseCaseWithValidation<{ value?: string }> {
  async execute(options: { value?: string }): Promise<void> {
    this.testArgument('value', options, () => {
      throw 'not-an-error'
    })
  }
}

describe('UseCaseWithValidation advanced validation', () => {
  let logger: DummyLogger

  beforeEach(() => {
    logger = new DummyLogger()
  })

  it('validates arguments via testArgumentInstance', async () => {
    const useCase = new DomainInstanceUseCase(logger)

    await expect(useCase.execute({ value: 'ok' })).resolves.toBeUndefined()
    await expect(useCase.execute({ value: '' })).rejects.toThrow(InvalidInputError)
  })

  it('wraps predicate throws as InvalidInputError', async () => {
    const useCase = new PredicateThrowsUseCase(logger)

    await expect(useCase.execute({ value: 'x' })).rejects.toThrow(InvalidInputError)
    await expect(useCase.execute({ value: 'x' })).rejects.toThrow('Predicate exploded')
  })

  it('fails when a predicate returns undefined', async () => {
    const useCase = new UndefinedPredicateUseCase(logger)

    await expect(useCase.execute({ value: 'x' })).rejects.toThrow(InvalidInputError)
  })

  it('re-throws existing InvalidInputError from handleInvalidArgument', async () => {
    const useCase = new InvalidInputRethrowUseCase(logger)

    await expect(useCase.execute({ value: 'x' })).rejects.toThrow('Already invalid')
  })

  it('wraps generic Error values from handleInvalidArgument', async () => {
    const useCase = new GenericErrorWrapUseCase(logger)

    await expect(useCase.execute({ value: 'x' })).rejects.toThrow('Wrapped failure')
  })

  it('wraps unknown thrown values from handleInvalidArgument', async () => {
    const useCase = new UnknownErrorWrapUseCase(logger)

    await expect(useCase.execute({ value: 'x' })).rejects.toThrow(InvalidInputError)
    await expect(useCase.execute({ value: 'x' })).rejects.toThrow('Failed to process request due to illegal argument value')
  })
})
