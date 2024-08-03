import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum, uuid } from '@hatsuportal/common'
import { NotFoundError } from '@hatsuportal/platform'
import { CurrentImage, ImageCreatorId, ImageId, ImageStorageKey, ImageVersionId } from '../../../../../domain'
import { systemWiring } from '../../../../setup.system'

describe('DeleteImageUseCase (system)', () => {
  it('deletes persisted image metadata and storage file', async ({ unitFixture }) => {
    const imageId = uuid()
    const versionId = uuid()
    const current = CurrentImage.fromImageEnsuringCurrentVersion(
      unitFixture.imageMock(
        {
          id: new ImageId(imageId),
          currentVersionId: new ImageVersionId(versionId),
          createdById: new ImageCreatorId(unitFixture.sampleUserId)
        },
        {
          id: new ImageVersionId(versionId),
          imageId: new ImageId(imageId),
          isCurrent: true,
          isStaged: false,
          storageKey: ImageStorageKey.fromString(
            `${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${imageId}_${versionId}_${unitFixture.sampleUserId}.png`
          )
        }
      )
    )

    await systemWiring.persistenceHarness.createUnitOfWork().execute(async () => {
      await systemWiring.imageRepository.insertCurrent(current)
      return [null]
    })
    await systemWiring.imageStorageService.seed(current.storageKey.value, current.base64.value)

    let deletedId = ''
    await systemWiring.createDeleteImageUseCase().execute({
      deletedById: unitFixture.sampleUserId,
      deleteImageInput: { imageId },
      imageDeleted: (deleted) => {
        deletedId = deleted.id
      }
    })

    expect(deletedId).toBe(imageId)
    systemWiring.clearRepositoryCache()
    expect(await systemWiring.imageRepository.findById(new ImageId(imageId))).toBeNull()

    const storageKeys = await systemWiring.imageStorageService.listAllStorageKeys()
    expect(storageKeys.some((entry: { key: string }) => entry.key.includes(imageId))).toBe(false)
  })

  it('throws NotFoundError when image id is unknown', async ({ unitFixture }) => {
    const unknownImageId = uuid()

    await expect(
      systemWiring.createDeleteImageUseCase().execute({
        deletedById: unitFixture.sampleUserId,
        deleteImageInput: { imageId: unknownImageId },
        imageDeleted: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)

    systemWiring.clearRepositoryCache()
    expect(await systemWiring.imageRepository.findById(new ImageId(unknownImageId))).toBeNull()
  })
})
