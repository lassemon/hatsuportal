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
  readonly updatedById: string
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
