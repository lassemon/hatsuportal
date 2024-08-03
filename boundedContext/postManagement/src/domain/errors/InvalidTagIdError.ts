import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidTagIdError extends InvalidUniqueIdError {
  constructor(message: unknown) {
    super(message || 'Invalid tag id')
  }
}
