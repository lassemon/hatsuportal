import { SupportedHttpErrorCodes } from '../../errors/HttpError'

export interface ErrorResponse {
  message?: string
  name: string
  status: SupportedHttpErrorCodes
}
