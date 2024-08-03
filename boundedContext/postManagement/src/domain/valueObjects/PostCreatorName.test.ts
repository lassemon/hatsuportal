import { describe, expect, it } from 'vitest'
import { PostCreatorName } from './PostCreatorName'
import { InvalidPostCreatorNameError } from '../errors/InvalidPostCreatorNameError'

describe('PostCreatorName', () => {
  it('can create a post creator name', () => {
    const postCreatorName = new PostCreatorName('image/png')
    expect(postCreatorName).to.be.instanceOf(PostCreatorName)
    expect(postCreatorName.value).to.eq('image/png')
  })

  it('does not allow creating a post creator name with an empty value', () => {
    expect(() => {
      new PostCreatorName('' as any)
    }).toThrow(InvalidPostCreatorNameError)
    expect(() => {
      new PostCreatorName(undefined as any)
    }).toThrow(InvalidPostCreatorNameError)
    expect(() => {
      new PostCreatorName(null as any)
    }).toThrow(InvalidPostCreatorNameError)
  })

  it('does not allow creating a post creator name with an invalid value', () => {
    const invalidPostCreatorNames = ['   ', 1, 0, -1] as any[]

    invalidPostCreatorNames.forEach((postCreatorName) => {
      expect(() => {
        new PostCreatorName(postCreatorName)
      }).toThrow(InvalidPostCreatorNameError)
    })
  })
})
