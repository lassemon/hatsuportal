import { describe, expect, it } from 'vitest'
import { StoryInfrastructureMapper } from './StoryInfrastructureMapper'

describe('StoryInfrastructureMapper', () => {
  const storyMapper = new StoryInfrastructureMapper()

  it('converts story to insert query', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const insertQuery = storyMapper.toStoryInsertRecord(story)

    // common post properties
    expect(insertQuery.id).toBe(story.id.value)
    expect(insertQuery.visibility).toBe(story.visibility.value)

    // story properties
    expect(insertQuery.name).toBe(story.name.value)
    expect(insertQuery.description).toBe(story.description.value)
  })

  it('converts story to update query', ({ unitFixture }) => {
    const story = unitFixture.storyMock()
    const updateQuery = storyMapper.toStoryUpdateRecord(story)

    // common post properties
    expect(updateQuery.id).toBe(story.id.value)
    expect(updateQuery.visibility).toBe(story.visibility.value)

    // story properties
    expect(updateQuery.name).toBe(story.name.value)
    expect(updateQuery.description).toBe(story.description.value)
  })

  it('converts story database record to domain entity', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const story = storyMapper.toDomainEntity(storyRecord)

    // common post properties
    expect(story.id.value).toBe(storyRecord.id)
    expect(story.visibility.value).toBe(storyRecord.visibility)
    expect(story.coverImageId?.value).toBe(storyRecord.coverImageId)
    expect(story.createdById.value).toBe(storyRecord.createdById)
    expect(story.createdAt.value).toBe(storyRecord.createdAt)
    expect(story.updatedAt?.value).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.name.value).toBe(storyRecord.name)
    expect(story.description.value).toBe(storyRecord.description)
  })

  it('converts story database record to domain entity', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const story = storyMapper.toDomainEntity(storyRecord)

    // common post properties
    expect(story.id.value).toBe(storyRecord.id)
    expect(story.visibility.value).toBe(storyRecord.visibility)
    expect(story.createdById.value).toBe(storyRecord.createdById)
    expect(story.createdAt.value).toBe(storyRecord.createdAt)
    expect(story.updatedAt?.value).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.name.value).toBe(storyRecord.name)
    expect(story.description.value).toBe(storyRecord.description)
  })

  it('converts story read database record to read model DTO', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyReadDatabaseRecord()
    const story = storyMapper.toDTO(storyRecord)

    // common post properties
    expect(story.id).toBe(storyRecord.id)
    expect(story.visibility).toBe(storyRecord.visibility)
    expect(story.createdByName).toBe(storyRecord.createdByName)
    expect(story.coverImageId).toBe(storyRecord.coverImageId)
    expect(story.createdById).toBe(storyRecord.createdById)
    expect(story.createdAt).toBe(storyRecord.createdAt)
    expect(story.updatedAt).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.name).toBe(storyRecord.name)
    expect(story.description).toBe(storyRecord.description)
  })

  // TODO: Add tests for image load result with and without error

  it('converts create story input to story entity', ({ unitFixture }) => {
    // TODO: Add test for create story input to story entity
  })

  it('converts update story input to story entity', ({ unitFixture }) => {
    // TODO: Add test for update story input to story entity
  })
})
