import { DomainError } from '@hatsuportal/shared-kernel'

export class RecipeDescriptionEmptyError extends DomainError {
  constructor(message?: unknown) {
    super(message || 'Recipe description cannot be empty')
  }
}
