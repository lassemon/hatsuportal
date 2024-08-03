import ApplicationError from './ApplicationError'

export class InvalidViewModelPropertyError extends ApplicationError {
  constructor(message?: unknown) {
    super(message || 'Invalid view model property')
  }
}
