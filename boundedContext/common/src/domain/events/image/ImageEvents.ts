import { unixtimeNow } from '@hatsuportal/common'
import { Image } from '../../entities/Image'
import { DomainEvent } from '../DomainEvent'
import { UnixTimestamp } from '../../valueObjects/UnixTimestamp'

export class ImageCreatedEvent implements DomainEvent {
  readonly eventType = 'ImageCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageUpdatedEvent implements DomainEvent {
  readonly eventType = 'ImageUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageDeletedEvent implements DomainEvent {
  readonly eventType = 'ImageDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
