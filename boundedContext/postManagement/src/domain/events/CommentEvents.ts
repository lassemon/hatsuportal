import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Comment } from '../entities/Comment'
import { unixtimeNow } from '@hatsuportal/common'

export class CommentCreatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'CommentCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly comment: Comment) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class CommentUpdatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'CommentUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly comment: Comment) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class CommentSoftDeletedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'CommentSoftDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly comment: Comment) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class CommentDeletedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'CommentDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly comment: Comment) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
