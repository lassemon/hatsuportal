import { unixtimeNow } from '@hatsuportal/common'
import { Image } from '../../entities/Image'
import { IDomainEvent } from '../IDomainEvent'
import { UnixTimestamp } from '../../valueObjects/UnixTimestamp'

export class ImageCreatedEvent implements IDomainEvent {
  readonly eventType = 'ImageCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageUpdatedEvent implements IDomainEvent {
  readonly eventType = 'ImageUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageDeletedEvent implements IDomainEvent {
  readonly eventType = 'ImageDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
