import ApplicationError from './ApplicationError'

export class NotImplementedError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Not implemented')
  }
}
