import { describe, expect, it } from 'vitest'
import Recipe from './Recipe'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import { uuid } from '@hatsuportal/common'
import { NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostId } from '../valueObjects/PostId'

describe('Recipe', () => {
  it('can create recipe with all properties', ({ unitFixture }) => {
    const recipe = unitFixture.recipeMock()
    const dto = unitFixture.recipeDTOMock()
    expect(recipe.id.value).toBe(dto.id)
    expect(recipe.createdById.value).toBe(dto.createdById)
    expect(recipe.createdAt.value).toBe(dto.createdAt)
    expect(recipe.updatedAt?.value).toBe(dto.updatedAt)
    expect(recipe.name.value).toBe(dto.name)
    expect(recipe.description).toBe(dto.description)
    expect(recipe.ingredients).toStrictEqual(dto.ingredients)
    expect(recipe.instructions).toStrictEqual(dto.instructions)
  })

  it('does not allow creating a recipe without an id', ({ unitFixture }) => {
    const { id, ...recipeWithoutId } = unitFixture.recipeDTOMock()
    expect(() => {
      Recipe.assertCanCreate(recipeWithoutId as any)
    }).toThrow(InvalidPostIdError)
    expect(Recipe.canCreate(recipeWithoutId as any)).toBe(false)
  })

  it('does not allow creating a recipe with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      Recipe.assertCanCreate({ ...unitFixture.recipeDTOMock(), id: ' te st ' })
    }).toThrow(InvalidPostIdError)
    expect(Recipe.canCreate({ ...unitFixture.recipeDTOMock(), id: ' te st ' })).toBe(false)
  })

  it('can reconstruct a recipe from props', ({ unitFixture }) => {
    const props = unitFixture.recipeDTOMock()
    const recipe = Recipe.reconstruct({
      id: new PostId(props.id),
      createdById: new PostCreatorId(props.createdById),
      name: new NonEmptyString(props.name),
      description: props.description,
      ingredients: props.ingredients,
      instructions: props.instructions,
      createdAt: new UnixTimestamp(props.createdAt),
      updatedAt: new UnixTimestamp(props.updatedAt)
    })
    expect(recipe.id.value).toBe(props.id)
    expect(recipe.name.value).toBe(props.name)
    expect(recipe.description).toBe(props.description)
    expect(recipe.ingredients).toStrictEqual(props.ingredients)
    expect(recipe.instructions).toStrictEqual(props.instructions)
  })

  it('canCreate returns true for valid props', ({ unitFixture }) => {
    const props = unitFixture.recipeDTOMock()
    expect(Recipe.canCreate(props)).toBe(true)
  })

  it('canCreate returns false for invalid props', ({ unitFixture }) => {
    const { id, ...invalidProps } = unitFixture.recipeDTOMock()
    expect(Recipe.canCreate(invalidProps as any)).toBe(false)
  })

  it('can compare recipes', ({ unitFixture }) => {
    const recipe = unitFixture.recipeMock()
    const otherRecipe = unitFixture.recipeMock({ id: new PostId(uuid()) })
    expect(recipe.equals(recipe)).toBe(true)
    expect(recipe.equals(otherRecipe)).toBe(false)
  })
})
