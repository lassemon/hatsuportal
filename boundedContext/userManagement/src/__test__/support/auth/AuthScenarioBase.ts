import { expect, vi } from 'vitest'
import { ScenarioBase } from '../ScenarioBase'
import { IUserRepository } from '../../../application'

export abstract class AuthScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, {}> {
  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, {})
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────  }
  repositoryWillReject(method: keyof IUserRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.userRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  // ───────────────────────────────────────────────────────────────────
  // THEN helpers
  // ───────────────────────────────────────────────────────────────────
  thenRepositoryCalledTimes(method: keyof IUserRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.userRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
