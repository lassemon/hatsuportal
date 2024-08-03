import { Post, PostProps } from './Post'
import { DomainError, EntityFactoryResult, UnixTimestamp, NonEmptyString } from '@hatsuportal/shared-kernel'
import {
  StoryCreatedEvent,
  StoryUpdatedEvent,
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
  coverImageId: CoverImageId | null
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
      props.coverImageId ? new CoverImageId(props.coverImageId) : null,
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
    story.addDomainEvent(new StoryCreatedEvent(story))
    if (story.coverImageId) {
      story.addDomainEvent(new CoverImageAddedToStoryEvent(story, story.coverImageId))
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
  private _coverImageId: CoverImageId | null
  private _tagIds: TagId[]

  private constructor(
    id: PostId,
    createdById: PostCreatorId,
    name: NonEmptyString,
    visibility: PostVisibility,
    description: NonEmptyString,
    coverImageId: CoverImageId | null,
    tagIds: TagId[],
    createdAt: UnixTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdById, createdAt, updatedAt)

    this._name = name
    this._visibility = visibility
    this._description = description
    this._coverImageId = coverImageId
    this._tagIds = tagIds
  }

  public rename(name: NonEmptyString, emitEvents: boolean = true): void {
    this._name = name
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public get name(): NonEmptyString {
    return this._name
  }

  public updateVisibility(visibility: PostVisibility, emitEvents: boolean = true): void {
    this._visibility = visibility
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public get visibility(): PostVisibility {
    return this._visibility
  }

  public updateDescription(description: NonEmptyString, emitEvents: boolean = true): void {
    this._description = description
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public get description(): NonEmptyString {
    return this._description
  }

  public updateCoverImage(newCoverImageId: CoverImageId | null, emitEvents: boolean = true): void {
    const newCoverImageIdExists = !!newCoverImageId
    const coverImageAdded = newCoverImageIdExists && !this._coverImageId
    const coverImageUpdated = newCoverImageIdExists && this._coverImageId && this._coverImageId.equals(newCoverImageId)
    // MUST check only for null, because undefined means no change to image, while null means remove image
    const coverImageRemoved = !newCoverImageIdExists && !!this._coverImageId

    if (coverImageAdded && newCoverImageIdExists) {
      const coverImageId = newCoverImageId
      if (emitEvents) this.addDomainEvent(new CoverImageAddedToStoryEvent(this, coverImageId))
      this._coverImageId = coverImageId
    } else if (coverImageUpdated && newCoverImageIdExists) {
      const coverImageId = newCoverImageId
      if (emitEvents) this.addDomainEvent(new CoverImageUpdatedToStoryEvent(this, this.coverImageId!, coverImageId))
      this._coverImageId = coverImageId
    } else if (coverImageRemoved) {
      if (emitEvents) this.addDomainEvent(new CoverImageRemovedFromStoryEvent(this, this.coverImageId!))

      this._coverImageId = null
    }

    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public get coverImageId(): CoverImageId | null {
    return this._coverImageId
  }

  public setNewTags(tagIds: TagId[], emitEvents: boolean = true): void {
    this._tagIds = tagIds
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public addTag(tagId: TagId, emitEvents: boolean = true): void {
    this._tagIds.push(tagId)
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public removeTag(tagId: TagId, emitEvents: boolean = true): void {
    this._tagIds = this._tagIds.filter((id) => !id.equals(tagId))
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryUpdatedEvent(this))
  }

  public get tagIds(): TagId[] {
    return this._tagIds
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize(): Record<string, unknown> {
    return {
      id: this.id.value,
      visibility: this._visibility.value,
      name: this._name.value,
      description: this._description.value,
      createdById: this.createdById.value,
      createdAt: this.createdAt.value,
      updatedAt: this._updatedAt.value,
      coverImageId: this._coverImageId?.value ?? null
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

  public delete(emitEvents: boolean = true): void {
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    if (emitEvents) this.addDomainEvent(new StoryDeletedEvent(this))
  }

  public override equals(other: unknown): boolean {
    return super.equals(other) && other instanceof Story && this.name === other.name && this.description === other.description
  }
}

export default Story
