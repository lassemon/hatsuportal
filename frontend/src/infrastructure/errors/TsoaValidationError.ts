import { HttpError } from '@hatsuportal/presentation'

export class TsoaValidationError extends HttpError {
  constructor(status: number, statusText: string, message?: string, context?: any) {
    super(status, statusText, message, context)

    // Ensure the stack trace is properly captured for this error type
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
