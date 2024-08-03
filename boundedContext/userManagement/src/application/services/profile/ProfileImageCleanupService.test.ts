import { describe, expect, it } from 'vitest'
import { NotFoundError } from '@hatsuportal/platform'
import * as Fixture from '../../../__test__/testFactory'
import { ProfileImageCleanupService } from './ProfileImageCleanupService'

describe('ProfileImageCleanupService', () => {
  const setup = () => {
    const userReadRepository = Fixture.userReadRepositoryMock()
    const mediaGateway = Fixture.mediaGatewayMock()
    const service = new ProfileImageCleanupService(userReadRepository, mediaGateway)
    return { userReadRepository, mediaGateway, service }
  }

  it('deletes the image when no users still reference it', async () => {
    const { userReadRepository, mediaGateway, service } = setup()
    userReadRepository.findByProfileImageId.mockResolvedValue([])

    await service.deleteProfileImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)

    expect(mediaGateway.deleteImage).toHaveBeenCalledWith({
      deletedById: Fixture.sampleUserId,
      imageId: Fixture.sampleImageId
    })
  })

  it('skips delete when other users still reference the image', async () => {
    const { userReadRepository, mediaGateway, service } = setup()
    userReadRepository.findByProfileImageId.mockResolvedValue([Fixture.userReadModelDTOMock()])

    await service.deleteProfileImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)

    expect(mediaGateway.deleteImage).not.toHaveBeenCalled()
  })

  it('treats NotFoundError from delete as idempotent success', async () => {
    const { userReadRepository, mediaGateway, service } = setup()
    userReadRepository.findByProfileImageId.mockResolvedValue([])
    mediaGateway.deleteImage.mockRejectedValue(new NotFoundError('Image not found'))

    await expect(
      service.deleteProfileImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)
    ).resolves.toBeUndefined()
  })

  it('propagates unexpected delete failures', async () => {
    const { userReadRepository, mediaGateway, service } = setup()
    userReadRepository.findByProfileImageId.mockResolvedValue([])
    mediaGateway.deleteImage.mockRejectedValue(new Error('storage failed'))

    await expect(
      service.deleteProfileImageIfUnreferenced(Fixture.sampleImageId, Fixture.sampleUserId)
    ).rejects.toThrow('storage failed')
  })
})
