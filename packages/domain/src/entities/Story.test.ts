import { describe, expect, it } from 'vitest'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import _ from 'lodash'
import Story from './Story'

describe('Story', () => {
  it('can create story with all properties', ({ unitFixture }) => {
    const story = new Story(unitFixture.storyDTO())
    expect(story.id.value).toBe(unitFixture.storyDTO().id)
    expect(story.visibility.value).toBe(unitFixture.storyDTO().visibility)
    expect(story.createdBy.value).toBe(unitFixture.storyDTO().createdBy)
    expect(story.createdByUserName.value).toBe(unitFixture.storyDTO().createdByUserName)
    expect(story.createdAt.value).toBe(unitFixture.storyDTO().createdAt)
    expect(story.updatedAt?.value).toBe(unitFixture.storyDTO().updatedAt)
    expect(story.imageId?.value).toBe(unitFixture.storyDTO().imageId)
    expect(story.name).toBe(unitFixture.storyDTO().name)
    expect(story.description).toBe(unitFixture.storyDTO().description)
  })

  it('does not allow creating an story without an id', ({ unitFixture }) => {
    const { id, ...postWithoutId } = unitFixture.storyDTO()
    expect(() => {
      new Story(postWithoutId as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating an story with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      new Story({ ...unitFixture.storyDTO(), id: ' te st ' } as any)
    }).toThrow(InvalidPostIdError)
  })

  it('can compare stories', ({ unitFixture }) => {
    const post = new Story(unitFixture.storyDTO())
    const post2 = new Story({
      ...unitFixture.storyDTO(),
      id: uuid(),
      visibility: VisibilityEnum.Private
    })
    expect(post.equals(post)).toBe(true)
    expect(post.equals(post2)).toBe(false)
  })
})
