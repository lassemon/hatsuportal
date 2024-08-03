import { describe, expect, it } from 'vitest'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import Story from './Story'
import { TagId } from '../valueObjects/TagId'
import { CoverImageId } from '../valueObjects/CoverImageId'
import { CreatedAtTimestamp, NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { PostId } from '../valueObjects/PostId'

describe('Story', () => {
  it('can create story with all properties', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    expect(story.id.value).toBe(unitFixture.storyDTOMock().id)
    expect(story.visibility.value).toBe(unitFixture.storyDTOMock().visibility)
    expect(story.createdById.value).toBe(unitFixture.storyDTOMock().createdById)
    expect(story.createdAt.value).toBe(unitFixture.storyDTOMock().createdAt)
    expect(story.updatedAt?.value).toBe(unitFixture.storyDTOMock().updatedAt)
    expect(story.title.value).toBe(unitFixture.storyDTOMock().title)
    expect(story.body.value).toBe(unitFixture.storyDTOMock().body)
  })

  it('does not allow creating an story without an id', ({ unitFixture }) => {
    const { id, ...postWithoutId } = unitFixture.storyDTOMock()
    expect(() => {
      Story.assertCanCreate(postWithoutId as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating an story with an id with empty spaces', ({ unitFixture }) => {
    expect(() => {
      Story.assertCanCreate({ ...unitFixture.storyDTOMock(), id: ' te st ' } as any)
    }).toThrow(InvalidPostIdError)
  })

  it('does not allow creating a story without a title', ({ unitFixture }) => {
    const { title, ...storyWithoutTitle } = unitFixture.storyDTOMock()
    expect(() => {
      Story.assertCanCreate(storyWithoutTitle as any)
    }).toThrow()
  })

  it('does not allow creating a story without a body', ({ unitFixture }) => {
    const { body, ...storyWithoutBody } = unitFixture.storyDTOMock()
    expect(() => {
      Story.assertCanCreate(storyWithoutBody as any)
    }).toThrow()
  })

  it('can reconstruct a story from props', ({ unitFixture }) => {
    const props = unitFixture.storyDTOMock()
    const story = Story.reconstruct({
      id: new PostId(props.id),
      createdById: new PostCreatorId(props.createdById),
      title: new NonEmptyString(props.title),
      visibility: new PostVisibility(props.visibility),
      body: new NonEmptyString(props.body),
      coverImageId: props.coverImageId ? new CoverImageId(props.coverImageId) : CoverImageId.NOT_SET,
      tagIds: props.tagIds.map((id) => new TagId(id)),
      createdAt: new CreatedAtTimestamp(props.createdAt),
      updatedAt: new UnixTimestamp(props.updatedAt)
    })
    expect(story.id.value).toBe(props.id)
    expect(story.title.value).toBe(props.title)
    expect(story.body.value).toBe(props.body)
  })

  it('canCreate returns true for valid props', ({ unitFixture }) => {
    const props = unitFixture.storyDTOMock()
    if (Story.canCreate(props) === false) {
      Story.assertCanCreate(props)
    }
    expect(Story.canCreate(props)).toBe(true)
  })

  it('canCreate returns false for invalid props', ({ unitFixture }) => {
    const { id, ...invalidProps } = unitFixture.storyDTOMock()
    expect(Story.canCreate(invalidProps as any)).toBe(false)
  })

  it('can compare stories', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const otherStoryId = new PostId(uuid())
    const otherStory = Story.create({
      id: otherStoryId,
      createdById: new PostCreatorId(unitFixture.storyDTOMock().createdById),
      title: new NonEmptyString(unitFixture.storyDTOMock().title),
      visibility: new PostVisibility(unitFixture.storyDTOMock().visibility),
      body: new NonEmptyString(unitFixture.storyDTOMock().body),
      coverImageId: unitFixture.storyDTOMock().coverImageId
        ? new CoverImageId(unitFixture.storyDTOMock().coverImageId)
        : CoverImageId.NOT_SET,
      tagIds: unitFixture.storyDTOMock().tagIds.map((id) => new TagId(id)),
      createdAt: new CreatedAtTimestamp(unitFixture.storyDTOMock().createdAt),
      updatedAt: new UnixTimestamp(unitFixture.storyDTOMock().updatedAt)
    })
    expect(story.equals(story)).toBe(true)
    expect(story.equals(otherStory)).toBe(false)
  })

  it('update modifies visibility and refreshed updatedAt', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const previousUpdatedAt = story.updatedAt.value

    story.updateVisibility(new PostVisibility(VisibilityEnum.Private), story.createdById)

    expect(story.visibility.value).toBe(VisibilityEnum.Private)
    expect(story.updatedAt.value).toBeGreaterThan(previousUpdatedAt)
  })
})
