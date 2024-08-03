import { InputLimits } from '@hatsuportal/contracts'
import { isNonStringOrEmpty } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { RecipeDescriptionEmptyError } from '../errors/RecipeDescriptionEmptyError'
import { RecipeDescriptionTooLongError } from '../errors/RecipeDescriptionTooLongError'

export class RecipeDescription extends NonEmptyString {
  constructor(raw: string) {
    if (typeof raw !== 'string') throw new RecipeDescriptionEmptyError(`Value '${raw}' is not a valid recipe description.`)

    const value = raw.trim()
    if (isNonStringOrEmpty(value)) throw new RecipeDescriptionEmptyError(`Value '${raw}' is not a valid recipe description.`)
    if (value.length > InputLimits.recipeDescription) {
      throw new RecipeDescriptionTooLongError(`Recipe description must be at most ${InputLimits.recipeDescription} characters.`)
    }

    super(value)
  }

  override equals(other: unknown): boolean {
    return other instanceof RecipeDescription && this.value === other.value
  }

  override toString(): string {
    return this.value
  }
}
