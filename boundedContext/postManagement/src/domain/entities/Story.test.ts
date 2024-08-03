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

  it('does not allow creating a story without a name', ({ unitFixture }) => {
    const { name, ...storyWithoutName } = unitFixture.storyDTOMock()
    expect(() => {
      Story.create(storyWithoutName as any)
    }).toThrow()
  })

  it('does not allow creating a story without a description', ({ unitFixture }) => {
    const { description, ...storyWithoutDescription } = unitFixture.storyDTOMock()
    expect(() => {
      Story.create(storyWithoutDescription as any)
    }).toThrow()
  })

  it('can create a story without an image', ({ unitFixture }) => {
    const { image, ...storyWithoutImage } = unitFixture.storyDTOMock()
    const story = Story.create(storyWithoutImage as any)
    expect(story.image).toBeNull()
    expect(story.name.value).toBe(storyWithoutImage.name)
    expect(story.description.value).toBe(storyWithoutImage.description)
  })

  it('can reconstruct a story from props', ({ unitFixture }) => {
    const props = unitFixture.storyDTOMock()
    const story = Story.reconstruct(props)
    expect(story.id.value).toBe(props.id)
    expect(story.name.value).toBe(props.name)
    expect(story.description.value).toBe(props.description)
    expect(story.image?.id.value).toBe(props.image.id)
  })

  it('canCreate returns true for valid props', ({ unitFixture }) => {
    const props = unitFixture.storyDTOMock()
    expect(Story.canCreate(props)).toBe(true)
  })

  it('canCreate returns false for invalid props', ({ unitFixture }) => {
    const { id, ...invalidProps } = unitFixture.storyDTOMock()
    expect(Story.canCreate(invalidProps as any)).toBe(false)
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
