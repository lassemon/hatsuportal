import { describe, expect, it } from 'vitest'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { ImageId, ImageVersionId } from '../../../domain'
import { ImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { ImageLookupService } from './ImageLookupService'
import * as Fixture from '../../../__test__/testFactory'

describe('ImageLookupService', () => {
  const setup = () => {
    const imageRepository = Fixture.imageRepositoryMock()
    const imageStorageService = Fixture.imageStorageServiceMock()
    const imageApplicationMapper = new ImageApplicationMapper()
    const service = new ImageLookupService(imageRepository, imageStorageService, imageApplicationMapper)
    return { imageRepository, imageStorageService, service }
  }

  it('returns null when image metadata is missing', async () => {
    const { imageRepository, service } = setup()
    imageRepository.findById.mockResolvedValue(null)

    await expect(service.findById(new ImageId(Fixture.sampleImageId))).resolves.toBeNull()
  })

  it('hydrates base64 and maps to domain on findById', async () => {
    const { imageRepository, imageStorageService, service } = setup()
    imageRepository.findById.mockResolvedValue(Fixture.imageMetadataDTO())
    imageStorageService.getImage.mockResolvedValue(Fixture.base64ImageStringMock())

    const image = await service.findById(new ImageId(Fixture.sampleImageId))

    expect(image?.id.value).toBe(Fixture.sampleImageId)
    expect(imageStorageService.getImage).toHaveBeenCalledWith(new NonEmptyString(Fixture.sampleImageStorageKey))
  })

  it('returns null when version metadata is missing', async () => {
    const { imageRepository, service } = setup()
    imageRepository.findByIdAndVersionId.mockResolvedValue(null)

    await expect(
      service.findByIdAndVersionId(new ImageId(Fixture.sampleImageId), new ImageVersionId(Fixture.sampleImageVersionId))
    ).resolves.toBeNull()
  })

  it('hydrates cover-replace staged row with mismatched pointer via real mapper path', async ({ unitFixture }) => {
    const { imageRepository, imageStorageService, service } = setup()
    const coverReplaceMetadata = {
      ...unitFixture.imageMetadataDTO(),
      versionId: unitFixture.sampleImageVersionId,
      currentVersionPointer: unitFixture.sampleCurrentVersionId,
      isStaged: true,
      isCurrent: false,
      storageKey: unitFixture.sampleStagedImageStorageKeyWithVersionId
    }
    imageRepository.findByIdAndVersionId.mockResolvedValue(coverReplaceMetadata)
    imageStorageService.getImage.mockResolvedValue(unitFixture.base64ImageStringMock())

    const stagedVersionId = new ImageVersionId(unitFixture.sampleImageVersionId)
    const image = await service.findByIdAndVersionId(new ImageId(unitFixture.sampleImageId), stagedVersionId)

    expect(image).not.toBeNull()
    expect(() => image!.getStagedVersionOrThrow(stagedVersionId)).not.toThrow()
    expect(image!.currentVersionId.equals(ImageVersionId.NOT_SET)).toBe(true)
  })
})
