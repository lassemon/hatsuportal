import { unixtimeNow } from '@hatsuportal/common'
import { Image, ImageVersion } from '../../entities/Image'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

export class ImageCreatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageUpdatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly oldImage: Image, public readonly newImage: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageVersionStagedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageVersionStaged'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly imageVersion: ImageVersion) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageVersionPromotedToCurrentEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageVersionPromotedToCurrent'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly imageVersion: ImageVersion) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageVersionDiscardedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageVersionDiscarded'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly imageVersion: ImageVersion) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageDeletedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
