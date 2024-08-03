import { describe, expect, it } from 'vitest'
import { uuid, VisibilityEnum } from '@hatsuportal/common'
import { InvalidPostIdError } from '../errors/InvalidPostIdError'
import Story from './Story'
import { TagId } from '../valueObjects/TagId'
import { CoverImageId } from '../valueObjects/CoverImageId'
import { InputLimits } from '@hatsuportal/contracts'
import { CreatedAtTimestamp, UniqueId, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { PostId } from '../valueObjects/PostId'
import { PostTitle } from '../valueObjects/PostTitle'
import { StoryBody } from '../valueObjects/StoryBody'
import { PostTitleTooLongError } from '../errors/PostTitleTooLongError'
import { StoryBodyTooLongError } from '../errors/StoryBodyTooLongError'
import {
  CoverImageAddedToStoryEvent,
  CoverImageUpdatedToStoryEvent,
  StoryBodyUpdatedEvent,
  StoryDeletedEvent,
  StoryTagAddedEvent,
  StoryTagRemovedEvent,
  StoryTagsUpdatedEvent,
  StoryTitleUpdatedEvent
} from '../events/StoryEvents'

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
      title: new PostTitle(props.title),
      visibility: new PostVisibility(props.visibility),
      body: new StoryBody(props.body),
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
      title: new PostTitle(unitFixture.storyDTOMock().title),
      visibility: new PostVisibility(unitFixture.storyDTOMock().visibility),
      body: new StoryBody(unitFixture.storyDTOMock().body),
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

  it('rename emits StoryTitleUpdatedEvent', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    story.clearEvents()

    story.rename(new PostTitle('New title'), new UniqueId(unitFixture.sampleUserId))

    expect(story.title.value).toBe('New title')
    expect(story.domainEvents.some((event) => event instanceof StoryTitleUpdatedEvent)).toBe(true)
  })

  it('updateBody emits StoryBodyUpdatedEvent', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    story.clearEvents()

    story.updateBody(new StoryBody('New body'), new UniqueId(unitFixture.sampleUserId))

    expect(story.body.value).toBe('New body')
    expect(story.domainEvents.some((event) => event instanceof StoryBodyUpdatedEvent)).toBe(true)
  })

  it('delete emits StoryDeletedEvent', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    story.clearEvents()

    story.delete(new UniqueId(unitFixture.sampleUserId))

    expect(story.domainEvents.some((event) => event instanceof StoryDeletedEvent)).toBe(true)
  })

  it('updateCoverImage emits CoverImageAddedToStoryEvent when adding a cover image', ({ unitFixture }) => {
    const story = unitFixture.storyMock({ coverImageId: CoverImageId.NOT_SET })
    story.clearEvents()
    const imageId = new CoverImageId(uuid())

    story.updateCoverImage(imageId, new UniqueId(unitFixture.sampleUserId))

    expect(story.coverImageId.equals(imageId)).toBe(true)
    expect(story.domainEvents.some((event) => event instanceof CoverImageAddedToStoryEvent)).toBe(true)
  })

  it('updateCoverImage emits CoverImageUpdatedToStoryEvent when replacing a cover image', ({ unitFixture }) => {
    const oldImageId = new CoverImageId(uuid())
    const story = unitFixture.storyMock({ coverImageId: oldImageId })
    story.clearEvents()
    const newImageId = new CoverImageId(uuid())

    story.updateCoverImage(newImageId, new UniqueId(unitFixture.sampleUserId))

    expect(story.coverImageId.equals(newImageId)).toBe(true)
    expect(story.domainEvents.some((event) => event instanceof CoverImageUpdatedToStoryEvent)).toBe(true)
  })

  it('updateCoverImage removes cover image without emitting an event', ({ unitFixture }) => {
    const story = unitFixture.storyMock({ coverImageId: new CoverImageId(uuid()) })
    story.clearEvents()

    story.updateCoverImage(CoverImageId.NOT_SET, new UniqueId(unitFixture.sampleUserId))

    expect(story.coverImageId.equals(CoverImageId.NOT_SET)).toBe(true)
    expect(story.domainEvents).toHaveLength(0)
  })

  it('addTag emits StoryTagAddedEvent', ({ unitFixture }) => {
    const story = unitFixture.storyMock({ tagIds: [] })
    story.clearEvents()
    const tagId = new TagId(uuid())

    story.addTag(tagId, new UniqueId(unitFixture.sampleUserId))

    expect(story.tagIds.some((id) => id.equals(tagId))).toBe(true)
    expect(story.domainEvents.some((event) => event instanceof StoryTagAddedEvent)).toBe(true)
  })

  it('removeTag emits StoryTagRemovedEvent', ({ unitFixture }) => {
    const tagId = new TagId(uuid())
    const story = unitFixture.storyMock({ tagIds: [tagId] })
    story.clearEvents()

    story.removeTag(tagId, new UniqueId(unitFixture.sampleUserId))

    expect(story.tagIds.some((id) => id.equals(tagId))).toBe(false)
    expect(story.domainEvents.some((event) => event instanceof StoryTagRemovedEvent)).toBe(true)
  })

  it('setNewTags emits StoryTagsUpdatedEvent', ({ unitFixture }) => {
    const story = unitFixture.storyMock({ tagIds: [new TagId(uuid())] })
    story.clearEvents()
    const newTagIds = [new TagId(uuid()), new TagId(uuid())]

    story.setNewTags(newTagIds, new UniqueId(unitFixture.sampleUserId))

    expect(story.tagIds).toHaveLength(2)
    expect(story.domainEvents.some((event) => event instanceof StoryTagsUpdatedEvent)).toBe(true)
  })

  it('assertCanCreate rejects over-limit title', ({ unitFixture }) => {
    expect(() =>
      Story.assertCanCreate({
        ...unitFixture.storyDTOMock(),
        title: 'x'.repeat(InputLimits.postTitle + 1)
      })
    ).toThrow(PostTitleTooLongError)
  })

  it('assertCanCreate rejects over-limit body', ({ unitFixture }) => {
    expect(() =>
      Story.assertCanCreate({
        ...unitFixture.storyDTOMock(),
        body: 'x'.repeat(InputLimits.storyBody + 1)
      })
    ).toThrow(StoryBodyTooLongError)
  })

  it('rename rejects over-limit title', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    expect(() => story.rename(new PostTitle('x'.repeat(InputLimits.postTitle + 1)), new UniqueId(unitFixture.sampleUserId))).toThrow(
      PostTitleTooLongError
    )
  })

  it('updateBody rejects over-limit body', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    expect(() => story.updateBody(new StoryBody('x'.repeat(InputLimits.storyBody + 1)), new UniqueId(unitFixture.sampleUserId))).toThrow(
      StoryBodyTooLongError
    )
  })
})
