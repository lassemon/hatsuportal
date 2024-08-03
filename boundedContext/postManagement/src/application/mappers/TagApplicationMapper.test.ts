import { describe, expect, it } from 'vitest'
import { TagApplicationMapper } from './TagApplicationMapper'
import * as Fixture from '../../__test__/testFactory'

describe('TagApplicationMapper', () => {
  const mapper = new TagApplicationMapper()

  it('maps tag entity to dto', () => {
    const tag = Fixture.tagMock()
    expect(mapper.toDTO(tag)).toEqual(Fixture.tagDTOMock())
  })
})
