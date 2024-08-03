import { describe, expect, it } from 'vitest'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import Recipe from './Recipe'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import _ from 'lodash'

describe('Recipe', () => {
  it('can create recipe with all properties', ({ unitFixture }) => {
    const recipe = unitFixture.recipeMock()
    const dto = unitFixture.recipeDTOMock()
    expect(recipe.id.value).toBe(dto.id)
    expect(recipe.visibility.value).toBe(dto.visibility)
    expect(recipe.createdById.value).toBe(dto.createdById)
    expect(recipe.createdByName.value).toBe(dto.createdByName)
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
      Recipe.canCreate(recipeWithoutId as any, { throwError: true })
    }).toThrow(InvalidPostIdError)
    expect(Recipe.canCreate(recipeWithoutId as any)).toBe(false)
  })

  it('does not allow creating a recipe with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      Recipe.canCreate({ ...unitFixture.recipeDTOMock(), id: ' te st ' }, { throwError: true })
    }).toThrow(InvalidPostIdError)
    expect(Recipe.canCreate({ ...unitFixture.recipeDTOMock(), id: ' te st ' })).toBe(false)
  })

  it('does not allow creating a recipe without a name', ({ unitFixture }) => {
    const { name, ...recipeWithoutName } = unitFixture.recipeDTOMock()
    expect(() => {
      Recipe.reconstruct(recipeWithoutName as any)
    }).toThrow()
    expect(Recipe.canCreate(recipeWithoutName as any)).toBe(false)
  })

  it('can reconstruct a recipe from props', ({ unitFixture }) => {
    const props = unitFixture.recipeDTOMock()
    const recipe = Recipe.reconstruct(props)
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
    const recipe = Recipe.reconstruct(unitFixture.recipeDTOMock())
    const otherRecipe = Recipe.reconstruct({
      ...unitFixture.recipeDTOMock(),
      id: uuid(),
      visibility: VisibilityEnum.Private
    })
    expect(recipe.equals(recipe)).toBe(true)
    expect(recipe.equals(otherRecipe)).toBe(false)
  })
})
