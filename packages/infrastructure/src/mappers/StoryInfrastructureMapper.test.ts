import { describe, expect, it } from 'vitest'
import { StoryInfrastructureMapper } from './StoryInfrastructureMapper'
import { Story } from '@hatsuportal/domain'

describe('StoryInfrastructureMapper', () => {
  const storyMapper = new StoryInfrastructureMapper()

  it('converts story to insert query', ({ unitFixture }) => {
    const dto = unitFixture.storyDTO()
    const story = new Story(dto)
    story.imageId = unitFixture.imageDTO().id
    const insertQuery = storyMapper.toInsertQuery(story)

    // common post properties
    expect(insertQuery.id).toBe(dto.id)
    expect(insertQuery.visibility).toBe(dto.visibility)
    expect(insertQuery.createdBy).toBe(dto.createdBy)
    expect(insertQuery.createdByUserName).toBe(dto.createdByUserName)
    expect(insertQuery.createdAt).not.toBe(dto.createdAt)
    expect(insertQuery.updatedAt).toBeNull()

    // story properties
    expect(insertQuery.imageId).toBe(unitFixture.imageDTO().id)
    expect(insertQuery.name).toBe(dto.name)
    expect(insertQuery.description).toBe(dto.description)
  })

  it('converts story to update query', ({ unitFixture }) => {
    const dto = unitFixture.storyDTO()
    const story = new Story(dto)
    const updateQuery = storyMapper.toUpdateQuery(story)

    // common post properties
    expect(updateQuery.id).toBe(dto.id)
    expect(updateQuery.visibility).toBe(dto.visibility)
    expect((updateQuery as any).createdBy).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdByUserName).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(dto.updatedAt) // mapper should set new updated at timestamp
    expect(updateQuery.updatedAt).not.toBeNull()

    // story properties
    expect(updateQuery.imageId).toBe(dto.imageId)
    expect(updateQuery.name).toBe(dto.name)
    expect(updateQuery.description).toBe(dto.description)
  })

  it('converts story database record to dto', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const dto = storyMapper.toDTO(storyRecord)

    // common post properties
    expect(dto.id).toBe(storyRecord.id)
    expect(dto.visibility).toBe(storyRecord.visibility)
    expect(dto.createdBy).toBe(storyRecord.createdBy)
    expect(dto.createdByUserName).toBe(storyRecord.createdByUserName)
    expect(dto.createdAt).toBe(storyRecord.createdAt)
    expect(dto.updatedAt).toBe(storyRecord.updatedAt)

    // story properties
    expect(dto.imageId).toBe(storyRecord.imageId)
    expect(dto.name).toBe(storyRecord.name)
    expect(dto.description).toBe(storyRecord.description)
  })

  it('converts story database record to domain entity', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const story = storyMapper.toDomainEntity(storyRecord)

    // common post properties
    expect(story.id.value).toBe(storyRecord.id)
    expect(story.visibility.value).toBe(storyRecord.visibility)
    expect(story.createdBy.value).toBe(storyRecord.createdBy)
    expect(story.createdByUserName.value).toBe(storyRecord.createdByUserName)
    expect(story.createdAt.value).toBe(storyRecord.createdAt)
    expect(story.updatedAt?.value).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.imageId?.value).toBe(storyRecord.imageId)
    expect(story.name).toBe(storyRecord.name)
    expect(story.description).toBe(storyRecord.description)
  })
})
