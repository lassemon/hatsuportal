class PresentationError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace ? Error.captureStackTrace(this, this.constructor) : null
  }
}

export default PresentationError
