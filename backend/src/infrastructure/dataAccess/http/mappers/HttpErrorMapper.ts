import { ErrorResponse, SupportedHttpErrorCodes } from '@hatsuportal/contracts'
import { DevelopmentPasswordPolicy, InvalidPasswordError, CannotDeleteDefaultThemeError } from '@hatsuportal/user-management'
import {
  ApplicationError,
  AuthenticationError,
  AuthorizationError,
  ConcurrencyError,
  ConflictError,
  DataPersistenceError,
  IHttpErrorMapper,
  InvalidInputError,
  NotFoundError,
  NotImplementedError
} from '@hatsuportal/platform'
import { Logger } from '@hatsuportal/platform'
import { DomainError } from '@hatsuportal/shared-kernel'

const logger = new Logger('IHttpErrorMapper')
export class HttpErrorMapper implements IHttpErrorMapper {
  private resolveApplicationError(error: unknown): unknown {
    if (error instanceof ApplicationError && error.constructor === ApplicationError && error.cause instanceof Error) {
      return error.cause
    }

    if (error instanceof ApplicationError && error.cause instanceof ApplicationError) {
      return error.cause
    }

    return error
  }

  private mapApplicationErrorByName(error: Error): ErrorResponse | null {
    switch (error.constructor.name) {
      case 'NotFoundError':
        return { status: SupportedHttpErrorCodes.NotFound, name: 'NotFound', message: error.message }
      case 'AuthenticationError':
        return { status: SupportedHttpErrorCodes.Unauthorized, name: 'Unauthorized', message: error.message }
      case 'AuthorizationError':
        return { status: SupportedHttpErrorCodes.Forbidden, name: 'Forbidden', message: error.message }
      case 'ConcurrencyError':
        return { status: SupportedHttpErrorCodes.Conflict, name: 'Conflict', message: error.message }
      case 'ConflictError':
        return { status: SupportedHttpErrorCodes.Conflict, name: 'Conflict', message: error.message }
      case 'InvalidInputError':
        return {
          status: SupportedHttpErrorCodes.UnprocessableContent,
          name: 'UnprocessableContent',
          message: error.message
        }
      case 'DataPersistenceError':
        return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
      case 'NotImplementedError':
        return { status: SupportedHttpErrorCodes.NotImplemented, name: 'NotImplemented' }
      default:
        return null
    }
  }

  public mapApplicationErrorToHttpError(error: unknown): ErrorResponse {
    const resolvedError = this.resolveApplicationError(error)
    const httpError = this.mapToHttpError(resolvedError)
    this.logIfServerError(resolvedError, httpError)
    return httpError
  }

  private mapToHttpError(error: unknown): ErrorResponse {
    if (error instanceof DomainError) {
      switch (error.constructor) {
        case InvalidPasswordError:
          return {
            status: SupportedHttpErrorCodes.BadRequest,
            name: 'InvalidPassword',
            message: `Given password is not valid. ${
              process.env.NODE_ENV === 'dev' ? new DevelopmentPasswordPolicy().getRulesMessage() : ``
            }`
          }
        case CannotDeleteDefaultThemeError:
          return {
            status: SupportedHttpErrorCodes.BadRequest,
            name: 'CannotDeleteDefaultTheme',
            message: error.message
          }
        default:
          return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
      }
    }

    if (error instanceof ApplicationError) {
      switch (error.constructor) {
        case NotFoundError:
          return { status: SupportedHttpErrorCodes.NotFound, name: 'NotFound', message: error.message }
        case AuthenticationError:
          return { status: SupportedHttpErrorCodes.Unauthorized, name: 'Unauthorized', message: error.message }
        case AuthorizationError:
          return { status: SupportedHttpErrorCodes.Forbidden, name: 'Forbidden', message: error.message }
        case ConcurrencyError:
          return { status: SupportedHttpErrorCodes.Conflict, name: 'Conflict', message: error.message }
        case ConflictError:
          return { status: SupportedHttpErrorCodes.Conflict, name: 'Conflict', message: error.message }
        case InvalidInputError:
          return {
            status: SupportedHttpErrorCodes.UnprocessableContent,
            name: 'UnprocessableContent',
            message: error.message
          }
        case DataPersistenceError:
          return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
        case NotImplementedError:
          return { status: SupportedHttpErrorCodes.NotImplemented, name: 'NotImplemented' }
        default:
          return (
            this.mapApplicationErrorByName(error) ?? {
              status: SupportedHttpErrorCodes.InternalServerError,
              name: 'InternalServerError'
            }
          )
      }
    }

    if (error instanceof Error) {
      const mappedByName = this.mapApplicationErrorByName(error)
      if (mappedByName) {
        return mappedByName
      }
    }

    return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
  }

  private logIfServerError(error: unknown, httpError: ErrorResponse): void {
    if (httpError.status < SupportedHttpErrorCodes.InternalServerError) {
      return
    }

    if (error instanceof Error) {
      let current: unknown = error
      while (current instanceof Error) {
        logger.error(current.stack ?? current.message)
        current = current.cause
      }
      return
    }

    logger.error(error)
  }
}
