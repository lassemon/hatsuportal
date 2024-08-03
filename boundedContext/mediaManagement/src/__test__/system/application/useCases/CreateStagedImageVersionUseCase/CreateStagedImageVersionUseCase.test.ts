import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum, uuid } from '@hatsuportal/common'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { ImageId, ImageVersionId } from '../../../../../domain'
import { base64ImageStringMock, sampleUserId } from '../../../../testFactory'
import { systemWiring } from '../../../../setup.system'

describe('CreateStagedImageVersionUseCase (system)', () => {
  it('stages an image and persists metadata plus storage file', async () => {
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

    expect(imageId).toBeTruthy()
    expect(stagedVersionId).toBeTruthy()

    const metadata = await systemWiring.imageRepository.findByIdAndVersionId(new ImageId(imageId), new ImageVersionId(stagedVersionId))
    expect(metadata?.isStaged).toBe(true)
    expect(metadata?.storageKey).toBeTruthy()

    const fileContents = await systemWiring.imageStorageService.getImage(new NonEmptyString(metadata!.storageKey))
    expect(fileContents.length).toBeGreaterThan(0)
  })
})
