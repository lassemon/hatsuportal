import { describe, expect, it } from 'vitest'
import { VisibilityEnum } from '@hatsuportal/common'
import { PostGatewayMapper } from './PostGatewayMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('PostGatewayMapper', () => {
  const mapper = new PostGatewayMapper()

  it('maps story contract to story read model dto', () => {
    const contract = {
      id: Fixture.sampleStoryId,
      visibility: VisibilityEnum.Public,
      title: 'title',
      body: 'body',
      coverImage: null,
      tags: [],
      createdByName: Fixture.sampleUserName,
      createdById: Fixture.sampleUserId,
      createdAt: 10,
      updatedAt: 20
    }

    expect(mapper.toStoryReadModelDTO(contract)).toStrictEqual(contract)
  })
})
