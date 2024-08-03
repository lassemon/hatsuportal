import { DomainEvent } from '@hatsuportal/shared-kernel'

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
export class CommentCreatedEvent extends DomainEvent<CommentCreatedEventData> {
  constructor(data: CommentCreatedEventData) {
    super(CommentEventTypes.CommentCreated, data)
  }
}

export interface CommentUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly authorId: string
  readonly body: string | null
  readonly parentCommentId: string | null
}
export class CommentUpdatedEvent extends DomainEvent<CommentUpdatedEventData> {
  constructor(data: CommentUpdatedEventData) {
    super(CommentEventTypes.CommentUpdated, data)
  }
}

export interface CommentSoftDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly deletedById: string
  readonly deletedAt: number
  readonly parentCommentId: string | null
}
export class CommentSoftDeletedEvent extends DomainEvent<CommentSoftDeletedEventData> {
  constructor(data: CommentSoftDeletedEventData) {
    super(CommentEventTypes.CommentSoftDeleted, data)
  }
}

export interface CommentDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly postId: string
  readonly deletedById: string
  readonly deletedAt: number
  readonly parentCommentId: string | null
}
export class CommentDeletedEvent extends DomainEvent<CommentDeletedEventData> {
  constructor(data: CommentDeletedEventData) {
    super(CommentEventTypes.CommentDeleted, data)
  }
}
