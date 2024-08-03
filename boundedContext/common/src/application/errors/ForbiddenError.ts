import ApplicationError from './ApplicationError'

export class ForbiddenError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Forbidden error')
  }
}
