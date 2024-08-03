import { describe, expect, it } from 'vitest'
import { StoryInfrastructureMapper } from './StoryInfrastructureMapper'
import { Story } from '../../domain'
import { ImageApplicationMapper } from '@hatsuportal/common-bounded-context'
import { Image } from '@hatsuportal/common-bounded-context'

describe('StoryInfrastructureMapper', () => {
  const storyMapper = new StoryInfrastructureMapper(new ImageApplicationMapper())

  it('converts story to insert query', ({ unitFixture }) => {
    const dto = unitFixture.storyDTOMock()
    const story = Story.create(dto)
    story.update({ image: unitFixture.imageDTOMock() })
    const insertQuery = storyMapper.toInsertQuery(story)

    // common post properties
    expect(insertQuery.id).toBe(dto.id)
    expect(insertQuery.visibility).toBe(dto.visibility)
    expect(insertQuery.createdById).toBe(dto.createdById)
    expect((insertQuery as any).createdByName).toBeUndefined() // should not be able to update
    expect(insertQuery.createdAt).not.toBe(dto.createdAt)
    expect(insertQuery.updatedAt).toBe(insertQuery.createdAt) // newly created story should have same created and updated at timestamp

    // story properties
    expect(insertQuery.imageId).toBe(unitFixture.imageDTOMock().id)
    expect(insertQuery.name).toBe(dto.name)
    expect(insertQuery.description).toBe(dto.description)
  })

  it('converts story to update query', ({ unitFixture }) => {
    const dto = unitFixture.storyDTOMock()
    const story = Story.create(dto)
    const updateQuery = storyMapper.toUpdateQuery(story)

    // common post properties
    expect(updateQuery.id).toBe(dto.id)
    expect(updateQuery.visibility).toBe(dto.visibility)
    expect((updateQuery as any).createdById).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdByName).toBeUndefined() // should not be able to update
    expect((updateQuery as any).createdAt).toBeUndefined() // should not be able to update
    expect(updateQuery.updatedAt).not.toBe(dto.updatedAt) // mapper should set new updated at timestamp
    expect(updateQuery.updatedAt).not.toBeNull()

    // story properties
    expect(updateQuery.imageId).toBe(dto.image?.id)
    expect(updateQuery.name).toBe(dto.name)
    expect(updateQuery.description).toBe(dto.description)
  })

  it('converts story database record to dto', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const dto = storyMapper.toDTO(storyRecord, Image.create(unitFixture.imageDTOMock()))

    // common post properties
    expect(dto.id).toBe(storyRecord.id)
    expect(dto.visibility).toBe(storyRecord.visibility)
    expect(dto.createdById).toBe(storyRecord.createdById)
    expect(dto.createdByName).toBe(storyRecord.createdByName)
    expect(dto.createdAt).toBe(storyRecord.createdAt)
    expect(dto.updatedAt).toBe(storyRecord.updatedAt)

    // story properties
    expect(dto.image?.id).toBe(storyRecord.imageId)
    expect(dto.name).toBe(storyRecord.name)
    expect(dto.description).toBe(storyRecord.description)
  })

  it('converts story database record to domain entity', ({ unitFixture }) => {
    const storyRecord = unitFixture.storyDatabaseRecord()
    const story = storyMapper.toDomainEntity(storyRecord, Image.create(unitFixture.imageDTOMock()))

    // common post properties
    expect(story.id.value).toBe(storyRecord.id)
    expect(story.visibility.value).toBe(storyRecord.visibility)
    expect(story.createdById.value).toBe(storyRecord.createdById)
    expect(story.createdByName.value).toBe(storyRecord.createdByName)
    expect(story.createdAt.value).toBe(storyRecord.createdAt)
    expect(story.updatedAt?.value).toBe(storyRecord.updatedAt)

    // story properties
    expect(story.image?.id.value).toBe(storyRecord.imageId)
    expect(story.name.value).toBe(storyRecord.name)
    expect(story.description.value).toBe(storyRecord.description)
  })
})
