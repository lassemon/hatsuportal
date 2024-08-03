import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import * as Fixture from '../../../__test__/testFactory'
import { StoryCoverImageCleanupService } from './StoryCoverImageCleanupService'

describe('StoryCoverImageCleanupService', () => {
  const setup = () => {
    const storyReadRepository = Fixture.storyReadRepositoryMock()
    const mediaGateway = Fixture.mediaGatewayMock()
    const service = new StoryCoverImageCleanupService(storyReadRepository, mediaGateway)
    return { storyReadRepository, mediaGateway, service }
  }

  it('deletes the image when no stories still reference it', async () => {
    const { storyReadRepository, mediaGateway, service } = setup()
    storyReadRepository.findByImageId.mockResolvedValue([])

    await service.deleteCoverImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)

    expect(mediaGateway.deleteImage).toHaveBeenCalledWith({
      deletedById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId
    })
  })

  it('skips delete when other stories still reference the image', async () => {
    const { storyReadRepository, mediaGateway, service } = setup()
    storyReadRepository.findByImageId.mockResolvedValue([Fixture.storyReadModelDTOMock()])

    await service.deleteCoverImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)

    expect(mediaGateway.deleteImage).not.toHaveBeenCalled()
  })

  it('treats NotFoundError from delete as idempotent success', async () => {
    const { storyReadRepository, mediaGateway, service } = setup()
    storyReadRepository.findByImageId.mockResolvedValue([])
    mediaGateway.deleteImage.mockRejectedValue(new NotFoundError('Image not found'))

    await expect(
      service.deleteCoverImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)
    ).resolves.toBeUndefined()
  })

  it('propagates unexpected delete failures', async () => {
    const { storyReadRepository, mediaGateway, service } = setup()
    storyReadRepository.findByImageId.mockResolvedValue([])
    mediaGateway.deleteImage.mockRejectedValue(new Error('storage failed'))

    await expect(
      service.deleteCoverImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)
    ).rejects.toThrow('storage failed')
  })
})
