import { InputLimits } from '@hatsuportal/contracts'
import { describe, expect, it } from 'vitest'
import { RecipeDescriptionEmptyError } from '../errors/RecipeDescriptionEmptyError'
import { RecipeDescriptionTooLongError } from '../errors/RecipeDescriptionTooLongError'
import { RecipeDescription } from './RecipeDescription'

describe('RecipeDescription', () => {
  it('creates from valid description', () => {
    const description = new RecipeDescription('A hearty stew.')
    expect(description.value).toBe('A hearty stew.')
  })

  it('trims whitespace before validation', () => {
    const description = new RecipeDescription('  A hearty stew.  ')
    expect(description.value).toBe('A hearty stew.')
  })

  it('rejects empty description', () => {
    expect(() => new RecipeDescription('')).toThrow(RecipeDescriptionEmptyError)
    expect(() => new RecipeDescription('   ')).toThrow(RecipeDescriptionEmptyError)
  })

  it('rejects over-limit description', () => {
    expect(() => new RecipeDescription('x'.repeat(InputLimits.recipeDescription + 1))).toThrow(RecipeDescriptionTooLongError)
  })

  it('accepts description at max length after trim', () => {
    const description = new RecipeDescription(`  ${'x'.repeat(InputLimits.recipeDescription)}  `)
    expect(description.value).toBe('x'.repeat(InputLimits.recipeDescription))
  })
})
