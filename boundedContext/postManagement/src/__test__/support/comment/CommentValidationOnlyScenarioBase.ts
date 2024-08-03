import { CommentScenarioBase } from './CommentScenarioBase'
import { expect } from 'vitest'

/** Validation-only base for read use cases that do not perform authorization. */
export abstract class CommentValidationOnlyScenarioBase<INPUT, CALLBACKS extends string> extends CommentScenarioBase<
  INPUT,
  CALLBACKS
> {
  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames)
  }

  thenUnderlyingUseCaseExecuted<T extends { execute: (...args: any[]) => Promise<any> }>(useCaseMock: T) {
    this.ensureNoUnexpectedError()
    expect(useCaseMock.execute).toHaveBeenCalledTimes(1)
    return this
  }

  thenUnderlyingUseCaseNotExecuted<T extends { execute: (...args: any[]) => Promise<any> }>(useCaseMock: T) {
    this.ensureNoUnexpectedError()
    expect(useCaseMock.execute).not.toHaveBeenCalled()
    return this
  }
}
