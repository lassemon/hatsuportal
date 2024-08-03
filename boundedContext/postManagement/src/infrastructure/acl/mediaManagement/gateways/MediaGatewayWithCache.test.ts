import { describe, expect, it } from 'vitest'
import { mediaV1 } from '@hatsuportal/bounded-context-service-contracts'
import { EntityTypeEnum, ImageRoleEnum } from '@hatsuportal/common'
import { EntityLoadResult } from '@hatsuportal/platform'
import { ImageLoadError } from '../../../../application/acl/mediaManagement/errors/ImageLoadError'
import { ImageAttachmentReadModelDTO } from '../../../../application/dtos/image/ImageAttachmentReadModelDTO'
import { MapCache } from '../../../../__test__/mapCache'
import { MediaGatewayWithCache } from './MediaGatewayWithCache'
import * as Fixture from '../../../../__test__/testFactory'

describe('MediaGatewayWithCache', () => {
  const setup = () => {
    const baseGateway = Fixture.mediaGatewayMock()
    const cache = new MapCache<ImageAttachmentReadModelDTO>()
    const gateway = new MediaGatewayWithCache(baseGateway, cache)
    return { baseGateway, cache, gateway }
  }

  it('loads getImageById from base on miss and serves cache on hit', async () => {
    const { baseGateway, gateway } = setup()
    const attachment = Fixture.imageAttacmentMock()
    baseGateway.getImageById.mockResolvedValue(EntityLoadResult.success(attachment))

    await expect(gateway.getImageById({ imageId: Fixture.sampleImageId })).resolves.toEqual(EntityLoadResult.success(attachment))
    await expect(gateway.getImageById({ imageId: Fixture.sampleImageId })).resolves.toEqual(EntityLoadResult.success(attachment))
    expect(baseGateway.getImageById).toHaveBeenCalledTimes(1)
  })

  it('does not cache failed lookups', async () => {
    const { baseGateway, cache, gateway } = setup()
    const failed = EntityLoadResult.failure(
      new ImageLoadError({ imageId: Fixture.sampleImageId, error: new Error('not found') })
    )
    baseGateway.getImageById.mockResolvedValue(failed)

    await expect(gateway.getImageById({ imageId: Fixture.sampleImageId })).resolves.toEqual(failed)
    await expect(gateway.getImageById({ imageId: Fixture.sampleImageId })).resolves.toEqual(failed)
    expect(baseGateway.getImageById).toHaveBeenCalledTimes(2)
    expect(cache.has(`getImageById:${Fixture.sampleImageId}`)).toBe(false)
  })

  it('passes through createStagedImageVersion without caching', async () => {
    const { baseGateway, cache, gateway } = setup()
    const stagedResult: mediaV1.CreateStagedImageVersionResult = {
      createdById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId,
      stagedVersionId: 'staged-version-id'
    }
    baseGateway.createStagedImageVersion.mockResolvedValue(stagedResult)

    await expect(
      gateway.createStagedImageVersion({
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId: Fixture.sampleStoryId,
        role: ImageRoleEnum.Cover,
        mimeType: 'image/png',
        size: 1537565,
        base64: 'data:image/png;base64,iVBORw0KGgo',
        createdById: Fixture.sampleUserId
      })
    ).resolves.toEqual(stagedResult)
    expect(cache.store.size).toBe(0)
  })

  it('invalidates cache on promoteImageVersion', async () => {
    const { baseGateway, cache, gateway } = setup()
    cache.set(`getImageById:${Fixture.sampleImageId}`, Fixture.imageAttacmentMock())

    await gateway.promoteImageVersion({
      promotedById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId,
      stagedVersionId: 'staged-version-id'
    })

    expect(cache.has(`getImageById:${Fixture.sampleImageId}`)).toBe(false)
    expect(baseGateway.promoteImageVersion).toHaveBeenCalledTimes(1)
  })

  it('invalidates cache on deleteImage', async () => {
    const { baseGateway, cache, gateway } = setup()
    cache.set(`getImageById:${Fixture.sampleImageId}`, Fixture.imageAttacmentMock())

    await gateway.deleteImage({ deletedById: Fixture.sampleUserId, imageId: Fixture.sampleImageId })

    expect(cache.has(`getImageById:${Fixture.sampleImageId}`)).toBe(false)
    expect(baseGateway.deleteImage).toHaveBeenCalledTimes(1)
  })
})
