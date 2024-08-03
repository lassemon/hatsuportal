import { DomainEvent } from '../DomainEvent'
import { Story } from '../../entities/Story'
import { Image } from '../../entities/Image'
import { UnixTimestamp } from '../../valueObjects/UnixTimestamp'
import { unixtimeNow } from '@hatsuportal/common'

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
