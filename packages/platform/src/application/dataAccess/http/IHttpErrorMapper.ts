import { ErrorResponse } from '@hatsuportal/contracts'

export interface IHttpErrorMapper {
  mapApplicationErrorToHttpError(error: unknown): ErrorResponse
}
