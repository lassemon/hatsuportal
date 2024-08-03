import ApplicationError from './ApplicationError'

export class DataPersistenceError extends ApplicationError {
  constructor(message?: string) {
    super(message)
  }
}
