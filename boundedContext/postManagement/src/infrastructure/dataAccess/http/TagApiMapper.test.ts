import { describe, expect, it } from 'vitest'
import { TagApiMapper } from './TagApiMapper'
import * as Fixture from '../../../__test__/testFactory'

describe('TagApiMapper', () => {
  const mapper = new TagApiMapper()

  it('maps tag dto to response', () => {
    expect(mapper.toResponse(Fixture.tagDTOMock())).toEqual({
      id: Fixture.sampleTagId,
      slug: 'test-tag',
      name: 'test tag',
      createdById: Fixture.sampleUserId,
      createdAt: Fixture.tagDTOMock().createdAt,
      updatedAt: Fixture.tagDTOMock().updatedAt
    })
  })
})
