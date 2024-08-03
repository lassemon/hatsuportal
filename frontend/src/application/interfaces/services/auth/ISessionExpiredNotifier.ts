export interface ISessionExpiredNotifier {
  setListener(listener: () => void): void
  clearListener(): void
  notify(): void
  reset(): void
}
