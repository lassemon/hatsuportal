import ApplicationError from './ApplicationError'

export class NotImplementedError extends ApplicationError {
  constructor(message?: string) {
    super(message)
  }
}
