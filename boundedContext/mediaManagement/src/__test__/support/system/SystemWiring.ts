import { TTLCache } from '@hatsuportal/platform'
import { ImageMetadataDTO } from '../../../application/dtos/ImageMetadataDTO'
import { FindImageUseCase } from '../../../application/useCases/FindImageUseCase/FindImageUseCase'
import { CreateStagedImageVersionUseCase } from '../../../application/useCases/CreateStagedImageVersionUseCase/CreateStagedImageVersionUseCase'
import { PromoteImageVersionUseCase } from '../../../application/useCases/PromoteImageVersionUseCase/PromoteImageVersionUseCase'
import { DeleteImageUseCase } from '../../../application/useCases/DeleteImageUseCase/DeleteImageUseCase'
import { IUserGateway } from '../../../application/acl/userManagement/IUserGateway'
import { ImageApplicationMapper } from '../../../application/mappers/ImageApplicationMapper'
import { StagedImageFactory } from '../../../application/factories/StagedImageFactory'
import { ImageLookupService } from '../../../application/services/image/ImageLookupService'
import { ImagePersistenceService } from '../../../application/services/image/ImagePersistenceService'
import { ImageFileService } from '../../../infrastructure/services/ImageFileService'
import { ImageProcessingService } from '../../../infrastructure/services/ImageProcessingService'
import { StorageKeyGenerator } from '../../../infrastructure/services/StorageKeyGenerator'
import { ImageRepository } from '../../../infrastructure/repositories/ImageRepository'
import { ImageRepositoryWithCache } from '../../../infrastructure/repositories/ImageRepositoryWithCache'
import { ImageInfrastructureMapper } from '../../../infrastructure/mappers/ImageInfrastructureMapper'
import { PersistenceHarness } from '../persistence/PersistenceHarness'
import { TestImageStorageService } from './TestImageStorageService'
import { createTestUserGateway } from './TestUserGateway'

const VERSION_RETENTION_COUNT = 3

export function createSystemWiring(persistenceHarness: PersistenceHarness, imageStorageService: TestImageStorageService) {
  const imageApplicationMapper = new ImageApplicationMapper()
  const imageRepo = new ImageRepository(
    persistenceHarness.dataAccessProvider,
    persistenceHarness.repositoryHelpers,
    persistenceHarness.transactionContext,
    new ImageInfrastructureMapper()
  )
  const repositoryCache = new TTLCache<ImageMetadataDTO>({ ttlSeconds: 60 })
  const imageRepository = new ImageRepositoryWithCache(
    imageRepo,
    repositoryCache,
    persistenceHarness.transactionContext
  )
  const unitOfWork = persistenceHarness.createUnitOfWork()
  const storageKeyGenerator = new StorageKeyGenerator()
  const imageProcessingService = new ImageProcessingService()
  const imageFileService = new ImageFileService(imageProcessingService)
  const imagePersistenceService = new ImagePersistenceService(
    imageRepository,
    imageFileService,
    imageStorageService,
    storageKeyGenerator,
    persistenceHarness.transactionContext,
    VERSION_RETENTION_COUNT,
    unitOfWork,
    imageApplicationMapper
  )
  const imageLookupService = new ImageLookupService(imageRepository, imageStorageService, imageApplicationMapper)
  const stagedImageFactory = new StagedImageFactory(storageKeyGenerator)
  const userGateway: IUserGateway = createTestUserGateway(persistenceHarness)

  return {
    persistenceHarness,
    imageRepository,
    imageStorageService,
    imagePersistenceService,
    clearRepositoryCache: () => {
      repositoryCache.invalidateByPrefix('findById:')
      repositoryCache.invalidateByPrefix('findByIdAndVersionId:')
    },
    findImageUseCase: new FindImageUseCase(imageLookupService, imageApplicationMapper, userGateway),
    createCreateStagedImageVersionUseCase: () =>
      new CreateStagedImageVersionUseCase(imagePersistenceService, stagedImageFactory, unitOfWork),
    createPromoteImageVersionUseCase: () =>
      new PromoteImageVersionUseCase(imageRepository, imagePersistenceService, imageApplicationMapper),
    createDeleteImageUseCase: () =>
      new DeleteImageUseCase(imageLookupService, imagePersistenceService, imageApplicationMapper, unitOfWork)
  }
}
