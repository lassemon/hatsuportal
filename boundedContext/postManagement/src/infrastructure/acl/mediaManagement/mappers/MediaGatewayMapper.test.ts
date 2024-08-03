import { describe, expect, it } from 'vitest'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { MediaGatewayMapper } from './MediaGatewayMapper'
import * as Fixture from '../../../../__test__/testFactory'

describe('MediaGatewayMapper', () => {
  const mapper = new MediaGatewayMapper()

  it('maps image contract to attachment read model DTO', () => {
    const contract: mediaV1.ImageContract = {
      id: Fixture.sampleImageId,
      kind: mediaV1.MediaKindContract.Image,
      storageKey: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdById: Fixture.sampleUserId,
      createdAt: Fixture.imageAttacmentMock().createdAt,
      updatedAt: Fixture.imageAttacmentMock().updatedAt
    }

    expect(mapper.toAttachmentReadModelDTO(contract)).toEqual({
      id: Fixture.sampleImageId,
      storageKey: 'filename.png',
      mimeType: 'image/png',
      size: 1537565,
      base64: 'data:image/png;base64,iVBORw0KGgo',
      createdById: Fixture.sampleUserId,
      createdAt: Fixture.imageAttacmentMock().createdAt,
      updatedAt: Fixture.imageAttacmentMock().updatedAt
    })
  })
})
