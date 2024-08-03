import { ImageStateEnum, isString, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { PostPresentation, PostPresentationProps } from './PostPresentation'
import { InvalidPresentationPropertyError } from '@hatsuportal/presentation-common'
import { ImagePresentation, ImagePresentationDTO } from './ImagePresentation'
import { ImageLoadErrorDTO } from '@hatsuportal/common-bounded-context'

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
  imageLoadState: ImageStateEnum
  imageLoadError: ImageLoadErrorDTO | null
}

export class StoryPresentation extends PostPresentation<StoryPresentationDTO> {
  private _name: string
  private _description: string
  private _image: ImagePresentation | null
  private _imageLoadState: ImageStateEnum
  private _imageLoadError: ImageLoadErrorDTO | null

  static createEmpty() {
    const now = unixtimeNow()
    return new StoryPresentation({
      id: '',
      name: '',
      description: '',
      image: null,
      visibility: VisibilityEnum.Public,
      createdById: '',
      createdByName: '',
      createdAt: now,
      updatedAt: now,
      imageLoadState: ImageStateEnum.NotSet,
      imageLoadError: null
    })
  }

  constructor(props: StoryPresentationDTO) {
    super({ ...props })
    if (!isString(props.name)) {
      throw new InvalidPresentationPropertyError(`Property "name" must be a string, was '${props.name}'`)
    }
    this._name = props.name

    if (!isString(props.description)) {
      throw new InvalidPresentationPropertyError(`Property "description" must be a string, was '${props.description}'`)
    }
    this._description = props.description

    this._image = props.image ? new ImagePresentation(props.image) : null
    this._imageLoadState = props.imageLoadState || (props.image ? ImageStateEnum.Available : ImageStateEnum.NotSet)
    this._imageLoadError = props.imageLoadError
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    if (!isString(name)) {
      throw new InvalidPresentationPropertyError(`Property "name" must be a string, was '${name}'`)
    }
    this._name = name
  }

  public get description(): string {
    return this._description
  }

  public set description(description: string) {
    if (!isString(description)) {
      throw new InvalidPresentationPropertyError(`Property "description" must be a string, was '${description}'`)
    }
    this._description = description
  }

  public get image(): ImagePresentation | null {
    return this._image
  }

  public set image(image: ImagePresentationDTO | null) {
    this._image = image ? new ImagePresentation(image) : null
    this._imageLoadState = image ? ImageStateEnum.Available : ImageStateEnum.NotSet
    this._imageLoadError = null
  }

  public get imageLoadState(): ImageStateEnum {
    return this._imageLoadState
  }

  public get imageLoadError(): ImageLoadErrorDTO | null {
    return this._imageLoadError
  }

  public hasImageLoadFailed(): boolean {
    return this._imageLoadState === ImageStateEnum.FailedToLoad
  }

  public hasImage(): boolean {
    return this._imageLoadState === ImageStateEnum.Available && this._image !== null
  }

  public shouldHaveImage(): boolean {
    return this._imageLoadState === ImageStateEnum.FailedToLoad || this._imageLoadState === ImageStateEnum.Available
  }

  public getCreatedByName(userId?: string) {
    if (userId && this._createdByName && userId === this._createdById.toString()) {
      return `${this._createdByName} (You)`
    }
    return this._createdByName || ''
  }

  public toJSON(): StoryPresentationDTO {
    return {
      ...this.getBaseProps(),
      image: this.image?.toJSON() ?? null,
      name: this._name,
      description: this._description,
      imageLoadState: this._imageLoadState,
      imageLoadError: this._imageLoadError
    }
  }

  public clone(props?: Partial<StoryPresentationDTO>): StoryPresentation {
    if (props) {
      return new StoryPresentation({ ...this.toJSON(), ...props })
    } else {
      return new StoryPresentation(this.toJSON())
    }
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof StoryPresentation &&
      this.image?.id === other.image?.id &&
      this.name === other.name &&
      this.description === other.description &&
      this._imageLoadState === other._imageLoadState
    )
  }
}
