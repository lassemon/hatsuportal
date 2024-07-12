import { ApiError } from './ApiError'

export class UnknownError extends ApiError {
  constructor(status: number, statusText: string, message?: string) {
    super(status, statusText, message)

    // Ensure the stack trace is properly captured for this error type
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
