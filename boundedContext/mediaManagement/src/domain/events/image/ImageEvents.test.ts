import { describe, expect, it } from 'vitest'
import { ImageCreatedEvent, ImageDeletedEvent, ImageUpdatedEvent } from './ImageEvents'

describe('ImageEvents', () => {
  it('constructs image lifecycle events with payload data', () => {
    expect(new ImageCreatedEvent({ id: 'img-1', createdById: 'user-1', createdAt: 1 }).eventType).toBe('ImageCreated')
    expect(
      new ImageUpdatedEvent({
        id: 'img-1',
        oldImageId: 'v1',
        newImageId: 'v2',
        updatedAt: 2,
        updatedById: 'user-1'
      }).eventType
    ).toBe('ImageUpdated')
    expect(new ImageDeletedEvent({ id: 'img-1', deletedById: 'user-1', deletedAt: 6 }).eventType).toBe('ImageDeleted')
  })
})
