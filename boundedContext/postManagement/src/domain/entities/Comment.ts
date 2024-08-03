import { Entity, EntityProps, IDomainEvent, NonEmptyString, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow } from '@hatsuportal/common'
import { CommentId } from '../valueObjects/CommentId'
import { PostId } from '../valueObjects/PostId'
import { CommentAuthorId } from '../valueObjects/CommentAuthorId'
import { CommentCreatedEvent, CommentUpdatedEvent, CommentDeletedEvent, CommentSoftDeletedEvent } from '../events/CommentEvents'

export interface CommentProps extends EntityProps {
  postId: PostId
  authorId: CommentAuthorId
  body: NonEmptyString | null // null if isDeleted
  parentCommentId: CommentId | null
  isDeleted: boolean
}

export class Comment extends Entity {
  static canCreate(props: any): boolean {
    try {
      Comment.assertCanCreate(props)
      return true
    } catch (error) {
      return false
    }
  }

  static assertCanCreate(props: any): void {
    new Comment(
      props.id instanceof CommentId ? props.id : new CommentId(props.id),
      props.postId instanceof PostId ? props.postId : new PostId(props.postId),
      props.authorId instanceof CommentAuthorId ? props.authorId : new CommentAuthorId(props.authorId),
      props.body === null ? null : props.body instanceof NonEmptyString ? props.body : new NonEmptyString(props.body),
      props.parentCommentId === null
        ? null
        : props.parentCommentId instanceof CommentId
        ? props.parentCommentId
        : new CommentId(props.parentCommentId),
      props.isDeleted,
      props.createdAt instanceof UnixTimestamp ? props.createdAt : new UnixTimestamp(props.createdAt),
      props.updatedAt instanceof UnixTimestamp ? props.updatedAt : new UnixTimestamp(props.updatedAt)
    )
  }

  static create(props: CommentProps): Comment {
    const comment = new Comment(
      props.id,
      props.postId,
      props.authorId,
      props.body,
      props.parentCommentId,
      props.isDeleted,
      props.createdAt,
      props.updatedAt
    )
    comment.addDomainEvent(new CommentCreatedEvent(comment))
    return comment
  }

  static reconstruct(props: CommentProps): Comment {
    return new Comment(
      props.id,
      props.postId,
      props.authorId,
      props.body,
      props.parentCommentId,
      props.isDeleted,
      props.createdAt,
      props.updatedAt
    )
  }

  private _postId: PostId
  private _authorId: CommentAuthorId
  private _body: NonEmptyString | null
  private _parentCommentId: CommentId | null
  private _isDeleted: boolean

  private constructor(
    id: CommentId,
    postId: PostId,
    authorId: CommentAuthorId,
    body: NonEmptyString | null,
    parentCommentId: CommentId | null,
    isDeleted: boolean,
    createdAt: UnixTimestamp,
    updatedAt: UnixTimestamp
  ) {
    super(id, createdAt, updatedAt)

    this._postId = postId
    this._authorId = authorId
    this._body = body
    this._parentCommentId = parentCommentId
    this._isDeleted = isDeleted
  }

  public get postId(): PostId {
    return this._postId
  }

  public get authorId(): CommentAuthorId {
    return this._authorId
  }

  public writeBody(body: NonEmptyString): void {
    this._body = body
    this._updatedAt = new UnixTimestamp(unixtimeNow())
    this.addDomainEvent(new CommentUpdatedEvent(this))
  }

  public get body(): NonEmptyString | null {
    return this._body
  }

  public get parentCommentId(): CommentId | null {
    return this._parentCommentId
  }

  public get isDeleted(): boolean {
    return this._isDeleted
  }

  /**
   * Creates a plain object of all the properties encapsulated by this object. For use with logging and observability.
   * @returns A plain object of all the properties encapsulated by this object.
   */
  public serialize() {
    return {
      id: this.id.value,
      postId: this.postId.value,
      authorId: this.authorId.value,
      body: this.body?.value ?? null,
      parentCommentId: this.parentCommentId?.value ?? null,
      isDeleted: this.isDeleted,
      createdAt: this.createdAt.value,
      updatedAt: this.updatedAt.value
    }
  }

  public clone(): Comment {
    return new Comment(this.id, this.postId, this.authorId, this.body, this.parentCommentId, this.isDeleted, this.createdAt, this.updatedAt)
  }

  public softDelete(): void {
    if (!this._isDeleted) {
      this._isDeleted = true
      this._updatedAt = new UnixTimestamp(unixtimeNow())
      this.addDomainEvent(new CommentSoftDeletedEvent(this))
    }
  }

  public delete(): void {
    if (!this._isDeleted) {
      this._isDeleted = true
      this._updatedAt = new UnixTimestamp(unixtimeNow())
      this.addDomainEvent(new CommentDeletedEvent(this))
    }
  }

  public override equals(other: unknown): boolean {
    return (
      other instanceof Comment &&
      this.id.equals(other.id) &&
      this.postId.equals(other.postId) &&
      this.authorId.equals(other.authorId) &&
      (this.body ? this.body.equals(other.body) : other.body === null)
    )
  }

  public get domainEvents(): IDomainEvent<UnixTimestamp>[] {
    return [...this._domainEvents]
  }

  public clearEvents(): void {
    this._domainEvents = []
  }

  public addDomainEvent(event: IDomainEvent<UnixTimestamp>): void {
    this._domainEvents.push(event)
  }
}
