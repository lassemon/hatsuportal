import { describe, expect, it } from 'vitest'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import _ from 'lodash'
import Story from './Story'

describe('Story', () => {
  it('can create story with all properties', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    expect(story.id.value).toBe(unitFixture.storyDTOMock().id)
    expect(story.visibility.value).toBe(unitFixture.storyDTOMock().visibility)
    expect(story.createdBy.value).toBe(unitFixture.storyDTOMock().createdBy)
    expect(story.createdByUserName.value).toBe(unitFixture.storyDTOMock().createdByUserName)
    expect(story.createdAt.value).toBe(unitFixture.storyDTOMock().createdAt)
    expect(story.updatedAt?.value).toBe(unitFixture.storyDTOMock().updatedAt)
    expect(story.image?.id.value).toBe(unitFixture.storyDTOMock().image.id)
    expect(story.name).toBe(unitFixture.storyDTOMock().name)
    expect(story.description).toBe(unitFixture.storyDTOMock().description)
  })

  it('does not allow creating an story without an id', ({ unitFixture }) => {
    const { id, ...postWithoutId } = unitFixture.storyDTOMock()
    expect(() => {
      new Story(postWithoutId as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating an story with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      new Story({ ...unitFixture.storyDTOMock(), id: ' te st ' } as any)
    }).toThrow(InvalidPostIdError)
  })

  it('can compare stories', ({ unitFixture }) => {
    const story = new Story(unitFixture.storyDTOMock())
    const otherStory = new Story({
      ...unitFixture.storyDTOMock(),
      id: uuid(),
      visibility: VisibilityEnum.Private
    })
    expect(story.equals(story)).toBe(true)
    expect(story.equals(otherStory)).toBe(false)
  })
})
