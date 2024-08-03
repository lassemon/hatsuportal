import { UserLoadError } from '../errors/UserLoadError'

export class UserLoadResult<T, E = UserLoadError> {
  private constructor(private readonly _value?: T, private readonly _error?: E) {}

  static success<U>(value: U): UserLoadResult<U, never> {
    return new UserLoadResult<U, never>(value, undefined)
  }

  static failedToLoad(userId: string, error: Error): UserLoadResult<never, UserLoadError> {
    return new UserLoadResult<never, UserLoadError>(undefined, new UserLoadError({ userId, error }))
  }

  static notSet(): UserLoadResult<never, never> {
    return new UserLoadResult<never, never>(undefined, undefined)
  }

  get value(): T {
    if (!this.isSuccess()) {
      throw new Error('Cannot get value from a non-success UserLoadResult')
    }
    return this._value!
  }

  get error(): E {
    if (!this.isFailed()) {
      throw new Error('Cannot get error from a non-failed UserLoadResult')
    }
    return this._error!
  }

  isSuccess(): this is UserLoadResult<T, never> {
    return this._value !== undefined
  }

  isFailed(): this is UserLoadResult<never, E> {
    return this._value === undefined && this._error !== undefined
  }

  isNotSet(): this is UserLoadResult<never, never> {
    return this._value === undefined && this._error === undefined
  }

  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U, onNotSet: () => U): U {
    if (this.isSuccess()) return onSuccess(this._value!)
    if (this.isFailed()) return onFailure(this._error!)
    return onNotSet()
  }

  tap(fn: (value: T) => void): UserLoadResult<T, E> {
    if (this.isSuccess()) fn(this._value!)
    return this
  }

  tapError(fn: (error: E) => void): UserLoadResult<T, E> {
    if (this.isFailed()) fn(this._error!)
    return this
  }

  equals(other: unknown): boolean {
    if (!(other instanceof UserLoadResult)) return false

    if (this.isSuccess() !== other.isSuccess()) {
      return false
    }

    if (this.isSuccess()) {
      return (this._value as any)?.equals?.(other._value) ?? this._value === other._value
    } else {
      return (this._error as UserLoadError)?.error.message === (other._error as UserLoadError)?.error.message
    }

    // For NotSet both are considered equal when state matches
    return true
  }

  toString(): string {
    return `UserLoadResult<${this._value}, ${this._error?.toString()}>`
  }
}
