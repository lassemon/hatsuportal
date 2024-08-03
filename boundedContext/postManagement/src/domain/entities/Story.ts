import _, { isString } from 'lodash'
import { Post, PostProps } from './Post'
import { InvalidPostPropertyError } from '../errors/InvalidPostPropertyError'
import { isEnumValue, Logger, omitUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { ImageId, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import {
  StoryCreatedEvent,
  StoryUpdatedEvent,
  ImageAddedToStoryEvent,
  ImageRemovedFromStoryEvent,
  ImageUpdatedToStoryEvent,
  StoryDeletedEvent,
  ImageLoadFailedEvent
} from '../events/story/StoryEvents'
import { PostVisibility } from '../valueObjects/PostVisibility'
import { Image, ImageProps } from '@hatsuportal/common-bounded-context'
import { ImageLoadResult } from '@hatsuportal/common-bounded-context'

const logger = new Logger('Story')

export interface StoryProps extends PostProps {
  image?: ImageProps | null
  name: string
  description: string
}

export class Story extends Post<StoryProps> {
  static canCreate(props: any) {
    try {
      new Story(props)
      return true
    } catch (error) {
      logger.warn(error)
      return false
    }
  }

  private _image: Image | null
  private _imageLoadResult: ImageLoadResult | null
  private _name: string
  private _description: string

  constructor(props: StoryProps) {
    super({ ...props })

    if (!isString(props.name) || props.name.trim().length <= 0)
      throw new InvalidPostPropertyError(`Property "name" must be a string, was '${props.name}'`)
    this._name = props.name

    if (!isString(props.description))
      throw new InvalidPostPropertyError(`Property "description" must be a string, was '${props.description}'`)
    this._description = props.description

    this.addDomainEvent(new StoryCreatedEvent(this))

    if (props.image) {
      this._image = new Image(props.image)
      this._imageLoadResult = ImageLoadResult.success(this._image)
      this.addDomainEvent(new ImageAddedToStoryEvent(this, this._image))
    } else {
      this._image = null
      this._imageLoadResult = ImageLoadResult.notSet()
    }
  }

  public get name(): string {
    return this._name
  }

  public get image(): Image | null {
    return this._image
  }

  public get imageLoadResult(): ImageLoadResult | null {
    return this._imageLoadResult
  }

  public get description(): string {
    return this._description
  }

  public getProps() {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      image: this.image?.getProps() ?? null,
      name: this._name,
      description: this._description,
      createdById: this._createdById.value,
      createdByName: this._createdByName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt.value
    }
  }

  public setImageLoadFailure(imageId: ImageId, error: Error): void {
    this._imageLoadResult = ImageLoadResult.failedToLoad(imageId, error)
    this.addDomainEvent(new ImageLoadFailedEvent(this, imageId, error))
  }

  // TODO, should this return a new Post or the instance itself?
  public update(props: Partial<StoryProps>): void {
    const sanitizedProps = omitUndefined(props)

    if (Story.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      // Handle visibility change
      if (isEnumValue(sanitizedProps.visibility, VisibilityEnum)) {
        this._visibility = new PostVisibility(sanitizedProps.visibility)
      }

      // Handle name change
      if (sanitizedProps.name !== undefined) {
        if (!isString(sanitizedProps.name) || sanitizedProps.name.trim().length <= 0)
          throw new InvalidPostPropertyError(`Property "name" must be a string, was '${sanitizedProps.name}'`)
        this._name = sanitizedProps.name
      }

      // Handle description change
      if (sanitizedProps.description !== undefined) {
        if (!isString(sanitizedProps.description))
          throw new InvalidPostPropertyError(`Property "description" must be a string, was '${sanitizedProps.description}'`)
        this._description = sanitizedProps.description
      }

      // Handle image change with proper domain events
      if (sanitizedProps.image !== undefined) {
        const imageAdded = sanitizedProps.image && !this._image
        const imageUpdated = sanitizedProps.image && this._image && !this._image.equals(sanitizedProps.image)
        const imageRemoved = !sanitizedProps.image && this._image

        if (imageAdded && sanitizedProps.image) {
          const newImage = new Image(sanitizedProps.image)
          this._image = newImage
          this._imageLoadResult = ImageLoadResult.success(newImage)
          this.addDomainEvent(new ImageAddedToStoryEvent(this, newImage))
        } else if (imageUpdated && sanitizedProps.image) {
          const oldImage = this._image
          this._image = new Image(sanitizedProps.image)
          this._imageLoadResult = ImageLoadResult.success(this._image)
          this.addDomainEvent(new ImageUpdatedToStoryEvent(this, oldImage!, this._image))
        } else if (imageRemoved) {
          const oldImage = this._image
          this._image = null
          this._imageLoadResult = ImageLoadResult.notSet()
          this.addDomainEvent(new ImageRemovedFromStoryEvent(this, oldImage!))
        } else {
          // Image property changed but no specific event needed
          this._image = sanitizedProps.image ? new Image(sanitizedProps.image) : null
          this._imageLoadResult = sanitizedProps.image ? ImageLoadResult.success(this._image!) : ImageLoadResult.notSet()
        }
      }

      this._updatedAt = new UnixTimestamp(unixtimeNow())

      this.addDomainEvent(new StoryUpdatedEvent(this))
    }
  }

  public delete(): void {
    if (this._image) this.addDomainEvent(new ImageRemovedFromStoryEvent(this, this._image))
    this.addDomainEvent(new StoryDeletedEvent(this))
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof Story &&
      !!this.image?.equals(other.image) &&
      this.name === other.name &&
      this.description === other.description
    )
  }
}

export default Story
