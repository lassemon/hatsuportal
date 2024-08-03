import { describe, expect, it } from 'vitest'
import { PostInfrastructureMapper } from './PostInfrastructureMapper'
import { EntityTypeEnum } from '@hatsuportal/common'

describe('PostInfrastructureMapper', () => {
  const mapper = new PostInfrastructureMapper()

  it('converts post to insert record', ({ unitFixture }) => {
    const story = unitFixture.storyMock()

    const record = mapper.toPostInsertRecord(story, EntityTypeEnum.Story)

    expect(record.id).toBe(story.id.value)
    expect(record.postType).toBe(EntityTypeEnum.Story)
    expect(record.createdById).toBe(story.createdById.value)
    expect(typeof record.createdAt).toBe('number')
    expect(typeof record.updatedAt).toBe('number')
    expect(record.createdAt).toBe(record.updatedAt)
    expect(record.createdAt).not.toBe(story.createdAt.value)
  })

  it('converts post to update record', ({ unitFixture }) => {
    const story = unitFixture.storyMock()

    const record = mapper.toPostUpdateRecord(story, EntityTypeEnum.Story)

    expect(record.id).toBe(story.id.value)
    expect(record.postType).toBe(EntityTypeEnum.Story)
    expect(typeof record.updatedAt).toBe('number')
    expect((record as any).createdById).toBeUndefined() // should not be able to update
    expect((record as any).createdAt).toBeUndefined() // should not be able to update

    expect(record.updatedAt).not.toBe(story.updatedAt?.value) // mapper should set new updated at timestamp
    expect(record.updatedAt).not.toBeNull()
  })
})
