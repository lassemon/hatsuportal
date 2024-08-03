import { InvalidUniqueIdError } from '@hatsuportal/shared-kernel'

export class InvalidTagCreatorIdError extends InvalidUniqueIdError {
  constructor(message?: unknown) {
    super(message || 'Invalid tag creator id')
  }
}
