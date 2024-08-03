import { unixtimeNow } from '@hatsuportal/common'
import { DomainEvent, ImageId, UnixTimestamp } from '@hatsuportal/common-bounded-context'
import { Story } from '../../entities/Story'
import { Image } from '@hatsuportal/common-bounded-context'

export class StoryCreatedEvent implements DomainEvent {
  readonly eventType = 'StoryCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class StoryUpdatedEvent implements DomainEvent {
  readonly eventType = 'StoryUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class StoryDeletedEvent implements DomainEvent {
  readonly eventType = 'StoryDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageAddedToStoryEvent implements DomainEvent {
  readonly eventType = 'ImageAddedToStory'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly image: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageUpdatedToStoryEvent implements DomainEvent {
  readonly eventType = 'ImageUpdatedToStory'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly oldImage: Image, public readonly newImage: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageRemovedFromStoryEvent implements DomainEvent {
  readonly eventType = 'ImageRemovedFromStory'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly removedImage: Image) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class ImageLoadFailedEvent implements DomainEvent {
  readonly eventType = 'ImageLoadFailed'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly imageId: ImageId, public readonly error: Error) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
