import { expect, vi } from 'vitest'
import { ScenarioBase } from '../ScenarioBase'
import { IUserWriteRepository } from '../../../domain'
import { StrictPasswordPolicy } from '../../../infrastructure/authentication/StrictPasswordPolicy'
import { PasswordFactory } from '../../../application/authentication/PasswordFactory'

export abstract class AuthScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, {}> {
  protected readonly passwordPolicy = new StrictPasswordPolicy()
  protected readonly passwordFactory = new PasswordFactory(this.passwordPolicy)

  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, {})
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  repositoryWillReject(method: keyof IUserWriteRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.userWriteRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  // ───────────────────────────────────────────────────────────────────
  // THEN helpers
  // ───────────────────────────────────────────────────────────────────
  thenRepositoryCalledTimes(method: keyof IUserWriteRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.userWriteRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
