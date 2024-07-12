import { NextFunction, Request, Response } from 'express'
import { Logger } from '@hatsuportal/common'
import { ApiError } from '@hatsuportal/domain'
import { ErrorResponseDTO } from '@hatsuportal/application'
import { ValidateError } from 'tsoa'

const logger = new Logger('App')

export const errorMiddleware = (error: Error, request: Request, response: Response, next: NextFunction) => {
  logger.error(error)
  if (error instanceof ApiError) {
    const status = error.statusCode || 500
    const body: ErrorResponseDTO = {
      message: error.message || 'An error occurred during the request',
      name: error.name,
      status
    }
    response.status(status).json(body)
  }

  if (error instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${request.path}:`, error.fields)
    return response.status(422).json({
      message: 'Validation Failed',
      details: error?.fields
    })
  }

  return response.status(500).json({
    message: 'Internal Server Error'
  })
}
