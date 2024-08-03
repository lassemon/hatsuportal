import { unixtimeNow } from '@hatsuportal/common'
import { Post, PostProps } from './Post'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostId } from '../valueObjects/PostId'

export interface RecipeProps extends PostProps {
  name: NonEmptyString
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
      props.name instanceof NonEmptyString ? props.name : new NonEmptyString(props.name),
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
      props.name,
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
      props.name,
      props.description,
      props.ingredients,
      props.instructions,
      props.createdAt,
      props.updatedAt
    )
  }

  private _name: NonEmptyString
  private _description: string
  private _ingredients: string[]
  private _instructions: string[]

  private constructor(
    id: PostId,
    createdById: PostCreatorId,
    name: NonEmptyString,
    description: string,
    ingredients: string[],
    instructions: string[],
    createdAt: UnixTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdById, createdAt, updatedAt)
    this._name = name
    this._description = description
    this._ingredients = ingredients
    this._instructions = instructions
  }

  rename(name: NonEmptyString): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get name(): NonEmptyString {
    return this._name
  }

  public updateDescription(description: string): void {
    this._description = description
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get description() {
    return this._description
  }

  public updateIngredients(ingredients: string[]): void {
    this._ingredients = ingredients
    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get ingredients() {
    return this._ingredients
  }

  public updateInstructions(instructions: string[]): void {
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
      name: this._name.value,
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
      this._name,
      this._description,
      this._ingredients,
      this._instructions,
      this.createdAt,
      this.updatedAt
    )
  }

  delete(): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
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
