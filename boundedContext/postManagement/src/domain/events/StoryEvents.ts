import { DomainEvent } from '@hatsuportal/shared-kernel'

export enum StoryEventTypes {
  StoryCreated = 'StoryCreated',
  StoryTitleUpdated = 'StoryTitleUpdated',
  StoryVisibilityUpdated = 'StoryVisibilityUpdated',
  StoryBodyUpdated = 'StoryBodyUpdated',
  StoryDeleted = 'StoryDeleted',
  CoverImageAddedToStory = 'CoverImageAddedToStory',
  CoverImageUpdatedToStory = 'CoverImageUpdatedToStory',
  StoryTagsUpdated = 'StoryTagsUpdated',
  StoryTagAdded = 'StoryTagAdded',
  StoryTagRemoved = 'StoryTagRemoved'
}

export interface StoryCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly title: string
  readonly createdById: string
  readonly createdAt: number
}

export class StoryCreatedEvent extends DomainEvent<StoryCreatedEventData> {
  constructor(data: StoryCreatedEventData) {
    super(StoryEventTypes.StoryCreated, data)
  }
}

export interface StoryTitleUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly title: string
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryTitleUpdatedEvent extends DomainEvent<StoryTitleUpdatedEventData> {
  constructor(data: StoryTitleUpdatedEventData) {
    super(StoryEventTypes.StoryTitleUpdated, data)
  }
}

export interface StoryVisibilityUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly visibility: string
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryVisibilityUpdatedEvent extends DomainEvent<StoryVisibilityUpdatedEventData> {
  constructor(data: StoryVisibilityUpdatedEventData) {
    super(StoryEventTypes.StoryVisibilityUpdated, data)
  }
}

export interface StoryBodyUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly body: string
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryBodyUpdatedEvent extends DomainEvent<StoryBodyUpdatedEventData> {
  constructor(data: StoryBodyUpdatedEventData) {
    super(StoryEventTypes.StoryBodyUpdated, data)
  }
}

export interface StoryTagsUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly tagIds: string[]
  readonly updatedById: string
  readonly updatedAt: number
}
export class StoryTagsUpdatedEvent extends DomainEvent<StoryTagsUpdatedEventData> {
  constructor(data: StoryTagsUpdatedEventData) {
    super(StoryEventTypes.StoryTagsUpdated, data)
  }
}

export interface StoryTagAddedEventData extends Record<string, unknown> {
  readonly id: string
  readonly tagId: string
  readonly addedById: string
  readonly updatedAt: number
}
export class StoryTagAddedEvent extends DomainEvent<StoryTagAddedEventData> {
  constructor(data: StoryTagAddedEventData) {
    super(StoryEventTypes.StoryTagAdded, data)
  }
}

export interface StoryTagRemovedEventData extends Record<string, unknown> {
  readonly id: string
  readonly tagId: string
  readonly removedById: string
  readonly updatedAt: number
}
export class StoryTagRemovedEvent extends DomainEvent<StoryTagRemovedEventData> {
  constructor(data: StoryTagRemovedEventData) {
    super(StoryEventTypes.StoryTagRemoved, data)
  }
}

export interface StoryDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deletedById: string
  readonly deletedAt: number
}
export class StoryDeletedEvent extends DomainEvent<StoryDeletedEventData> {
  constructor(data: StoryDeletedEventData) {
    super(StoryEventTypes.StoryDeleted, data)
  }
}

export interface CoverImageAddedToStoryEventData extends Record<string, unknown> {
  readonly id: string
  readonly imageId: string
  readonly addedById: string
}
export class CoverImageAddedToStoryEvent extends DomainEvent<CoverImageAddedToStoryEventData> {
  constructor(data: CoverImageAddedToStoryEventData) {
    super(StoryEventTypes.CoverImageAddedToStory, data)
  }
}

export interface CoverImageUpdatedToStoryEventData extends Record<string, unknown> {
  readonly id: string
  readonly oldImageId: string
  readonly newImageId: string
  readonly updatedById: string
}
export class CoverImageUpdatedToStoryEvent extends DomainEvent<CoverImageUpdatedToStoryEventData> {
  constructor(data: CoverImageUpdatedToStoryEventData) {
    super(StoryEventTypes.CoverImageUpdatedToStory, data)
  }
}
