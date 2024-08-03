import { Post, PostProps } from './Post'
import { DomainError, EntityFactoryResult, UnixTimestamp, NonEmptyString, UniqueId, CreatedAtTimestamp } from '@hatsuportal/shared-kernel'
import {
  StoryCreatedEvent,
  StoryNameUpdatedEvent,
  StoryVisibilityUpdatedEvent,
  StoryDescriptionUpdatedEvent,
  StoryTagsUpdatedEvent,
  StoryTagAddedEvent,
  StoryTagRemovedEvent,
  StoryDeletedEvent,
  CoverImageUpdatedToStoryEvent,
  CoverImageAddedToStoryEvent,
  CoverImageRemovedFromStoryEvent
} from '../events/StoryEvents'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { TagId } from '../valueObjects/TagId'
import { PostId } from '../valueObjects/PostId'
import { PostCreatorId } from '../valueObjects/PostCreatorId'
import { CoverImageId } from '../valueObjects/CoverImageId'
import { unixtimeNow } from '@hatsuportal/common'

export interface StoryProps extends PostProps {
  name: NonEmptyString
  visibility: PostVisibility
  description: NonEmptyString
  coverImageId: CoverImageId
  tagIds: TagId[]
}

export class Story extends Post {
  static canCreate(props: any): boolean {
    try {
      Story.assertCanCreate(props)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    new Story(
      props.id instanceof PostId ? props.id : new PostId(props.id),
      props.createdById instanceof PostCreatorId ? props.createdById : new PostCreatorId(props.createdById),
      new NonEmptyString(props.name),
      new PostVisibility(props.visibility),
      new NonEmptyString(props.description),
      CoverImageId.fromOptional(props.coverImageId),
      props.tagIds.map((id: any) => (id instanceof TagId ? id : new TagId(id))),
      props.createdAt instanceof UnixTimestamp ? props.createdAt : new UnixTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: StoryProps): Story {
    const story = new Story(
      props.id,
      props.createdById,
      props.name,
      props.visibility,
      props.description,
      props.coverImageId,
      props.tagIds,
      props.createdAt,
      props.updatedAt
    )
    story.addDomainEvent(
      new StoryCreatedEvent({
        id: story.id.value,
        name: story.name.value,
        createdById: story.createdById.value,
        createdAt: story.createdAt.value
      })
    )
    if (story.coverImageId) {
      story.addDomainEvent(
        new CoverImageAddedToStoryEvent({
          id: story.id.value,
          imageId: story.coverImageId.value,
          addedById: story.createdById.value
        })
      )
    }
    return story
  }

  static tryCreate(props: StoryProps): EntityFactoryResult<Story, DomainError> {
    try {
      Story.assertCanCreate(props)
      const story = Story.create(props)
      return EntityFactoryResult.ok(story)
    } catch (error) {
      if (error instanceof DomainError) {
        return EntityFactoryResult.fail(error)
      }
      return EntityFactoryResult.fail(
        new DomainError({
          message: 'Unknown error occurred while creating story',
          cause: error
        })
      )
    }
  }

  static reconstruct(props: StoryProps): Story {
    return new Story(
      props.id,
      props.createdById,
      props.name,
      props.visibility,
      props.description,
      props.coverImageId,
      props.tagIds,
      props.createdAt,
      props.updatedAt
    )
  }

  private _name: NonEmptyString
  private _visibility: PostVisibility
  private _description: NonEmptyString
  private _coverImageId: CoverImageId
  private _tagIds: TagId[]

  private constructor(
    id: PostId,
    createdById: PostCreatorId,
    name: NonEmptyString,
    visibility: PostVisibility,
    description: NonEmptyString,
    coverImageId: CoverImageId,
    tagIds: TagId[],
    createdAt: CreatedAtTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdById, createdAt, updatedAt)

    this._name = name
    this._visibility = visibility
    this._description = description
    this._coverImageId = coverImageId
    this._tagIds = tagIds
  }

  public rename(name: NonEmptyString, updatedById: UniqueId): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryNameUpdatedEvent({
        id: this.id.value,
        name: this.name.value,
        updatedById: updatedById.value,
        updatedAt: this.updatedAt.value
      })
    )
  }

  public get name(): NonEmptyString {
    return this._name
  }

  public updateVisibility(visibility: PostVisibility, updatedById: UniqueId): void {
    this._visibility = visibility
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryVisibilityUpdatedEvent({
        id: this.id.value,
        visibility: this.visibility.value,
        updatedById: updatedById.value,
        updatedAt: this.updatedAt.value
      })
    )
  }

  public get visibility(): PostVisibility {
    return this._visibility
  }

  public updateDescription(description: NonEmptyString, updatedById: UniqueId): void {
    this._description = description
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryDescriptionUpdatedEvent({
        id: this.id.value,
        description: this.description.value,
        updatedById: updatedById.value,
        updatedAt: this.updatedAt.value
      })
    )
  }

  public get description(): NonEmptyString {
    return this._description
  }

  public updateCoverImage(newCoverImageId: CoverImageId, updatedBy: UniqueId): void {
    const settingNewCoverImage = !newCoverImageId.equals(CoverImageId.NOT_SET)
    const currentlyHasCoverImage = !this._coverImageId.equals(CoverImageId.NOT_SET)
    const coverImageAdded = settingNewCoverImage && !currentlyHasCoverImage
    const coverImageUpdated = settingNewCoverImage && currentlyHasCoverImage && this._coverImageId.equals(newCoverImageId)
    const coverImageRemoved = !settingNewCoverImage && currentlyHasCoverImage

    if (coverImageAdded) {
      const coverImageId = newCoverImageId
      this.addDomainEvent(
        new CoverImageAddedToStoryEvent({
          id: this.id.value,
          imageId: coverImageId.value,
          addedById: updatedBy.value
        })
      )
      this._coverImageId = coverImageId
    } else if (coverImageUpdated) {
      const coverImageId = newCoverImageId
      this.addDomainEvent(
        new CoverImageUpdatedToStoryEvent({
          id: this.id.value,
          oldImageId: this.coverImageId!.value,
          newImageId: coverImageId.value,
          updatedById: updatedBy.value
        })
      )
      this._coverImageId = coverImageId
    } else if (coverImageRemoved) {
      this.addDomainEvent(
        new CoverImageRemovedFromStoryEvent({
          id: this.id.value,
          removedImageId: this.coverImageId!.value,
          removedById: updatedBy.value
        })
      )

      this._coverImageId = CoverImageId.NOT_SET
    }

    this._updatedAt = new UnixTimestamp(unixtimeNow())
  }

  public get coverImageId(): CoverImageId {
    return this._coverImageId
  }

  public setNewTags(tagIds: TagId[], updatedById: UniqueId): void {
    this._tagIds = tagIds
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryTagsUpdatedEvent({
        id: this.id.value,
        tagIds: this.tagIds.map((t) => t.value),
        updatedById: updatedById.value,
        updatedAt: this.updatedAt.value
      })
    )
  }

  public addTag(tagId: TagId, addedById: UniqueId): void {
    this._tagIds.push(tagId)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryTagAddedEvent({
        id: this.id.value,
        tagId: tagId.value,
        addedById: addedById.value,
        updatedAt: this.updatedAt.value
      })
    )
  }

  public removeTag(tagId: TagId, removedById: UniqueId): void {
    this._tagIds = this._tagIds.filter((id) => !id.equals(tagId))
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryTagRemovedEvent({
        id: this.id.value,
        tagId: tagId.value,
        removedById: removedById.value,
        updatedAt: this.updatedAt.value
      })
    )
  }

  public get tagIds(): TagId[] {
    return this._tagIds.slice() // Return a copy of the array to prevent external modification
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      visibility: this.visibility.value,
      name: this.name.value,
      description: this.description.value,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value,
      coverImageId: this.coverImageId.value,
      tagIds: this.tagIds.map((t) => t.value)
    }
  }

  public clone(): Story {
    return new Story(
      this.id,
      this.createdById,
      this._name,
      this._visibility,
      this._description,
      this._coverImageId,
      this._tagIds,
      this.createdAt,
      this.updatedAt
    )
  }

  public delete(deletedById: UniqueId): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(
      new StoryDeletedEvent({
        id: this.id.value,
        deletedById: deletedById.value,
        deletedAt: this.updatedAt.value
      })
    )
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof Story &&
      this.name.equals(other.name) &&
      this.description.equals(other.description) &&
      this.coverImageId.equals(other.coverImageId)
    )
  }
}

export default Story
