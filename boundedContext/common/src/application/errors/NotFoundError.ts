import ApplicationError from './ApplicationError'

export class NotFoundError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Not found')
  }
}
