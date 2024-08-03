import { DomainError } from '@hatsuportal/shared-kernel'

export class RecipeDescriptionTooLongError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Recipe description is too long')
  }
}
