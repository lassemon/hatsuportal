import { unixtimeNow } from '@hatsuportal/common'
import { Post, PostProps } from './Post'
import { CreatedAtTimestamp, NonEmptyString, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostId } from '../valueObjects/PostId'
import { PostVisibility } from '../valueObjects/PostVisibility'

export interface RecipeProps extends PostProps {
  description: string
  ingredients: string[]
  instructions: string[]
}

export class Recipe extends Post {
  static canCreate(props: any): boolean {
    try {
      Recipe.assertCanCreate(props)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    new Recipe(
      props.id instanceof PostId ? props.id : new PostId(props.id),
      props.createdById instanceof PostCreatorId ? props.createdById : new PostCreatorId(props.createdById),
      props.title instanceof NonEmptyString ? props.title : new NonEmptyString(props.title),
      props.visibility instanceof PostVisibility ? props.visibility : new PostVisibility(props.visibility),
      props.description instanceof NonEmptyString ? props.description : new NonEmptyString(props.description),
      props.ingredients.map((ingredient: any) => (ingredient instanceof NonEmptyString ? ingredient : new NonEmptyString(ingredient))),
      props.instructions.map((instruction: any) => (instruction instanceof NonEmptyString ? instruction : new NonEmptyString(instruction))),
      props.createdAt instanceof UnixTimestamp ? props.createdAt : new UnixTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: RecipeProps): Recipe {
    const recipe = new Recipe(
      props.id,
      props.createdById,
      props.title,
      props.visibility,
      props.description,
      props.ingredients,
      props.instructions,
      props.createdAt,
      props.updatedAt
    )
    //recipe.addDomainEvent(new RecipeCreatedEvent(recipe))
    return recipe
  }

  static reconstruct(props: RecipeProps): Recipe {
    return new Recipe(
      props.id,
      props.createdById,
      props.title,
      props.visibility,
      props.description,
      props.ingredients,
      props.instructions,
      props.createdAt,
      props.updatedAt
    )
  }

  private _description: string
  private _ingredients: string[]
  private _instructions: string[]

  private constructor(
    id: PostId,
    createdById: PostCreatorId,
    title: NonEmptyString,
    visibility: PostVisibility,
    description: string,
    ingredients: string[],
    instructions: string[],
    createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, title, visibility, createdById, createdAt, updatedAt)
    this._description = description
    this._ingredients = ingredients
    this._instructions = instructions
  }

  public override rename(title: NonEmptyString, updatedById: UniqueId): void {
    super.rename(title, updatedById)
  }

  public updateDescription(description: string, updatedById: UniqueId): void {
    this._description = description
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get description() {
    return this._description
  }

  public updateIngredients(ingredients: string[], updatedById: UniqueId): void {
    this._ingredients = ingredients
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get ingredients() {
    return this._ingredients
  }

  public updateInstructions(instructions: string[], updatedById: UniqueId): void {
    this._instructions = instructions
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get instructions() {
    return this._instructions
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      title: this.title.value,
      visibility: this.visibility.value,
      description: this._description,
      ingredients: this._ingredients,
      instructions: this._instructions,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this._updatedAt.value
    }
  }

  public clone(): Recipe {
    return new Recipe(
      this.id,
      this.createdById,
      this.title,
      this.visibility,
      this._description,
      this._ingredients,
      this._instructions,
      this.createdAt,
      this.updatedAt
    )
  }

  delete(deletedById: UniqueId): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    //TODO this.addDomainEvent(new RecipeDeletedEvent(this))
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof Recipe &&
      this.description === other.description &&
      this.ingredients === other.ingredients &&
      this.instructions === other.instructions
    )
  }
}

export default Recipe
