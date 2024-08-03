import { isString, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { PostPresentation, PostPresentationProps } from './PostPresentation'
import { InvalidPresentationPostPropertyError } from '../errors/InvalidPresentationPostPropertyError'
import { ImagePresentation, ImagePresentationDTO } from './ImagePresentation'

export const emptyStory = { id: '', name: '' }
export const loggedInEmptyStory = { id: '', name: '' }

export interface StoryListOption {
  id: string
  name: string
  url?: string
}

export interface StoryPresentationDTO extends PostPresentationProps {
  name: string
  description: string
  image: ImagePresentationDTO | null
}

export class StoryPresentation extends PostPresentation<StoryPresentationDTO> {
  private _name: string
  private _description: string
  private _image: ImagePresentation | null

  static createEmpty() {
    return new StoryPresentation({
      id: '',
      name: '',
      description: '',
      image: null,
      visibility: VisibilityEnum.Public,
      createdBy: '',
      createdByUserName: '',
      createdAt: unixtimeNow(),
      updatedAt: null
    })
  }

  constructor(props: StoryPresentationDTO) {
    super({ ...props })
    if (!isString(props.name)) {
      throw new InvalidPresentationPostPropertyError(`Property "name" must be a string, was '${props.name}'`)
    }
    this._name = props.name

    if (!isString(props.description)) {
      throw new InvalidPresentationPostPropertyError(`Property "description" must be a string, was '${props.description}'`)
    }
    this._description = props.description

    this._image = props.image ? new ImagePresentation(props.image) : null
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    if (!isString(name)) {
      throw new InvalidPresentationPostPropertyError(`Property "name" must be a string, was '${name}'`)
    }
    this._name = name
  }

  public get description(): string {
    return this._description
  }

  public set description(description: string) {
    if (!isString(description)) {
      throw new InvalidPresentationPostPropertyError(`Property "description" must be a string, was '${description}'`)
    }
    this._description = description
  }

  public get image(): ImagePresentation | null {
    return this._image
  }

  public set image(image: ImagePresentationDTO | null) {
    this._image = image ? new ImagePresentation(image) : null
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
      image: this.image?.toJSON() ?? null,
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
      this.image?.id === other.image?.id &&
      this.name === other.name &&
      this.description === other.description
    )
  }
}
