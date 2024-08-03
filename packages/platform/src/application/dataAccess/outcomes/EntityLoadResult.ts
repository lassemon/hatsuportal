import { EntityLoadError } from '../errors/EntityLoadError'

export class EntityLoadResult<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static success<U>(value: U): EntityLoadResult<U, never> {
    return new EntityLoadResult<U, never>(value, undefined)
  }

  static failedToLoad(entityId: string, error: Error): EntityLoadResult<never, EntityLoadError> {
    return new EntityLoadResult<never, EntityLoadError>(undefined, new EntityLoadError({ entityId, error }))
  }

  static notSet(): EntityLoadResult<never, never> {
    return new EntityLoadResult<never, never>(undefined, undefined)
  }

  get value(): T {
    if (!this.isSuccess()) {
      throw new Error('Cannot get value from a non-success EntityLoadResult')
    }
    return this._value!
  }

  get error(): E {
    if (!this.isFailed()) {
      throw new Error('Cannot get error from a non-failed EntityLoadResult')
    }
    return this._error!
  }

  isSuccess(): this is EntityLoadResult<T, never> {
    return this._value !== undefined
  }

  isFailed(): this is EntityLoadResult<never, E> {
    return this._error !== undefined
  }

  isNotSet(): this is EntityLoadResult<never, never> {
    return this._value === undefined && this._error === undefined
  }

  /**
   * Calls the appropriate function based on the result.
   *
   * Functional programming: Pattern Matching (a.k.a. Sum Type Elimination)
   *
   * **Catamorphism**, or "structured fold" over an algebraic data type.
   *   It's a way of collapsing a structure into a single value,
   *   in this case the ImageLoadResult is collapsed into either a success or failure
   *
   * @param onSuccess - The function to execute if the result is a success.
   * @param onFailure - The function to execute if the result is a failure.
   * @returns The result of the function that was executed.
   */
  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U, onNotSet: () => U): U {
    if (this.isSuccess()) return onSuccess(this._value!)
    if (this.isFailed()) return onFailure(this._error!)
    return onNotSet()
  }

  tap(fn: (value: T) => void): EntityLoadResult<T, E> {
    if (this.isSuccess()) fn(this._value!)
    return this
  }

  tapError(fn: (error: E) => void): EntityLoadResult<T, E> {
    if (this.isFailed()) fn(this._error!)
    return this
  }

  /**
   * @description Checks if the current ImageLoadResult is equal to another ImageLoadResult.
   * @param other - The other ImageLoadResult to compare with.
   * @returns True if the two ImageLoadResults are equal, false otherwise.
   */
  equals(other: unknown): boolean {
    if (!(other instanceof EntityLoadResult)) return false

    if (this.isSuccess() !== other.isSuccess()) {
      return false
    }

    if (this.isSuccess()) {
      // if equals does not exist or returns null | undefined, use ===
      return (this._value as any)?.equals?.(other._value) ?? this._value === other._value
    } else {
      return (this._error as EntityLoadError)?.error.message === (other._error as EntityLoadError)?.error.message
    }

    // For NotSet both are considered equal when state matches
    return true
  }

  toString(): string {
    return `Result<${this._value}, ${this._error?.toString()}>`
  }
}
