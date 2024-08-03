export interface ICronJob {
  start(): void
  stop(): Promise<void>
}
