import { InvalidViewModelPropertyError } from 'infrastructure/errors/InvalidViewModelPropertyError'
import { isNumber } from 'lodash'
import { ReplyViewModel, ReplyViewModelDTO } from './ReplyViewModel'

export interface CommentViewModelDTO {
  readonly id: string
  readonly postId: string
  readonly authorId: string
  readonly authorName: string
  body: string | null
  readonly parentCommentId: string | null
  isDeleted: boolean
  readonly createdAt: number
  updatedAt: number

  replyCount: number
  hasReplies: boolean
  repliesPreview?: {
    replies: ReplyViewModelDTO[]
    nextCursor: string | null
  }
}

export class CommentViewModel {
  private readonly _id: string
  private readonly _postId: string
  private _authorId: string
  private _authorName: string
  private _body: string | null
  private _parentCommentId: string | null
  private _isDeleted: boolean
  private _createdAt: number
  private _updatedAt: number
  private _replyCount: number
  private _hasReplies: boolean
  private _repliesPreview?: {
    replies: ReplyViewModel[]
    nextCursor: string | null
  }

  constructor(props: CommentViewModelDTO) {
    this._id = props.id
    this._postId = props.postId
    this._authorId = props.authorId
    this._authorName = props.authorName
    this._body = props.body
    this._parentCommentId = props.parentCommentId
    this._isDeleted = props.isDeleted
    this._replyCount = props.replyCount
    this._hasReplies = props.hasReplies
    this._repliesPreview = props.repliesPreview
      ? {
          replies: props.repliesPreview.replies.map((reply) => new ReplyViewModel(reply)),
          nextCursor: props.repliesPreview.nextCursor
        }
      : undefined

    if (!isNumber(props.createdAt)) {
      throw new InvalidViewModelPropertyError(`Property "createdAt" must be a number, was '${props.createdAt}'`)
    }
    this._createdAt = props.createdAt

    if (!isNumber(props.updatedAt) && props.updatedAt !== null) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number, was '${props.updatedAt}'`)
    }
    this._updatedAt = props.updatedAt
  }

  public get id(): string {
    return this._id
  }

  public get postId(): string {
    return this._postId
  }

  public get authorId(): string {
    return this._authorId
  }

  public get authorName(): string {
    return this._authorName
  }

  public get body(): string | null {
    return this._body
  }

  public set body(body: string | null) {
    this._body = body
  }

  public get parentCommentId(): string | null {
    return this._parentCommentId
  }

  public get isDeleted(): boolean {
    return this._isDeleted
  }

  public set isDeleted(isDeleted: boolean) {
    this._isDeleted = isDeleted
  }

  public get replyCount(): number {
    return this._replyCount
  }

  public get hasReplies(): boolean {
    return this._hasReplies
  }

  public get repliesPreview():
    | {
        replies: ReplyViewModel[]
        nextCursor: string | null
      }
    | undefined {
    return this._repliesPreview
  }

  public get createdAt(): number {
    return this._createdAt
  }

  public get updatedAt(): number {
    return this._updatedAt
  }

  public set updatedAt(updatedAt: number) {
    if (!isNumber(updatedAt)) {
      throw new InvalidViewModelPropertyError(`Property "updatedAt" must be a number, was '${updatedAt}'`)
    }
    this._updatedAt = updatedAt
  }

  public toJSON(): CommentViewModelDTO {
    return {
      id: this._id,
      postId: this._postId,
      authorId: this._authorId,
      authorName: this._authorName,
      body: this._body,
      parentCommentId: this._parentCommentId,
      isDeleted: this._isDeleted,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      replyCount: this._replyCount,
      hasReplies: this._hasReplies,
      repliesPreview: this._repliesPreview
    }
  }

  public clone(props?: Partial<CommentViewModelDTO>): CommentViewModel {
    if (props) {
      return new CommentViewModel({ ...this.toJSON(), ...props })
    } else {
      return new CommentViewModel(this.toJSON())
    }
  }

  public equals(other: unknown): boolean {
    return (
      other instanceof CommentViewModel &&
      this.id === other.id &&
      this.postId === other.postId &&
      this.authorId === other.authorId &&
      this.authorName === other.authorName &&
      this.body === other.body &&
      this.parentCommentId === other.parentCommentId &&
      this.isDeleted === other.isDeleted &&
      this.createdAt === other.createdAt &&
      this.updatedAt === other.updatedAt
    )
  }
}
