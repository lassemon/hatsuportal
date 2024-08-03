import { isEnumValue, Logger, omitNullAndUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { UnixTimestamp } from '@hatsuportal/common-bounded-context'
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

  private _name: string
  private _description: string
  private _ingredients: string[]
  private _instructions: string[]

  constructor(props: RecipeProps) {
    super({ ...props })
    this._name = props.name
    this._description = props.description
    this._ingredients = props.ingredients
    this._instructions = props.instructions
  }

  public get name() {
    return this._name
  }

  public set name(name: string) {
    this._name = name
  }

  public get description() {
    return this._description
  }

  public set description(description: string) {
    this._description = description
  }

  public get ingredients() {
    return this._ingredients
  }

  public set ingredients(ingredients: string[]) {
    this._ingredients = ingredients
  }

  public get instructions() {
    return this._instructions
  }

  public set instructions(instructions: string[]) {
    this._instructions = instructions
  }

  getProps(): RecipeProps {
    return {
      id: this._id.value,
      name: this._name,
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
      if (sanitizedProps.name) this.name = sanitizedProps.name
      if (sanitizedProps.description) this.description = sanitizedProps.description
      if (sanitizedProps.ingredients) this.ingredients = sanitizedProps.ingredients
      if (sanitizedProps.instructions) this.instructions = sanitizedProps.instructions
      this._updatedAt = new UnixTimestamp(unixtimeNow())
    }
  }

  delete(): void {
    this.clearEvents()
    //TODO this.addDomainEvent(new RecipeDeletedEvent(this))
  }
}

export default Recipe
