import { describe, expect, it } from 'vitest'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { MediaQueryMapper } from './MediaQueryMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('MediaQueryMapper', () => {
  const mapper = new MediaQueryMapper()

  it('maps image domain entity to contract', () => {
    const contract = mapper.toImageContract(Fixture.imageMock())

    expect(contract).toStrictEqual({
      id: Fixture.sampleImageId,
      kind: mediaV1.MediaKindContract.Image,
      storageKey: Fixture.sampleImageStorageKey,
      mimeType: 'image/png',
      size: Fixture.imageDTOMock().size,
      base64: Fixture.imageDTOMock().base64,
      createdById: Fixture.sampleUserId,
      createdAt: Fixture.imageDTOMock().createdAt,
      updatedAt: Fixture.imageDTOMock().updatedAt
    })
  })
})
