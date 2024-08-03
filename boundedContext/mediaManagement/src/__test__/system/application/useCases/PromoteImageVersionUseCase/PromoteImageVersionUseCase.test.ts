import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum, uuid } from '@hatsuportal/common'
import { NotFoundError } from '@hatsuportal/platform'
import { ImageId } from '../../../../../domain'
import { base64ImageStringMock, sampleUserId } from '../../../../testFactory'
import { systemWiring } from '../../../../setup.system'

describe('PromoteImageVersionUseCase (system)', () => {
  it('promotes a staged version to current', async () => {
    const ownerEntityId = uuid()
    let imageId = ''
    let stagedVersionId = ''

    await systemWiring.createCreateStagedImageVersionUseCase().execute({
      createdById: sampleUserId,
      createImageInput: {
        ownerEntityType: EntityTypeEnum.Story,
        ownerEntityId,
        role: ImageRoleEnum.Cover,
        mimeType: 'image/png',
        size: 100,
        base64: base64ImageStringMock()
      },
      imageCreated: (createdImageId: string, createdStagedVersionId: string) => {
        imageId = createdImageId
        stagedVersionId = createdStagedVersionId
      }
    })

    await systemWiring.createPromoteImageVersionUseCase().execute({
      promotedById: sampleUserId,
      imageId,
      stagedVersionId,
      imagePromoted: (image) => {
        expect(image.isCurrent).toBe(true)
        expect(image.isStaged).toBe(false)
      }
    })

    const promoted = await systemWiring.imageRepository.findById(new ImageId(imageId))
    expect(promoted?.versionId).toBe(stagedVersionId)
    expect(promoted?.isCurrent).toBe(true)
    expect(promoted?.isStaged).toBe(false)
  })

  it('throws NotFoundError when staged version does not exist', async () => {
    const imageId = uuid()
    const stagedVersionId = uuid()

    await expect(
      systemWiring.createPromoteImageVersionUseCase().execute({
        promotedById: sampleUserId,
        imageId,
        stagedVersionId,
        imagePromoted: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })
})
