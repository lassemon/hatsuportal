import { EntityDTO } from './AbstractEntity'
import { Entity } from './Entity'

export interface RecipeDTO extends EntityDTO {
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  readonly createdBy: string
}

export class Recipe extends Entity<RecipeDTO> {
  constructor(props: RecipeDTO) {
    super({ ...props })
  }

  public get name() {
    return this.props.name
  }

  public get description() {
    return this.props.description
  }

  public get ingredients() {
    return this.props.ingredients
  }

  public get instructions() {
    return this.props.instructions
  }
}

export default Recipe
