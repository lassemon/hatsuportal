export type ErrorFoundationInput = string | Error | { message?: string; cause?: unknown } | undefined

/**
 * Base class for all exceptions.
 * - Accepts an optional message or Error
 * - Accepts the native { cause } ErrorOptions (Node 16⁺ / TS 4.6⁺)
 * - Captures its own stack trace for logging/serialization
 */
class ErrorFoundation extends Error {
  /** JSON-friendly copy of a stack (own or wrapped) */
  public readonly stack_trace: string | undefined

  constructor(input?: ErrorFoundationInput, defaultMessage = 'Foundation error') {
    /* ------------------------------------------------------------------ *
     * 1. Derive the public-facing message
     * ------------------------------------------------------------------ */
    let message: string
    if (typeof input === 'string') {
      message = input
    } else if (input instanceof Error) {
      message = input.message
    } else if (input && typeof input === 'object' && 'message' in input && input.message) {
      message = input.message
    } else {
      message = defaultMessage
    }

    /* ------------------------------------------------------------------ *
     * 2. Derive the causal error (Node >= 16 supports { cause })
     * ------------------------------------------------------------------ */
    let cause: Error | undefined
    if (input instanceof Error) {
      cause = input
    } else if (input && typeof input === 'object' && 'cause' in input && input.cause) {
      cause = input.cause instanceof Error ? input.cause : undefined
    }

    /* ------------------------------------------------------------------ *
     * 3. Invoke the native Error constructor
     * ------------------------------------------------------------------ */
    super(message, cause ? { cause } : undefined)

    /* ------------------------------------------------------------------ *
     * 4. Prototype & metadata fixes (ES5 targets, logging, etc.)
     * ------------------------------------------------------------------ */
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = new.target.name

    /* ------------------------------------------------------------------ *
     * 5. Capture or forward the stack trace for serialisation
     * ------------------------------------------------------------------ */
    if (input instanceof Error && input.stack) {
      this.stack_trace = input.stack
    } else {
      Error.captureStackTrace?.(this, new.target)
      this.stack_trace = this.stack
    }
  }
}

export default ErrorFoundation
