import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow } from '@hatsuportal/common'

export enum CommentEventTypes {
  CommentCreated = 'CommentCreated',
  CommentUpdated = 'CommentUpdated',
  CommentSoftDeleted = 'CommentSoftDeleted',
  CommentDeleted = 'CommentDeleted'
}

export interface CommentCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly authorId: string
  readonly body: string | null
  readonly parentCommentId: string | null
}
export class CommentCreatedEvent implements IDomainEvent<UnixTimestamp, CommentCreatedEventData> {
  readonly eventType = 'CommentCreated'
  readonly occurredOn: UnixTimestamp
  readonly data: CommentCreatedEventData

  constructor(data: CommentCreatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface CommentUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly authorId: string
  readonly body: string | null
  readonly parentCommentId: string | null
}
export class CommentUpdatedEvent implements IDomainEvent<UnixTimestamp, CommentUpdatedEventData> {
  readonly eventType = 'CommentUpdated'
  readonly occurredOn: UnixTimestamp
  readonly data: CommentUpdatedEventData

  constructor(data: CommentUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface CommentSoftDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly deletedById: string
  readonly deletedAt: number
  readonly parentCommentId: string | null
}
export class CommentSoftDeletedEvent implements IDomainEvent<UnixTimestamp, CommentSoftDeletedEventData> {
  readonly eventType = 'CommentSoftDeleted'
  readonly occurredOn: UnixTimestamp
  readonly data: CommentSoftDeletedEventData

  constructor(data: CommentSoftDeletedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface CommentDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly deletedById: string
  readonly deletedAt: number
  readonly parentCommentId: string | null
}
export class CommentDeletedEvent implements IDomainEvent<UnixTimestamp, CommentDeletedEventData> {
  readonly eventType = 'CommentDeleted'
  readonly occurredOn: UnixTimestamp
  readonly data: CommentDeletedEventData

  constructor(data: CommentDeletedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}
