import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'
import { unixtimeNow } from '@hatsuportal/common'

export enum StoryEventTypes {
  StoryCreated = 'StoryCreated',
  StoryNameUpdated = 'StoryNameUpdated',
  StoryVisibilityUpdated = 'StoryVisibilityUpdated',
  StoryDescriptionUpdated = 'StoryDescriptionUpdated',
  StoryDeleted = 'StoryDeleted',
  CoverImageAddedToStory = 'CoverImageAddedToStory',
  CoverImageUpdatedToStory = 'CoverImageUpdatedToStory',
  CoverImageRemovedFromStory = 'CoverImageRemovedFromStory',
  StoryTagsUpdated = 'StoryTagsUpdated',
  StoryTagAdded = 'StoryTagAdded',
  StoryTagRemoved = 'StoryTagRemoved'
}

export interface StoryCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly name: string
  readonly createdById: string
  readonly createdAt: number
}

export class StoryCreatedEvent implements IDomainEvent<UnixTimestamp, StoryCreatedEventData> {
  readonly eventType = StoryEventTypes.StoryCreated
  readonly occurredOn: UnixTimestamp
  readonly data: StoryCreatedEventData

  constructor(data: StoryCreatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryNameUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly name: string
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryNameUpdatedEvent implements IDomainEvent<UnixTimestamp, StoryNameUpdatedEventData> {
  readonly eventType = StoryEventTypes.StoryNameUpdated
  readonly occurredOn: UnixTimestamp
  readonly data: StoryNameUpdatedEventData

  constructor(data: StoryNameUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryVisibilityUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly visibility: string
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryVisibilityUpdatedEvent implements IDomainEvent<UnixTimestamp, StoryVisibilityUpdatedEventData> {
  readonly eventType = StoryEventTypes.StoryVisibilityUpdated
  readonly occurredOn: UnixTimestamp
  readonly data: StoryVisibilityUpdatedEventData

  constructor(data: StoryVisibilityUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryDescriptionUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly description: string
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryDescriptionUpdatedEvent implements IDomainEvent<UnixTimestamp, StoryDescriptionUpdatedEventData> {
  readonly eventType = StoryEventTypes.StoryDescriptionUpdated
  readonly occurredOn: UnixTimestamp
  readonly data: StoryDescriptionUpdatedEventData

  constructor(data: StoryDescriptionUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryTagsUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly tagIds: string[]
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryTagsUpdatedEvent implements IDomainEvent<UnixTimestamp, StoryTagsUpdatedEventData> {
  readonly eventType = StoryEventTypes.StoryTagsUpdated
  readonly occurredOn: UnixTimestamp
  readonly data: StoryTagsUpdatedEventData

  constructor(data: StoryTagsUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryTagAddedEventData extends Record<string, unknown> {
  readonly id: string
  readonly tagId: string
  readonly addedById: string
  readonly updatedAt: number
}
export class StoryTagAddedEvent implements IDomainEvent<UnixTimestamp, StoryTagAddedEventData> {
  readonly eventType = StoryEventTypes.StoryTagAdded
  readonly occurredOn: UnixTimestamp
  readonly data: StoryTagAddedEventData

  constructor(data: StoryTagAddedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryTagRemovedEventData extends Record<string, unknown> {
  readonly id: string
  readonly tagId: string
  readonly removedById: string
  readonly updatedAt: number
}
export class StoryTagRemovedEvent implements IDomainEvent<UnixTimestamp, StoryTagRemovedEventData> {
  readonly eventType = StoryEventTypes.StoryTagRemoved
  readonly occurredOn: UnixTimestamp
  readonly data: StoryTagRemovedEventData

  constructor(data: StoryTagRemovedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface StoryDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deletedById: string
  readonly deletedAt: number
}
export class StoryDeletedEvent implements IDomainEvent<UnixTimestamp, StoryDeletedEventData> {
  readonly eventType = StoryEventTypes.StoryDeleted
  readonly occurredOn: UnixTimestamp
  readonly data: StoryDeletedEventData

  constructor(data: StoryDeletedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface CoverImageAddedToStoryEventData extends Record<string, unknown> {
  readonly id: string
  readonly imageId: string
  readonly addedById: string
}
export class CoverImageAddedToStoryEvent implements IDomainEvent<UnixTimestamp, CoverImageAddedToStoryEventData> {
  readonly eventType = StoryEventTypes.CoverImageAddedToStory
  readonly occurredOn: UnixTimestamp
  readonly data: CoverImageAddedToStoryEventData

  constructor(data: CoverImageAddedToStoryEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface CoverImageUpdatedToStoryEventData extends Record<string, unknown> {
  readonly id: string
  readonly oldImageId: string
  readonly newImageId: string
  readonly updatedById: string
}
export class CoverImageUpdatedToStoryEvent implements IDomainEvent<UnixTimestamp, CoverImageUpdatedToStoryEventData> {
  readonly eventType = StoryEventTypes.CoverImageUpdatedToStory
  readonly occurredOn: UnixTimestamp
  readonly data: CoverImageUpdatedToStoryEventData

  constructor(data: CoverImageUpdatedToStoryEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface CoverImageRemovedFromStoryEventData extends Record<string, unknown> {
  readonly id: string
  readonly removedImageId: string
  readonly removedById: string
}
export class CoverImageRemovedFromStoryEvent implements IDomainEvent<UnixTimestamp, CoverImageRemovedFromStoryEventData> {
  readonly eventType = StoryEventTypes.CoverImageRemovedFromStory
  readonly occurredOn: UnixTimestamp
  readonly data: CoverImageRemovedFromStoryEventData

  constructor(data: CoverImageRemovedFromStoryEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}
