import { Logger } from '@hatsuportal/common'
import {
  ApplicationError,
  AuthenticationError,
  AuthorizationError,
  DataPersistenceError,
  ForbiddenError,
  InvalidInputError,
  NotFoundError,
  NotImplementedError
} from '@hatsuportal/application'
import { ErrorResponse } from '../api/responses/ErrorResponse'
import { SupportedHttpErrorCodes } from '../errors/HttpError'

const logger = new Logger('ErrorPresentationMapper')

export interface IErrorPresentationMapper {
  mapApplicationErrorToHttpError(error: ApplicationError): ErrorResponse
}

export class ErrorPresentationMapper implements IErrorPresentationMapper {
  public mapApplicationErrorToHttpError(error: unknown): ErrorResponse {
    if (error instanceof Error) {
      logger.error(error.stack || error.message)
    } else {
      logger.error(error)
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
