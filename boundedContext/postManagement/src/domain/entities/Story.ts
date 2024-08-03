import _ from 'lodash'
import { Post, PostProps } from './Post'
import { isEnumValue, Logger, omitUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { ImageCreatedEvent, ImageId, UnixTimestamp } from '@hatsuportal/common-bounded-context'
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
import { NonEmptyString } from '@hatsuportal/common-bounded-context'

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

  static create(props: StoryProps): Story {
    const story = new Story(props)
    story.addDomainEvent(new StoryCreatedEvent(story))
    if (story.image) {
      story.image.addDomainEvent(new ImageCreatedEvent(story.image))
      story.addDomainEvent(new ImageAddedToStoryEvent(story, story.image))
    }
    return story
  }

  static reconstruct(props: StoryProps): Story {
    return new Story(props)
  }

  private _image: Image | null
  private _imageLoadResult: ImageLoadResult | null
  private _name: NonEmptyString
  private _description: NonEmptyString

  private constructor(props: StoryProps) {
    super({ ...props })

    this._name = new NonEmptyString(props.name)
    this._description = new NonEmptyString(props.description)

    if (props.image) {
      this._image = Image.reconstruct(props.image)
      this._imageLoadResult = ImageLoadResult.success(this._image)
    } else {
      this._image = null
      this._imageLoadResult = ImageLoadResult.notSet()
    }
  }

  public get name(): NonEmptyString {
    return this._name
  }

  public get description(): NonEmptyString {
    return this._description
  }

  public get image(): Image | null {
    return this._image
  }

  public get imageLoadResult(): ImageLoadResult | null {
    return this._imageLoadResult
  }

  public getProps() {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      image: this.image?.getProps() ?? null,
      name: this._name.value,
      description: this._description.value,
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

  // TODO, should this return a new Story or the instance itself?
  /**
   * Use this update function to update any property of the story.
   * This allows encapsulating the domain events as well as the updated at timestamp in the update function.
   *
   * @param props - The properties to update.
   * @throws {InvalidNonEmptyString} If the name is not a valid non empty string.
   * @throws {InvalidNonEmptyString} If the description is not a valid non empty string.
   * @throws {InvalidImagePropertyError} If the image is not a valid image.
   */
  public update(props: Partial<StoryProps>): void {
    const sanitizedProps = omitUndefined(props)

    if (Story.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (isEnumValue(sanitizedProps.visibility, VisibilityEnum)) {
        this._visibility = new PostVisibility(sanitizedProps.visibility)
      }

      if (sanitizedProps.name) this._name = new NonEmptyString(sanitizedProps.name)
      if (sanitizedProps.description) this._description = new NonEmptyString(sanitizedProps.description)

      // Handle image change with proper domain events
      if (sanitizedProps.image !== undefined) {
        const imageAdded = sanitizedProps.image && !this._image
        const imageUpdated = sanitizedProps.image && this._image && !this._image.equals(sanitizedProps.image)
        const imageRemoved = !sanitizedProps.image && this._image

        if (imageAdded && sanitizedProps.image) {
          const newImage = Image.reconstruct(sanitizedProps.image)
          this._image = newImage
          this._imageLoadResult = ImageLoadResult.success(newImage)
          this.addDomainEvent(new ImageAddedToStoryEvent(this, newImage))
        } else if (imageUpdated && sanitizedProps.image) {
          const oldImage = this._image
          this._image = Image.reconstruct(sanitizedProps.image)
          this._imageLoadResult = ImageLoadResult.success(this._image)
          this.addDomainEvent(new ImageUpdatedToStoryEvent(this, oldImage!, this._image))
        } else if (imageRemoved) {
          const oldImage = this._image
          this._image = null
          this._imageLoadResult = ImageLoadResult.notSet()
          this.addDomainEvent(new ImageRemovedFromStoryEvent(this, oldImage!))
        } else {
          // Image property changed but no specific event needed
          this._image = sanitizedProps.image ? Image.reconstruct(sanitizedProps.image) : null
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
