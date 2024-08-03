import { ImageRoleEnum } from '@hatsuportal/common'
import { describe, expect, it } from 'vitest'
import { CoverImageId } from '../../domain/valueObjects/CoverImageId'
import { StoryReadDatabaseSchema } from '../schemas/StoryReadDatabaseSchema'
import { StoryInfrastructureMapper } from './StoryInfrastructureMapper'

describe('StoryInfrastructureMapper', () => {
  const storyMapper = new StoryInfrastructureMapper()

  it('converts story to insert query', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const insertQuery = storyMapper.toStoryInsertRecord(story)

    // common post properties
    expect(insertQuery.id).toBe(story.id.value)

    // story properties
    expect(insertQuery.body).toBe(story.body.value)
  })

  it('converts story to update query', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const updateQuery = storyMapper.toStoryUpdateRecord(story)

    // common post properties
    expect(updateQuery.id).toBe(story.id.value)

    // story properties
    expect(updateQuery.body).toBe(story.body.value)
  })

  it('converts story database record to domain entity', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const story = storyMapper.toDomainEntity(storyRecord)

    // common post properties
    expect(story.id.value).toBe(storyRecord.id)
    expect(story.title.value).toBe(storyRecord.title)

    expect(story.visibility.value).toBe(storyRecord.visibility)
    expect(story.coverImageId?.value).toBe(storyRecord.coverImageId)
    expect(story.createdById.value).toBe(storyRecord.createdById)
    expect(story.createdAt.value).toBe(storyRecord.createdAt)
    expect(story.updatedAt?.value).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.body.value).toBe(storyRecord.body)
  })

  it('converts story database record without coverImageId to domain entity with NOT_SET', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const recordWithoutCover = { ...storyRecord, coverImageId: null }
    const story = storyMapper.toDomainEntity(recordWithoutCover)

    expect(story.coverImageId).toBe(CoverImageId.NOT_SET)
  })

  it('converts story read database record to read model DTO', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyReadDatabaseRecord()
    const story = storyMapper.toDTO(storyRecord)

    // common post properties
    expect(story.id).toBe(storyRecord.id)
    expect(story.title).toBe(storyRecord.title)
    expect(story.visibility).toBe(storyRecord.visibility)
    expect(story.createdByName).toBe(storyRecord.createdByName)
    expect(story.coverImageId).toBe(storyRecord.coverImageId)
    expect(story.createdById).toBe(storyRecord.createdById)
    expect(story.createdAt).toBe(storyRecord.createdAt)
    expect(story.updatedAt).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.body).toBe(storyRecord.body)

    // linking table data
    expect(story.tagIds).toEqual(storyRecord.tagIds)
    expect(story.commentIds).toEqual(storyRecord.commentIds)
  })

  it('converts story read database record with null updatedAt to DTO using createdAt as fallback', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyReadDatabaseRecord()
    const recordWithNullUpdatedAt = {
      ...storyRecord,
      updatedAt: undefined
    } as unknown as StoryReadDatabaseSchema
    const story = storyMapper.toDTO(recordWithNullUpdatedAt)

    expect(story.updatedAt).toBe(storyRecord.createdAt)
  })

  it('converts story read database record with null coverImageId to DTO', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyReadDatabaseRecord()
    const recordWithNullCover = { ...storyRecord, coverImageId: null }
    const story = storyMapper.toDTO(recordWithNullCover)

    expect(story.coverImageId).toBeNull()
  })

  it('converts story with cover image to image link row', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const imageLinkRow = storyMapper.toImageLinkRow(story)

    expect(imageLinkRow).not.toBeNull()
    expect(imageLinkRow?.postId).toBe(story.id.value)
    expect(imageLinkRow?.role).toBe(ImageRoleEnum.Cover)
    expect(imageLinkRow?.imageId).toBe(story.coverImageId?.value)
  })

  it('returns null when story has no cover image (CoverImageId.NOT_SET)', ({ unitFixture }) => {
    const story = unitFixture.storyMock({ coverImageId: CoverImageId.NOT_SET })
    const imageLinkRow = storyMapper.toImageLinkRow(story)

    expect(imageLinkRow).toBeNull()
  })
})
