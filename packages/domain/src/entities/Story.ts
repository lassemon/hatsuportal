import _, { isString } from 'lodash'
import { Post, PostProps } from './Post'
import { InvalidPostPropertyError } from '../errors/InvalidPostPropertyError'
import { isEnumValue, omitUndefined, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import Image, { ImageProps } from './Image'
import {
  ImageAddedToStoryEvent,
  ImageRemovedFromStoryEvent,
  ImageUpdatedToStoryEvent,
  StoryDeletedEvent
} from '../events/story/StoryEvents'
import { UserName } from '../valueObjects/UserName'

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
    } catch {
      return false
    }
  }

  private _image: Image | null
  private _name: string
  private _description: string

  constructor(props: StoryProps) {
    super({ ...props })
    this._image = props.image ? new Image(props.image) : null

    if (!isString(props.name) || props.name.trim().length <= 0)
      throw new InvalidPostPropertyError(`Property "name" must be a string, was '${props.name}'`)
    this._name = props.name

    if (!isString(props.description))
      throw new InvalidPostPropertyError(`Property "description" must be a string, was '${props.description}'`)
    this._description = props.description
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    if (!isString(name)) throw new InvalidPostPropertyError(`Property "name" must be a string, was '${name}'`)
    this._name = name
  }

  public get image(): Image | null {
    return this._image
  }

  public set image(image: ImageProps | null) {
    const imageAdded = image && !this._image
    const imageUpdated = image && this._image && !this._image.equals(image)
    const imageRemoved = !image && this._image

    if (imageAdded) {
      const newImage = new Image(image)
      this._image = newImage
      this.addDomainEvent(new ImageAddedToStoryEvent(this, newImage))
    } else if (imageUpdated) {
      const oldImage = this._image
      this._image = new Image(image)
      this.addDomainEvent(new ImageUpdatedToStoryEvent(this, oldImage!, this._image))
    } else if (imageRemoved) {
      const oldImage = this._image
      this._image = null
      this.addDomainEvent(new ImageRemovedFromStoryEvent(this, oldImage!))
    }
  }

  public get description(): string {
    return this._description
  }

  public set description(description: string) {
    if (!isString(description)) throw new InvalidPostPropertyError(`Property "description" must be a string, was '${description}'`)
    this._description = description
  }

  public getProps() {
    return {
      id: this._id.value,
      visibility: this._visibility.value,
      imageId: this.image ?? null,
      name: this._name,
      description: this._description,
      createdBy: this._createdBy.value,
      createdByUserName: this._createdByUserName.value,
      createdAt: this._createdAt.value,
      updatedAt: this._updatedAt?.value ?? null
    }
  }

  // TODO, should this return a new Post or the instance itself?
  public update(props: Partial<StoryProps>): void {
    const sanitizedProps = omitUndefined(props)

    if (Story.canCreate({ ...this.getProps(), ...sanitizedProps })) {
      if (isEnumValue(sanitizedProps.visibility, VisibilityEnum)) this.visibility = sanitizedProps.visibility

      if (!isString(sanitizedProps.name) || sanitizedProps.name.trim().length <= 0)
        throw new InvalidPostPropertyError(`Property "name" must be a string, was '${sanitizedProps.name}'`)
      this.name = sanitizedProps.name

      if (!isString(sanitizedProps.description))
        throw new InvalidPostPropertyError(`Property "description" must be a string, was '${sanitizedProps.description}'`)
      this.description = sanitizedProps.description

      // call image setter to send domain events
      if (sanitizedProps.image instanceof Image || sanitizedProps.image === null) this.image = sanitizedProps.image

      this.updatedAt = unixtimeNow()
    }
  }

  public delete(): void {
    if (this._image) this.addDomainEvent(new ImageRemovedFromStoryEvent(this, this._image))
    this.addDomainEvent(new StoryDeletedEvent(this))
  }

  equals(other: unknown): boolean {
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
