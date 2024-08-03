import { unixtimeNow } from '@hatsuportal/common'
import { IDomainEvent, UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface ImageCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly createdById: string
  readonly createdAt: number
}
export class ImageCreatedEvent implements IDomainEvent<UnixTimestamp, ImageCreatedEventData> {
  readonly eventType = 'ImageCreated'
  readonly occurredOn: UnixTimestamp
  readonly data: ImageCreatedEventData

  constructor(data: ImageCreatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface ImageUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly oldImageId: string | null
  readonly newImageId: string
  readonly updatedAt: number
}
export class ImageUpdatedEvent implements IDomainEvent<UnixTimestamp, ImageUpdatedEventData> {
  readonly eventType = 'ImageUpdated'
  readonly occurredOn: UnixTimestamp
  readonly data: ImageUpdatedEventData

  constructor(data: ImageUpdatedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface ImageVersionStagedEventData extends Record<string, unknown> {
  readonly id: string
  readonly imageVersionId: string
  readonly stagedAt: number
}

export class ImageVersionStagedEvent implements IDomainEvent<UnixTimestamp, ImageVersionStagedEventData> {
  readonly eventType = 'ImageVersionStaged'
  readonly occurredOn: UnixTimestamp
  readonly data: ImageVersionStagedEventData

  constructor(data: ImageVersionStagedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface ImageVersionPromotedToCurrentEventData extends Record<string, unknown> {
  readonly id: string
  readonly imageVersionId: string
  readonly promotedAt: number
  readonly promotedById: string
}
export class ImageVersionPromotedToCurrentEvent implements IDomainEvent<UnixTimestamp, ImageVersionPromotedToCurrentEventData> {
  readonly eventType = 'ImageVersionPromotedToCurrent'
  readonly occurredOn: UnixTimestamp
  readonly data: ImageVersionPromotedToCurrentEventData

  constructor(data: ImageVersionPromotedToCurrentEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface ImageVersionDiscardedEventData extends Record<string, unknown> {
  readonly id: string
  readonly imageVersionId: string
  readonly discardedAt: number
  readonly discardedById: string
}
export class ImageVersionDiscardedEvent implements IDomainEvent<UnixTimestamp, ImageVersionDiscardedEventData> {
  readonly eventType = 'ImageVersionDiscarded'
  readonly occurredOn: UnixTimestamp
  readonly data: ImageVersionDiscardedEventData

  constructor(data: ImageVersionDiscardedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}

export interface ImageDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deletedById: string
  readonly deletedAt: number
}
export class ImageDeletedEvent implements IDomainEvent<UnixTimestamp, ImageDeletedEventData> {
  readonly eventType = 'ImageDeleted'
  readonly occurredOn: UnixTimestamp
  readonly data: ImageDeletedEventData

  constructor(data: ImageDeletedEventData) {
    this.occurredOn = new UnixTimestamp(unixtimeNow())
    this.data = data
  }
}
