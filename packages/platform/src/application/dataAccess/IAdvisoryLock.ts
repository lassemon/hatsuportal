export interface IAdvisoryLock {
  tryAcquire(): Promise<boolean>
  release(): Promise<void>
}
