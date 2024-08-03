import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'
import { ImageLoadErrorDTO } from '@hatsuportal/contracts'
import { PostViewModelDTO } from 'ui/shared/viewModels/PostViewModel'
import { ImageViewModel, ImageViewModelDTO } from 'ui/features/image/viewModels/ImageViewModel'
import { PostViewModel } from 'ui/shared/viewModels/PostViewModel'
import { TagViewModel, TagViewModelDTO } from 'ui/features/post/tag/viewModel/TagViewModel'
import { CommentViewModel, CommentViewModelDTO } from '../../comment/viewModel/CommentViewModel'
import { ImageStateEnum, isString, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'

export const emptyStory = { id: '', name: '' }
export const loggedInEmptyStory = { id: '', name: '' }

export interface StoryListOption {
  id: string
  name: string
  url?: string
}

export interface StoryViewModelDTO extends PostViewModelDTO {
  name: string
  description: string
  coverImage: ImageViewModelDTO | null
  imageLoadState: ImageStateEnum
  imageLoadError: ImageLoadErrorDTO | null
  tags: TagViewModelDTO[]
  commentConnection: {
    totalCount: number
    comments: CommentViewModelDTO[]
    nextCursor: string | null
  }
}

export class StoryViewModel extends PostViewModel<StoryViewModelDTO> {
  private _name: string
  private _description: string
  private _coverImage: ImageViewModel | null
  private _imageLoadState: ImageStateEnum
  private _imageLoadError: ImageLoadErrorDTO | null
  private _tags: TagViewModel[]
  private _commentConnection: {
    totalCount: number
    comments: CommentViewModel[]
    nextCursor: string | null
  }

  static createEmpty() {
    const now = unixtimeNow()
    return new StoryViewModel({
      id: '',
      name: '',
      description: '',
      coverImage: null,
      visibility: VisibilityEnum.Public,
      createdById: '',
      createdByName: '',
      createdAt: now,
      updatedAt: now,
      imageLoadState: ImageStateEnum.NotSet,
      imageLoadError: null,
      tags: [],
      commentConnection: {
        totalCount: 0,
        comments: [],
        nextCursor: null
      }
    })
  }

  constructor(props: StoryViewModelDTO) {
    super({ ...props })
    if (!isString(props.name)) {
      throw new InvalidViewModelPropertyError(`Property "name" must be a string, was '${props.name}'`)
    }
    this._name = props.name

    if (!isString(props.description)) {
      throw new InvalidViewModelPropertyError(`Property "description" must be a string, was '${props.description}'`)
    }
    this._description = props.description

    this._coverImage = props.coverImage ? new ImageViewModel(props.coverImage) : null
    this._imageLoadState = props.imageLoadState || (props.coverImage ? ImageStateEnum.Available : ImageStateEnum.NotSet)
    this._imageLoadError = props.imageLoadError
    this._tags = props.tags.map((tag) => new TagViewModel(tag))
    this._commentConnection = {
      totalCount: props.commentConnection.totalCount,
      comments: props.commentConnection.comments.map((comment) => new CommentViewModel(comment)),
      nextCursor: props.commentConnection.nextCursor
    }
  }

  public get name(): string {
    return this._name
  }

  public set name(name: string) {
    if (!isString(name)) {
      throw new InvalidViewModelPropertyError(`Property "name" must be a string, was '${name}'`)
    }
    this._name = name
  }

  public get description(): string {
    return this._description
  }

  public set description(description: string) {
    if (!isString(description)) {
      throw new InvalidViewModelPropertyError(`Property "description" must be a string, was '${description}'`)
    }
    this._description = description
  }

  public get tags(): TagViewModel[] {
    return this._tags
  }

  public set tags(tags: TagViewModel[]) {
    this._tags = tags
  }

  public get coverImage(): ImageViewModel | null {
    return this._coverImage
  }

  public set coverImage(image: ImageViewModelDTO | null) {
    this._coverImage = image ? new ImageViewModel(image) : null
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
    return this._imageLoadState === ImageStateEnum.Available && this._coverImage !== null
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

  public toJSON(): StoryViewModelDTO {
    return {
      ...this.getBaseProps(),
      coverImage: this.coverImage?.toJSON() ?? null,
      name: this._name,
      description: this._description,
      imageLoadState: this._imageLoadState,
      imageLoadError: this._imageLoadError,
      tags: this._tags,
      commentConnection: this._commentConnection
    }
  }

  public clone(props?: Partial<StoryViewModelDTO>): StoryViewModel {
    if (props) {
      return new StoryViewModel({ ...this.toJSON(), ...props })
    } else {
      return new StoryViewModel(this.toJSON())
    }
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof StoryViewModel &&
      this.coverImage?.id === other.coverImage?.id &&
      this.name === other.name &&
      this.description === other.description &&
      this._imageLoadState === other._imageLoadState
    )
  }
}
