/**
 * @tsoaModel
 */
export class ApiError extends Error {
  public statusCode: number
  public statusText: string
  public context?: any

  constructor(status: number, statusText: string, message?: string, context?: any) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = status
    this.statusText = statusText
    this.context = context
    this.message = message ?? `${status} - ${statusText}`

    // Ensure the stack trace is properly captured for this error type
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}
