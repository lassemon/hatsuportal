import { ISessionExpiredNotifier } from 'application/interfaces'

export class SessionExpiredNotifier implements ISessionExpiredNotifier {
  private listener: (() => void) | null = null
  private notified = false

  setListener(listener: () => void): void {
    this.listener = listener
  }

  clearListener(): void {
    this.listener = null
  }

  notify(): void {
    if (this.notified) {
      return
    }
    this.notified = true
    this.listener?.()
  }

  reset(): void {
    this.notified = false
  }
}
