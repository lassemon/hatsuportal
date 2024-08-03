import PresentationError from './PresentationError'

export enum SupportedHttpErrorCodes {
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  UnprocessableContent = 422,
  NotFound = 404,
  InternalServerError = 500,
  NotImplemented = 501
}

export class HttpError extends PresentationError {
  public status: number
  public statusText: string
  public context?: any

  constructor(status: number, statusText: string, message?: string, context?: any) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.statusText = statusText
    this.context = context
    this.message = message ?? `${status} - ${statusText}`

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}