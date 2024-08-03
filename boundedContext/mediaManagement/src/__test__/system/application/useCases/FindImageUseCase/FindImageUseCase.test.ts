import { describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum, uuid } from '@hatsuportal/common'
import { NotFoundError } from '@hatsuportal/platform'
import { CurrentImage, ImageCreatorId, ImageId, ImageStorageKey, ImageVersionId, StagedImage } from '../../../../../domain'
import { systemWiring } from '../../../../setup.system'

const FK_STUB_USER_NAME = 'foreign-key-stub-user'

describe('FindImageUseCase (system)', () => {
  it('returns image with createdByName from FK stub user row', async ({ unitFixture }) => {
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

    let foundDto: { id: string; createdByName: string } | undefined
    await systemWiring.findImageUseCase.execute({
      imageId: current.id.value,
      imageFound: (dto) => {
        foundDto = { id: dto.id, createdByName: dto.createdByName }
      }
    })

    expect(foundDto?.id).toBe(current.id.value)
    expect(foundDto?.createdByName).toBe(FK_STUB_USER_NAME)
  })

  it('throws NotFoundError for unknown image id', async () => {
    const unknownImageId = '00000000-0000-4000-8000-000000000099'

    await expect(
      systemWiring.findImageUseCase.execute({
        imageId: unknownImageId,
        imageFound: () => undefined
      })
    ).rejects.toBeInstanceOf(NotFoundError)
  })

  it('throws NotFoundError for staged-only metadata without promoted version', async ({ unitFixture }) => {
    const imageId = uuid()
    const stagedVersionId = uuid()
    const staged = StagedImage.fromImageEnsuringStagedVersion(
      unitFixture.imageMock(
        {
          id: new ImageId(imageId),
          currentVersionId: ImageVersionId.NOT_SET,
          versions: [],
          createdById: new ImageCreatorId(unitFixture.sampleUserId)
        },
        {
          id: new ImageVersionId(stagedVersionId),
          imageId: new ImageId(imageId),
          isCurrent: false,
          isStaged: true,
          storageKey: ImageStorageKey.fromString(
            `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${imageId}_${stagedVersionId}_${unitFixture.sampleUserId}.png`
          )
        }
      ),
      new ImageVersionId(stagedVersionId)
    )

    await systemWiring.persistenceHarness.createUnitOfWork().execute(async () => {
      await systemWiring.imageRepository.insertStaged(staged)
      return [null]
    })

    let imageFoundCalled = false
    await expect(
      systemWiring.findImageUseCase.execute({
        imageId,
        imageFound: () => {
          imageFoundCalled = true
        }
      })
    ).rejects.toBeInstanceOf(NotFoundError)

    expect(imageFoundCalled).toBe(false)
  })
})
