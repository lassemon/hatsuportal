import { Logger } from '@hatsuportal/common'
import {
  ApplicationError,
  AuthenticationError,
  AuthorizationError,
  ConcurrencyError,
  DataPersistenceError,
  DomainError,
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
  NotImplementedError
} from '@hatsuportal/common-bounded-context'
import { ErrorResponse } from '../api/responses/ErrorResponse'
import { SupportedHttpErrorCodes } from '../errors/HttpError'
import { InvalidPasswordError, Password } from '@hatsuportal/user-management'

const logger = new Logger('ErrorPresentationMapper')

export interface IErrorPresentationMapper {
  mapApplicationErrorToHttpError(error: unknown): ErrorResponse
}

export class ErrorPresentationMapper implements IErrorPresentationMapper {
  public mapApplicationErrorToHttpError(error: unknown): ErrorResponse {
    if (error instanceof AuthenticationError) {
      logger.error(error.message)
    } else if (error instanceof Error) {
      logger.error(error.stack || error.message)
    } else {
      logger.error(error)
    }

    if (error instanceof DomainError) {
      switch (error.constructor) {
        case InvalidPasswordError:
          return {
            status: SupportedHttpErrorCodes.BadRequest,
            name: 'InvalidPassword',
            message: `Given password is not valid. ${Password.getPasswordRulesMessage()}`
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
          return { status: SupportedHttpErrorCodes.Unauthorized, name: 'Unauthorized', message: error.message }
        case ForbiddenError:
          return { status: SupportedHttpErrorCodes.Forbidden, name: 'Forbidden', message: error.message }
        case ConcurrencyError:
          return { status: SupportedHttpErrorCodes.Conflict, name: 'Conflict', message: error.message }
        case InvalidInputError:
          return { status: SupportedHttpErrorCodes.UnprocessableContent, name: 'UnprocessableContent', message: error.message }
        case DataPersistenceError:
          return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
        case NotImplementedError:
          return { status: SupportedHttpErrorCodes.NotImplemented, name: 'NotImplemented' }
        default:
          return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
      }
    }

    return { status: SupportedHttpErrorCodes.InternalServerError, name: 'InternalServerError' }
  }
}
