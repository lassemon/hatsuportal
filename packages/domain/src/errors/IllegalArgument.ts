import { ApiError } from './ApiError'

export class IllegalArgument extends ApiError {
  constructor(status: number = 400, statusText: string, message?: string, context?: any) {
    super(status, statusText, message, context)

    // Ensure the stack trace is properly captured for this error type
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
