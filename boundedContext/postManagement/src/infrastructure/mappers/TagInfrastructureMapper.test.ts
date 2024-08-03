import { describe, expect, it } from 'vitest'
import { TagInfrastructureMapper } from './TagInfrastructureMapper'
import * as Fixture from '../../__test__/testFactory'

describe('TagInfrastructureMapper', () => {
  const mapper = new TagInfrastructureMapper()

  it('maps database schema to dto and domain entity', () => {
    const schema = {
      id: Fixture.sampleTagId,
      slug: 'test-tag',
      name: 'test tag',
      createdById: Fixture.sampleUserId,
      createdAt: Fixture.tagDTOMock().createdAt,
      updatedAt: Fixture.tagDTOMock().updatedAt
    }

    expect(mapper.toDTO(schema)).toEqual(Fixture.tagDTOMock())
    expect(mapper.toDomainEntity(schema).id.value).toBe(Fixture.sampleTagId)
  })

  it('maps tag entity to insert and update records', () => {
    const tag = Fixture.tagMock()
    expect(mapper.toTagInsertRecord(tag).id).toBe(Fixture.sampleTagId)
    expect(mapper.toTagUpdateRecord(tag).slug).toBe('test-tag')
  })
})
