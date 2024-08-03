import { describe, expect, it } from 'vitest'
import {
  CoverImageAddedToStoryEvent,
  CoverImageUpdatedToStoryEvent,
  StoryBodyUpdatedEvent,
  StoryCreatedEvent,
  StoryDeletedEvent,
  StoryTitleUpdatedEvent,
  StoryVisibilityUpdatedEvent
} from './StoryEvents'

describe('StoryEvents', () => {
  it('constructs story lifecycle events with payload data', () => {
    expect(
      new StoryCreatedEvent({
        id: 'story-1',
        title: 'My Story',
        createdById: 'user-1',
        createdAt: 1
      }).eventType
    ).toBe('StoryCreated')

    expect(
      new StoryTitleUpdatedEvent({
        id: 'story-1',
        title: 'Renamed',
        updatedById: 'user-1',
        updatedAt: 2
      }).eventType
    ).toBe('StoryTitleUpdated')

    expect(
      new StoryVisibilityUpdatedEvent({
        id: 'story-1',
        visibility: 'public',
        updatedById: 'user-1',
        updatedAt: 3
      }).eventType
    ).toBe('StoryVisibilityUpdated')

    expect(
      new StoryBodyUpdatedEvent({
        id: 'story-1',
        body: 'Updated body',
        updatedById: 'user-1',
        updatedAt: 4
      }).eventType
    ).toBe('StoryBodyUpdated')

    expect(
      new StoryDeletedEvent({
        id: 'story-1',
        deletedById: 'user-1',
        deletedAt: 5
      }).eventType
    ).toBe('StoryDeleted')

    expect(
      new CoverImageAddedToStoryEvent({
        id: 'story-1',
        imageId: 'img-1',
        addedById: 'user-1'
      }).eventType
    ).toBe('CoverImageAddedToStory')

    expect(
      new CoverImageUpdatedToStoryEvent({
        id: 'story-1',
        oldImageId: 'img-1',
        newImageId: 'img-2',
        updatedById: 'user-1'
      }).eventType
    ).toBe('CoverImageUpdatedToStory')
  })
})
