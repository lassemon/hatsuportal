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
    expect(story.createdById.value).toBe(unitFixture.storyDTOMock().createdById)
    expect(story.createdByName.value).toBe(unitFixture.storyDTOMock().createdByName)
    expect(story.createdAt.value).toBe(unitFixture.storyDTOMock().createdAt)
    expect(story.updatedAt?.value).toBe(unitFixture.storyDTOMock().updatedAt)
    expect(story.image?.id.value).toBe(unitFixture.storyDTOMock().image.id)
    expect(story.name.value).toBe(unitFixture.storyDTOMock().name)
    expect(story.description.value).toBe(unitFixture.storyDTOMock().description)
  })

  it('does not allow creating an story without an id', ({ unitFixture }) => {
    const { id, ...postWithoutId } = unitFixture.storyDTOMock()
    expect(() => {
      Story.create(postWithoutId as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating an story with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      Story.create({ ...unitFixture.storyDTOMock(), id: ' te st ' } as any)
    }).toThrow(InvalidPostIdError)
  })

  it('can compare stories', ({ unitFixture }) => {
    const story = Story.create(unitFixture.storyDTOMock())
    const otherStory = Story.create({
      ...unitFixture.storyDTOMock(),
      id: uuid(),
      visibility: VisibilityEnum.Private
    })
    expect(story.equals(story)).toBe(true)
    expect(story.equals(otherStory)).toBe(false)
  })
})
