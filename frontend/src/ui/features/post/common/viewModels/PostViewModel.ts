import { EntityTypeEnum, ImageStateEnum, isEnumValue } from '@hatsuportal/common'
import { ImageViewModel, ImageViewModelDTO } from 'ui/features/image/viewModels/ImageViewModel'
import { AbstractPostViewModel, AbstractPostViewModelDTO } from 'ui/shared/viewModels/AbstractPostViewModel'
import { ImageLoadErrorDTO } from '@hatsuportal/contracts'
import { TagViewModel, TagViewModelDTO } from '../../tag/viewModel/TagViewModel'
import { isString } from 'lodash'
import { InvalidViewModelPropertyError } from 'application/errors/InvalidViewModelPropertyError'

export interface PostViewModelDTO extends AbstractPostViewModelDTO {
  title: string
  postType: EntityTypeEnum
  coverImage: ImageViewModelDTO | null
  imageLoadState: ImageStateEnum
  imageLoadError: ImageLoadErrorDTO | null
  tags: TagViewModelDTO[]
}

export class PostViewModel<Model extends PostViewModelDTO> extends AbstractPostViewModel<Model> {
  private _title: string
  private _postType: EntityTypeEnum
  private _coverImage: ImageViewModel | null
  private _imageLoadState: ImageStateEnum
  private _imageLoadError: ImageLoadErrorDTO | null
  private _tags: TagViewModel[]

  constructor(props: Model) {
    super({ ...props })
    if (!isString(props.title)) {
      throw new InvalidViewModelPropertyError(`Property "title" must be a string, was '${props.title}'`)
    }
    this._title = props.title

    if (!isEnumValue(props.postType, EntityTypeEnum)) {
      throw new InvalidViewModelPropertyError(`Property "postType" must be a valid entity type, was '${props.postType}'`)
    }
    this._postType = props.postType

    this._coverImage = props.coverImage ? new ImageViewModel(props.coverImage) : null
    this._imageLoadState = props.imageLoadState || (props.coverImage ? ImageStateEnum.Available : ImageStateEnum.NotSet)
    this._imageLoadError = props.imageLoadError
    this._tags = props.tags.map((tag) => new TagViewModel(tag))
  }

  public get title(): string {
    return this._title
  }

  public set title(title: string) {
    if (!isString(title)) {
      throw new InvalidViewModelPropertyError(`Property "title" must be a string, was '${title}'`)
    }
    this._title = title
  }

  public get postType(): EntityTypeEnum {
    return this._postType
  }

  public set postType(postType: EntityTypeEnum) {
    if (!isEnumValue(postType, EntityTypeEnum)) {
      throw new InvalidViewModelPropertyError(`Property "postType" must be a valid entity type, was '${postType}'`)
    }
    this._postType = postType
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

  public toJSON(): PostViewModelDTO {
    return {
      ...this.getBaseProps(),
      coverImage: this.coverImage?.toJSON() ?? null,
      title: this._title,
      postType: this._postType,
      imageLoadState: this._imageLoadState,
      imageLoadError: this._imageLoadError,
      tags: this._tags
    }
  }

  public clone(props?: Partial<Model>): PostViewModel<Model> {
    if (props) {
      return new PostViewModel({ ...this.toJSON(), ...props })
    } else {
      return new PostViewModel(this.toJSON())
    }
  }

  public override equals(other: unknown): boolean {
    return (
      super.equals(other) &&
      other instanceof PostViewModel &&
      this.coverImage?.id === other.coverImage?.id &&
      this.title === other.title &&
      this.postType === other.postType &&
      this.imageLoadState === other.imageLoadState
    )
  }
}
