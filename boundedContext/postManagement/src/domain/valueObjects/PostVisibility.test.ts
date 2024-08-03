import { describe, expect, it } from 'vitest'
import { PostVisibility } from './PostVisibility'
import { InvalidPostVisibilityError } from '../errors/InvalidPostVisibilityError'
import { VisibilityEnum } from '@hatsuportal/common'

describe('PostVisibility', () => {
  it('can create post visibility', () => {
    const visibility = new PostVisibility(VisibilityEnum.Public)
    expect(visibility).to.be.instanceOf(PostVisibility)
    expect(visibility.value).to.eq(VisibilityEnum.Public)
  })

  it('does not allow creating post visibility with an empty value', () => {
    expect(() => {
      new PostVisibility('' as any)
    }).toThrow(InvalidPostVisibilityError)
    expect(() => {
      new PostVisibility(undefined as any)
    }).toThrow(InvalidPostVisibilityError)
    expect(() => {
      new PostVisibility(null as any)
    }).toThrow(InvalidPostVisibilityError)
  })

  it('does not allow creating post visibility with an invalid value', () => {
    const invalidPostVisibility = ['   ', 'testASDtest', 1, 0, -1] as any[]

    invalidPostVisibility.forEach((visibility) => {
      expect(() => {
        new PostVisibility(visibility as any)
      }).toThrow(InvalidPostVisibilityError)
    })
  })
})
