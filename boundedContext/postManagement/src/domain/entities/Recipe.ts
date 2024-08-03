import { isEnumValue, Logger, omitNullAndUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import { Post, PostProps } from './Post'
import { PostVisibility } from '../valueObjects/PostVisibility'

const logger = new Logger('Recipe')

export interface RecipeProps extends PostProps {
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
}

interface CanCreateOptions {
  throwError?: boolean
}

export class Recipe extends Post<RecipeProps> {
  static canCreate(props: any, { throwError = false }: CanCreateOptions = {}) {
    try {
      new Recipe(props)
      return true
    } catch (error) {
      logger.warn(error)
      if (throwError) {
        throw error
      }
      return false
    }
  }

  static create(props: RecipeProps): Recipe {
    const recipe = new Recipe(props)
    //recipe.addDomainEvent(new RecipeCreatedEvent(recipe))
    return recipe
  }

  static reconstruct(props: RecipeProps): Recipe {
    return new Recipe(props)
  }

  private _name: NonEmptyString
  private _description: string
  private _ingredients: string[]
  private _instructions: string[]

  private constructor(props: RecipeProps) {
    super({ ...props })
    this._name = new NonEmptyString(props.name)
    this._description = props.description
    this._ingredients = props.ingredients
    this._instructions = props.instructions
  }

  public get name(): NonEmptyString {
    return this._name
  }

  public get description() {
    return this._description
  }

  public get ingredients() {
    return this._ingredients
  }

  public get instructions() {
    return this._instructions
  }

  getProps(): RecipeProps {
    return {
      id: this._id.value,
      name: this._name.value,
      description: this._description,
      ingredients: this._ingredients,
      instructions: this._instructions,
      visibility: this._visibility.value,
      createdById: this._createdById.value,
      createdByName: this._createdByName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  update(props: Partial<RecipeProps>): void {
    const sanitizedProps = omitNullAndUndefined(props)

    if (Recipe.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (isEnumValue(sanitizedProps.visibility, VisibilityEnum)) this._visibility = new PostVisibility(sanitizedProps.visibility)
      if (sanitizedProps.name) this._name = new NonEmptyString(sanitizedProps.name)
      if (sanitizedProps.description) this._description = sanitizedProps.description
      if (sanitizedProps.ingredients) this._ingredients = sanitizedProps.ingredients
      if (sanitizedProps.instructions) this._instructions = sanitizedProps.instructions

      this._updatedAt = new UnixTimestamp(unixtimeNow())

      //this.addDomainEvent(new RecipeUpdatedEvent(this))
    }
  }

  delete(): void {
    this.clearEvents()
    //TODO this.addDomainEvent(new RecipeDeletedEvent(this))
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof Recipe &&
      this.name === other.name &&
      this.description === other.description &&
      this.ingredients === other.ingredients &&
      this.instructions === other.instructions
    )
  }
}

export default Recipe
