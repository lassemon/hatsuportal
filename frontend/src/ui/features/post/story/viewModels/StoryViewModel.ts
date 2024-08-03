import { InvalidViewModelPropertyError } from 'application/errors/InvalidViewModelPropertyError'
import { CommentViewModel, CommentViewModelDTO } from '../../comment/viewModel/CommentViewModel'
import { EntityTypeEnum, ImageStateEnum, isString, unixtimeNow, VisibilityEnum } from '@hatsuportal/common'
import { PostViewModel, PostViewModelDTO } from '../../common/viewModels/PostViewModel'

export const emptyStory = { id: '', name: '' }
export const loggedInEmptyStory = { id: '', name: '' }

export interface StoryListOption {
  id: string
  title: string
  url?: string
}

export interface StoryViewModelDTO extends PostViewModelDTO {
  body: string
  commentConnection: {
    totalCount: number
    comments: CommentViewModelDTO[]
    nextCursor: string | null
  }
}

export class StoryViewModel extends PostViewModel<StoryViewModelDTO> {
  private _body: string
  private _commentConnection: {
    totalCount: number
    comments: CommentViewModel[]
    nextCursor: string | null
  }

  static createEmpty() {
    const now = unixtimeNow()
    return new StoryViewModel({
      id: '',
      title: '',
      postType: EntityTypeEnum.Story,
      body: '',
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
    super({ ...props, postType: EntityTypeEnum.Story })
    if (!isString(props.title)) {
      throw new InvalidViewModelPropertyError(`Property "title" must be a string, was '${props.title}'`)
    }

    if (!isString(props.body)) {
      throw new InvalidViewModelPropertyError(`Property "body" must be a string, was '${props.body}'`)
    }
    this._body = props.body

    this._commentConnection = {
      totalCount: props.commentConnection.totalCount,
      comments: props.commentConnection.comments.map((comment) => new CommentViewModel(comment)),
      nextCursor: props.commentConnection.nextCursor
    }
  }

  public get body(): string {
    return this._body
  }

  public set body(body: string) {
    if (!isString(body)) {
      throw new InvalidViewModelPropertyError(`Property "body" must be a string, was '${body}'`)
    }
    this._body = body
  }

  public override toJSON(): StoryViewModelDTO {
    return {
      ...this.getBaseProps(),
      coverImage: this.coverImage?.toJSON() ?? null,
      title: this.title,
      postType: this.postType,
      body: this._body,
      imageLoadState: this.imageLoadState,
      imageLoadError: this.imageLoadError,
      tags: this.tags,
      commentConnection: this._commentConnection
    }
  }

  public override clone(props?: Partial<StoryViewModelDTO>): StoryViewModel {
    if (props) {
      return new StoryViewModel({ ...this.toJSON(), ...props })
    } else {
      return new StoryViewModel(this.toJSON())
    }
  }

  public override equals(other: unknown): boolean {
    return super.equals(other) && other instanceof StoryViewModel && this.body === other.body
  }
}
