import { expect, vi } from 'vitest'
import { ScenarioBase } from '../ScenarioBase'
import * as Fixture from '../../testFactory'
import { IUserRepository } from '@hatsuportal/user-management'

export abstract class AuthScenarioBase<INPUT, CALLBACKS extends string> extends ScenarioBase<INPUT, CALLBACKS, {}> {
  protected constructor(callbackNames: CALLBACKS[]) {
    super(callbackNames, {})
  }

  // ───────────────────────────────────────────────────────────────────
  // GIVEN helpers (all fluent, return `this`)
  // ───────────────────────────────────────────────────────────────────
  withLoggedInUser(user = Fixture.userMock()) {
    this.userRepository.findById = vi.fn().mockResolvedValue(user)
    return this
  }

  withoutLoggedInUser() {
    this.userRepository.findById = vi.fn().mockResolvedValue(null)
    return this
  }

  repositoryWillReject(method: keyof IUserRepository, error: Error = new Error('Repository failure')) {
    // @ts-expect-error – the mock infra object definitely has this key
    this.userRepository[method] = vi.fn().mockRejectedValue(error)
    return this
  }

  thenRepositoryCalledTimes(method: keyof IUserRepository, times: number) {
    this.ensureExecutionCompleted()
    this.ensureNoUnexpectedError()
    expect(this.userRepository[method]).toHaveBeenCalledTimes(times)
    return this
  }
}
