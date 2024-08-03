import { ApplicationError } from '@hatsuportal/platform'

export class MissingBodyError extends ApplicationError {
  constructor(message?: string) {
    super(message || 'Body is required')
  }
}
