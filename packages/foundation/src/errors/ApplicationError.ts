import ErrorFoundation from './ErrorFoundation'

/**
 * Base class for all application exceptions.
 * - Accepts an optional message or Error
 * - Accepts the native { cause } ErrorOptions (Node 16⁺ / TS 4.6⁺)
 * - Captures its own stack trace for logging/serialization
 */
class ApplicationError extends ErrorFoundation {}

export default ApplicationError
