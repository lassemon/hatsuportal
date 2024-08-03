import { ITransactionContext, ICache } from '@hatsuportal/platform'
import { Image, ImageId, ImageVersionId, StagedImage, CurrentImage } from '../../domain'
import { IImageRepository, ImageCleanupCandidate, StagedImageVersionIdentifier } from '../../application'
import { ImageMetadataDTO } from '../../application/dtos/ImageMetadataDTO'
import { ImagePromotionLockDTO } from '../../application/dtos/ImagePromotionLockDTO'

/** Read-through cache wrapper for {@link IImageRepository} metadata lookups. */
export class ImageRepositoryWithCache implements IImageRepository {
  constructor(
    private readonly baseRepo: IImageRepository,
    private readonly cache: ICache<ImageMetadataDTO>,
    private readonly transactionContext: ITransactionContext
  ) {}

  private isInActiveTransaction(): boolean {
    const scope = this.transactionContext.getScope()
    return scope !== undefined && scope.state === 'active'
  }

  async findById(imageId: ImageId): Promise<ImageMetadataDTO | null> {
    if (this.isInActiveTransaction()) {
      // A story/image save may still be in flight — use the database, not a cached copy that could be stale.
      return await this.baseRepo.findById(imageId)
    }

    const key = `findById:${imageId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findById(imageId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async findByIdAndVersionId(imageId: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null> {
    if (this.isInActiveTransaction()) {
      // A story/image save may still be in flight — use the database, not a cached copy that could be stale.
      return await this.baseRepo.findByIdAndVersionId(imageId, versionId)
    }

    const key = `findByIdAndVersionId:${imageId.value}:${versionId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findByIdAndVersionId(imageId, versionId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async findAllCleanupCandidates(): Promise<ImageCleanupCandidate[]> {
    return await this.baseRepo.findAllCleanupCandidates()
  }

  async findAllStorageKeys(): Promise<string[]> {
    return await this.baseRepo.findAllStorageKeys()
  }

  async findStagedStorageKeys(imageId: ImageId): Promise<string[]> {
    return await this.baseRepo.findStagedStorageKeys(imageId)
  }

  async insertStaged(image: StagedImage): Promise<StagedImageVersionIdentifier> {
    if (this.isInActiveTransaction()) {
      // Save not finished yet — do not refresh the cache until we know this change will stick.
      return await this.baseRepo.insertStaged(image)
    }

    const result = await this.baseRepo.insertStaged(image)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.imageId.value}:`)
    return result
  }

  async insertCurrent(image: CurrentImage): Promise<ImageMetadataDTO> {
    if (this.isInActiveTransaction()) {
      // Save not finished yet — do not refresh the cache until we know this change will stick.
      return await this.baseRepo.insertCurrent(image)
    }

    const result = await this.baseRepo.insertCurrent(image)
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
    return result
  }

  async rollbackCurrentVersion(image: CurrentImage): Promise<void> {
    if (this.isInActiveTransaction()) {
      // Save not finished yet — do not refresh the cache until we know this change will stick.
      await this.baseRepo.rollbackCurrentVersion(image)
      return
    }

    await this.baseRepo.rollbackCurrentVersion(image)
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
  }

  async pruneOldVersions(imageId: string, retainCount: number): Promise<string[]> {
    if (this.isInActiveTransaction()) {
      // Save not finished yet — do not refresh the cache until we know this change will stick.
      return await this.baseRepo.pruneOldVersions(imageId, retainCount)
    }

    const result = await this.baseRepo.pruneOldVersions(imageId, retainCount)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${imageId}:`)
    return result
  }

  async delete(image: Image): Promise<string[]> {
    if (this.isInActiveTransaction()) {
      // Save not finished yet — do not refresh the cache until we know this change will stick.
      return await this.baseRepo.delete(image)
    }

    const result = await this.baseRepo.delete(image)
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
    return result
  }

  async findByIdAndVersionIdForUpdate(imageId: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null> {
    return await this.baseRepo.findByIdAndVersionIdForUpdate(imageId, versionId)
  }

  async findPromotionLockForUpdate(imageId: ImageId, stagedVersionId: ImageVersionId): Promise<ImagePromotionLockDTO | null> {
    return await this.baseRepo.findPromotionLockForUpdate(imageId, stagedVersionId)
  }

  async savePromotedImage(image: Image): Promise<void> {
    await this.baseRepo.savePromotedImage(image)
    // Cover promotion finishes with a cached read — drop old entries so we do not serve the staged version.
    // always invalidate cache here to not leave stale entries in the cache after promotion
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
  }
}
