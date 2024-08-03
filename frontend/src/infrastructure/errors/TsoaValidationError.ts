import { HttpError } from '@hatsuportal/presentation'

export class TsoaValidationError extends HttpError {
  constructor(status: number, statusText: string, message?: string, context?: any) {
    super(status, statusText, message, context)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}