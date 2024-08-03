import { EntityLoadError } from '../errors/EntityLoadError'

export type EntityLoadResultState = 'success' | 'failure' | 'skipped'

export class EntityLoadResult<T, E = EntityLoadError> {
  private constructor(
    private readonly state: EntityLoadResultState,
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static success<U>(value: U): EntityLoadResult<U, never> {
    return new EntityLoadResult<U, never>('success', value, undefined)
  }

  static failure<E>(error: E): EntityLoadResult<never, E> {
    return new EntityLoadResult<never, E>('failure', undefined, error)
  }

  static skipped(): EntityLoadResult<never, never> {
    return new EntityLoadResult<never, never>('skipped', undefined, undefined)
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
    return this.state === 'success'
  }

  isFailed(): this is EntityLoadResult<never, E> {
    return this.state === 'failure'
  }

  isSkipped(): this is EntityLoadResult<never, never> {
    return this.state === 'skipped'
  }

  match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U, onSkipped: () => U): U {
    if (this.isSuccess()) return onSuccess(this._value!)
    if (this.isFailed()) return onFailure(this._error!)
    return onSkipped()
  }

  tap(fn: (value: T) => void): EntityLoadResult<T, E> {
    if (this.isSuccess()) fn(this._value!)
    return this
  }

  tapError(fn: (error: E) => void): EntityLoadResult<T, E> {
    if (this.isFailed()) fn(this._error!)
    return this
  }

  toString(): string {
    return `EntityLoadResult<${this.state}, ${String(this._value)}, ${String(this._error)}>`
  }
}
