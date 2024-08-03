import { DomainEvent } from '@hatsuportal/shared-kernel'

export enum ImageEventTypes {
  ImageCreated = 'ImageCreated',
  ImageUpdated = 'ImageUpdated',
  ImageDeleted = 'ImageDeleted'
}

export interface ImageCreatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly createdById: string
  readonly createdAt: number
}
export class ImageCreatedEvent extends DomainEvent<ImageCreatedEventData> {
  constructor(data: ImageCreatedEventData) {
    super(ImageEventTypes.ImageCreated, data)
  }
}

export interface ImageUpdatedEventData extends Record<string, unknown> {
  readonly id: string
  readonly oldImageId: string | null
  readonly newImageId: string
  readonly updatedAt: number
  readonly updatedById: string
}
export class ImageUpdatedEvent extends DomainEvent<ImageUpdatedEventData> {
  constructor(data: ImageUpdatedEventData) {
    super(ImageEventTypes.ImageUpdated, data)
  }
}

export interface ImageDeletedEventData extends Record<string, unknown> {
  readonly id: string
  readonly deletedById: string
  readonly deletedAt: number
}
export class ImageDeletedEvent extends DomainEvent<ImageDeletedEventData> {
  constructor(data: ImageDeletedEventData) {
    super(ImageEventTypes.ImageDeleted, data)
  }
}
