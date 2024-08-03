import { EntityTypeEnum, ImageRoleEnum, uuid } from '@hatsuportal/common'
import { vol } from 'memfs'
import {
  CurrentImage,
  IImageStorageService,
  ImageCreatorId,
  ImageId,
  ImageInfrastructureMapper,
  ImageRepository,
  ImageStorageKey,
  ImageVersionId
} from '@hatsuportal/media-management'
import { NonEmptyString } from '@hatsuportal/shared-kernel'
import config from '../../../config'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { base64ImageBufferMock } from '../../testFactory'

const imagesBasePath = `./${config.images.basePath.replace(/^\.\//, '').replace(/\/$/, '')}`

export function createImageRepository(persistenceHarness: PersistenceHarness): ImageRepository {
  return new ImageRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new ImageInfrastructureMapper()
  )
}

export type SeedImageFixtureOptions = {
  createdById?: string
  imageStorageService?: IImageStorageService
}

export async function seedImageFixture(
  persistenceHarness: PersistenceHarness,
  unitFixture: { imageMock: typeof import('../../testFactory').imageMock; sampleUserId: string },
  options: SeedImageFixtureOptions = {}
): Promise<{ imageId: string; versionId: string; imageRepository: ImageRepository }> {
  const createdById = options.createdById ?? unitFixture.sampleUserId
  const imageId = uuid()
  const versionId = uuid()
  const storageKey = ImageStorageKey.fromString(
    `${EntityTypeEnum.Story}_${ImageRoleEnum.Cover}_${imageId}_${versionId}_${createdById}.png`
  )
  const image = unitFixture.imageMock(
    {
      id: new ImageId(imageId),
      currentVersionId: new ImageVersionId(versionId),
      createdById: new ImageCreatorId(createdById)
    },
    {
      id: new ImageVersionId(versionId),
      imageId: new ImageId(imageId),
      isCurrent: true,
      isStaged: false,
      storageKey
    }
  )
  const current = CurrentImage.fromImageEnsuringCurrentVersion(image)
  const imageRepository = createImageRepository(persistenceHarness)

  await persistenceHarness.createUnitOfWork().execute(async () => {
    await imageRepository.insertCurrent(current)
    return [null]
  })

  if (options.imageStorageService) {
    vol.mkdirSync(imagesBasePath, { recursive: true })
    await options.imageStorageService.storeImageBuffer(base64ImageBufferMock(), new NonEmptyString(storageKey.value))
  }

  return { imageId, versionId, imageRepository }
}
