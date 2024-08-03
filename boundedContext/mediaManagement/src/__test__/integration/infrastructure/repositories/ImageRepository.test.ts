import { beforeAll, describe, expect, it } from 'vitest'
import { EntityTypeEnum, ImageRoleEnum, uuid } from '@hatsuportal/common'
import { ImageApplicationMapper } from '../../../../application/mappers/ImageApplicationMapper'
import { ImageRepository } from '../../../../infrastructure/repositories/ImageRepository'
import { ImageInfrastructureMapper } from '../../../../infrastructure/mappers/ImageInfrastructureMapper'
import { CurrentImage, ImageCreatorId, ImageId, ImageStorageKey, ImageVersionId, StagedImage } from '../../../../domain'
import { persistenceHarness } from '../../../setup.db'

describe('ImageRepository (integration)', () => {
  let repository: ImageRepository
  const imageMapper = new ImageApplicationMapper()

  beforeAll(() => {
    repository = new ImageRepository(
      persistenceHarness.dataAccessProvider,
      persistenceHarness.repositoryHelpers,
      persistenceHarness.transactionContext,
      new ImageInfrastructureMapper()
    )
  })

  function buildCurrentImage(
    unitFixture: { imageMock: typeof import('../../../testFactory').imageMock; sampleUserId: string },
    imageId = uuid(),
    versionId = uuid()
  ): CurrentImage {
    return CurrentImage.fromImageEnsuringCurrentVersion(
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
          storageKey: ImageStorageKey.fromString(`current_${imageId}_${versionId}.png`)
        }
      )
    )
  }

  function buildStagedImage(
    unitFixture: { imageMock: typeof import('../../../testFactory').imageMock; sampleUserId: string },
    imageId: string,
    versionId = uuid()
  ): StagedImage {
    return StagedImage.fromImageEnsuringStagedVersion(
      unitFixture.imageMock(
        {
          id: new ImageId(imageId),
          currentVersionId: ImageVersionId.NOT_SET,
          versions: [],
          createdById: new ImageCreatorId(unitFixture.sampleUserId)
        },
        {
          id: new ImageVersionId(versionId),
          imageId: new ImageId(imageId),
          isCurrent: false,
          isStaged: true,
          storageKey: ImageStorageKey.fromString(
            `staged_${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${imageId}_${versionId}_${unitFixture.sampleUserId}.png`
          )
        }
      ),
      new ImageVersionId(versionId)
    )
  }

  async function insertCurrent(
    unitFixture: { imageMock: typeof import('../../../testFactory').imageMock; sampleUserId: string },
    imageId = uuid(),
    versionId = uuid()
  ) {
    const current = buildCurrentImage(unitFixture, imageId, versionId)
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertCurrent(current)
      return [null]
    })
    return current
  }

  it('inserts a current image and loads it with findByIdAndVersionIdForUpdate inside a unit of work', async ({ unitFixture }) => {
    const imageId = uuid()
    const versionId = uuid()
    const current = buildCurrentImage(unitFixture, imageId, versionId)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertCurrent(current)
      const loaded = await repository.findByIdAndVersionIdForUpdate(current.id, current.currentVersionId)
      expect(loaded?.storageKey).toBe(current.storageKey.value)
      return [null]
    })
  })

  it('insertStaged creates image metadata and returns staged version identifier', async ({ unitFixture }) => {
    const imageId = uuid()
    const staged = buildStagedImage(unitFixture, imageId)

    let identifier: Awaited<ReturnType<typeof repository.insertStaged>> | undefined
    await persistenceHarness.createUnitOfWork().execute(async () => {
      identifier = await repository.insertStaged(staged)
      return [null]
    })

    expect(identifier?.imageId.value).toBe(imageId)
    expect(identifier?.stagedVersionId.value).toBe(staged.id.value)

    const byVersion = await repository.findByIdAndVersionId(new ImageId(imageId), staged.id)
    expect(byVersion?.isStaged).toBe(true)
    expect(await repository.findById(new ImageId(imageId))).toBeNull()
  })

  it('findById returns current image metadata and null for unknown id', async ({ unitFixture }) => {
    const current = await insertCurrent(unitFixture)

    const found = await repository.findById(current.id)
    const missing = await repository.findById(new ImageId('00000000-0000-4000-8000-000000000099'))

    expect(found?.id).toBe(current.id.value)
    expect(found?.isCurrent).toBe(true)
    expect(missing).toBeNull()
  })

  it('findByIdAndVersionId returns version metadata for staged and current versions', async ({ unitFixture }) => {
    const imageId = uuid()
    const currentVersionId = uuid()
    const stagedVersionId = uuid()

    await insertCurrent(unitFixture, imageId, currentVersionId)
    const staged = buildStagedImage(unitFixture, imageId, stagedVersionId)
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertStaged(staged)
      return [null]
    })

    const current = await repository.findByIdAndVersionId(new ImageId(imageId), new ImageVersionId(currentVersionId))
    const stagedLoaded = await repository.findByIdAndVersionId(new ImageId(imageId), new ImageVersionId(stagedVersionId))

    expect(current?.isCurrent).toBe(true)
    expect(stagedLoaded?.isStaged).toBe(true)
  })

  it('savePromotedImage swaps staged version to current', async ({ unitFixture }) => {
    const imageId = uuid()
    const currentVersionId = uuid()
    const stagedVersionId = uuid()
    const permanentKey = ImageStorageKey.fromString(
      `${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${imageId}_${stagedVersionId}_${unitFixture.sampleUserId}.png`
    )

    await insertCurrent(unitFixture, imageId, currentVersionId)
    const staged = buildStagedImage(unitFixture, imageId, stagedVersionId)
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertStaged(staged)
      return [null]
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const lock = await repository.findPromotionLockForUpdate(new ImageId(imageId), new ImageVersionId(stagedVersionId))
      expect(lock).not.toBeNull()

      const image = imageMapper.toImageForPromotion(lock!)
      image.promoteToCurrent(new ImageVersionId(stagedVersionId), permanentKey)
      await repository.savePromotedImage(image)
      return [null]
    })

    const promoted = await repository.findById(new ImageId(imageId))
    expect(promoted?.versionId).toBe(stagedVersionId)
    expect(promoted?.isCurrent).toBe(true)
    expect(promoted?.isStaged).toBe(false)
    expect(promoted?.storageKey).toBe(permanentKey.value)
  })

  it('findPromotionLockForUpdate reflects concurrent promotion within the same transaction', async ({ unitFixture }) => {
    const imageId = uuid()
    const currentVersionId = uuid()
    const stagedVersionId = uuid()

    await insertCurrent(unitFixture, imageId, currentVersionId)
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertStaged(buildStagedImage(unitFixture, imageId, stagedVersionId))
      return [null]
    })

    await persistenceHarness.createUnitOfWork().execute(async () => {
      const lock = await repository.findPromotionLockForUpdate(new ImageId(imageId), new ImageVersionId(stagedVersionId))
      expect(lock?.staged.isStaged).toBe(true)

      const scope = persistenceHarness.transactionContext.getScope()
      if (!scope) throw new Error('expected active transaction scope')

      await scope.transaction.table('image_versions').where({ imageId, id: currentVersionId }).update({ isCurrent: false })
      await scope.transaction.table('image_versions').where({ imageId, id: stagedVersionId }).update({ isStaged: false, isCurrent: true })
      await scope.transaction.table('images').where({ id: imageId }).update({ currentVersionId: stagedVersionId })

      const lockAfterPromotion = await repository.findPromotionLockForUpdate(new ImageId(imageId), new ImageVersionId(stagedVersionId))
      expect(lockAfterPromotion?.staged.isCurrent).toBe(true)
      expect(lockAfterPromotion?.staged.isStaged).toBe(false)
      return [null]
    })
  })

  it('delete removes image rows and returns storage keys', async ({ unitFixture }) => {
    const current = await insertCurrent(unitFixture)
    const image = unitFixture.imageMock(
      { id: current.id, currentVersionId: current.currentVersionId },
      {
        id: current.currentVersionId,
        imageId: current.id,
        storageKey: current.storageKey,
        isCurrent: true,
        isStaged: false
      }
    )

    let storageKeys: string[] = []
    await persistenceHarness.createUnitOfWork().execute(async () => {
      storageKeys = await repository.delete(image)
      return [null]
    })

    expect(storageKeys).toContain(current.storageKey.value)
    expect(await repository.findById(current.id)).toBeNull()
  })

  it('rollbackCurrentVersion removes the image and its versions', async ({ unitFixture }) => {
    const current = await insertCurrent(unitFixture)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.rollbackCurrentVersion(current)
      return [null]
    })

    expect(await repository.findById(current.id)).toBeNull()
  })

  it('pruneOldVersions deletes retired non-staged versions beyond retain count', async ({ unitFixture }) => {
    const imageId = uuid()
    const currentVersionId = uuid()
    const retiredVersionIds = [uuid(), uuid(), uuid(), uuid()]

    await insertCurrent(unitFixture, imageId, currentVersionId)

    await persistenceHarness.createUnitOfWork().execute(async () => {
      for (const retiredId of retiredVersionIds) {
        await persistenceHarness.dataAccessProvider.table('image_versions').insert({
          id: retiredId,
          imageId,
          storageKey: `retired_${retiredId}.png`,
          mimeType: 'image/png',
          size: 100,
          isCurrent: false,
          isStaged: false,
          createdAt: Date.now()
        })
      }
      return [null]
    })

    let prunedKeys: string[] = []
    await persistenceHarness.createUnitOfWork().execute(async () => {
      prunedKeys = await repository.pruneOldVersions(imageId, 2)
      return [null]
    })

    expect(prunedKeys).toHaveLength(2)
    const remaining = await persistenceHarness.dataAccessProvider
      .table('image_versions')
      .where({ imageId, isCurrent: false, isStaged: false })
    expect(remaining).toHaveLength(2)
  })

  it('findAllStorageKeys, findStagedStorageKeys and findAllCleanupCandidates return expected rows', async ({ unitFixture }) => {
    const imageId = uuid()
    const currentVersionId = uuid()
    const stagedVersionId = uuid()
    const current = await insertCurrent(unitFixture, imageId, currentVersionId)
    await persistenceHarness.createUnitOfWork().execute(async () => {
      await repository.insertStaged(buildStagedImage(unitFixture, imageId, stagedVersionId))
      return [null]
    })

    const allKeys = await repository.findAllStorageKeys()
    const stagedKeys = await repository.findStagedStorageKeys(new ImageId(imageId))
    const cleanupCandidates = await repository.findAllCleanupCandidates()

    expect(allKeys).toEqual(expect.arrayContaining([current.storageKey.value]))
    expect(stagedKeys).toHaveLength(1)
    expect(cleanupCandidates.some((candidate) => candidate.id === imageId)).toBe(true)
  })
})
