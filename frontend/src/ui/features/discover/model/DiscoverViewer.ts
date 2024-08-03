import { isPromise } from '@hatsuportal/common'
import type { AuthStateDTO } from 'ui/entities/user/state/authAtom'

export class DiscoverViewer {
  private constructor(private readonly sessionKey: string) {}

  static authIsReady(authState: AuthStateDTO | Promise<AuthStateDTO>): authState is AuthStateDTO {
    if (isPromise(authState)) {
      return false
    }
    if (authState.loggedIn && !authState.user?.id) {
      return false
    }
    return true
  }

  static fromAuth(authState: AuthStateDTO): DiscoverViewer {
    if (authState.loggedIn) {
      return new DiscoverViewer(authState.user?.id ?? 'unknown')
    }
    return new DiscoverViewer('anonymous')
  }

  toSessionKey(): string {
    return this.sessionKey
  }
}
