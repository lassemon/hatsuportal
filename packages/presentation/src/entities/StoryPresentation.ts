import { isString } from '@hatsuportal/common'
import { PostPresentation, PostPresentationProps } from './PostPresentation'
import { InvalidPresentationPostValueError } from '../errors/InvalidPresentationPostValueError'

export const emptyStory = { id: '', name: '', url: '' }
export const loggedInEmptyStory = { id: '', name: '', url: '' }

export interface StoryListOption {
  id: string
  name: string
  url?: string
}

export interface StoryPresentationDTO extends PostPresentationProps {
  name: string
  description: string
  imageId: string | null
}

export class StoryPresentation extends PostPresentation<StoryPresentationDTO> {
  private _name: string
  private _description: string
  private _imageId: string | null

  constructor(props: StoryPresentationDTO) {
    super({ ...props })
    if (!isString(props.name)) {
      throw new InvalidPresentationPostValueError(`Property "name" must be a string, was '${props.name}'`)
    }
    this._name = props.name

    if (!isString(props.description)) {
      throw new InvalidPresentationPostValueError(`Property "description" must be a string, was '${props.description}'`)
    }
    this._description = props.description

    if (!isString(props.imageId) && props.imageId !== null) {
      throw new InvalidPresentationPostValueError(`Property "imageId" must be a string or null, was '${props.imageId}'`)
    }
    this._imageId = props.imageId
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    if (!isString(name)) {
      throw new InvalidPresentationPostValueError(`Property "name" must be a string, was '${name}'`)
    }
    this._name = name
  }

  public get description(): string {
    return this._description
  }

  public set description(description: string) {
    if (!isString(description)) {
      throw new InvalidPresentationPostValueError(`Property "description" must be a string, was '${description}'`)
    }
    this._description = description
  }

  public get imageId(): string | null {
    return this._imageId
  }

  public set imageId(imageId: string | null) {
    if (!isString(imageId) && imageId !== null) {
      throw new InvalidPresentationPostValueError(`Property "imageId" must be a string or null, was '${imageId}'`)
    }
    this._imageId = imageId
  }

  public getCreatedByUserName(userId?: string) {
    if (userId && this._createdByUserName && userId === this._createdBy.toString()) {
      return `${this._createdByUserName} (You)`
    }
    return this._createdByUserName || ''
  }

  public toJSON(): StoryPresentationDTO {
    return {
      ...this.getBaseProps(),
      imageId: this.imageId,
      name: this._name,
      description: this._description
    }
  }

  public clone(props?: Partial<StoryPresentationDTO>): StoryPresentation {
    if (props) {
      return new StoryPresentation({ ...this.toJSON(), ...props })
    } else {
      return new StoryPresentation(this.toJSON())
    }
  }

  equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof StoryPresentation &&
      this.imageId === other.imageId &&
      this.name === other.name &&
      this.description === other.description
    )
  }
}
