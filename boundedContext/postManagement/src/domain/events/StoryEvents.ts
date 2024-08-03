import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { Story } from '../entities/Story'
import { unixtimeNow } from '@hatsuportal/common'
import { CoverImageId } from '../valueObjects/CoverImageId'

export class StoryCreatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'StoryCreated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

// TODO, refactor this to split into multiple events
// e.g. StoryNameUpdatedEvent, StoryVisibilityUpdatedEvent, StoryDescriptionUpdatedEvent, StoryCoverImageUpdatedEvent etc.
export class StoryUpdatedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'StoryUpdated'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class StoryDeletedEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'StoryDeleted'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class CoverImageAddedToStoryEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageAddedToStory'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly imageId: CoverImageId) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class CoverImageUpdatedToStoryEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageUpdatedToStory'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly oldImageId: CoverImageId, public readonly newImageId: CoverImageId) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}

export class CoverImageRemovedFromStoryEvent implements IDomainEvent<UnixTimestamp> {
  readonly eventType = 'ImageRemovedFromStory'
  readonly occurredOn: UnixTimestamp

  constructor(public readonly story: Story, public readonly removedImageId: CoverImageId) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
  }
}
