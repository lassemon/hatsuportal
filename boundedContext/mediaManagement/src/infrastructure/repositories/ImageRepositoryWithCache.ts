import { ITransaction, ITransactionAware, ICache } from '@hatsuportal/platform'
import { Image, ImageId, ImageVersionId, StagedImage, CurrentImage } from '../../domain'
import { IImageRepository, StagedImageVersionIdentifier } from '../../application'
import { ImageMetadataDTO } from '../../application/dtos/ImageMetadataDTO'
import { ImageVersionMetadataDTO } from '../../application/dtos/ImageVersionMetadataDTO'

export class ImageRepositoryWithCache implements IImageRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: IImageRepository & ITransactionAware,
    private readonly cache: ICache<ImageMetadataDTO>
  ) {}

  async findById(imageId: ImageId): Promise<ImageMetadataDTO | null> {
    const key = `findById:${imageId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findById(imageId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async findByIdAndVersionId(imageId: ImageId, versionId: ImageVersionId): Promise<ImageMetadataDTO | null> {
    const key = `findByIdAndVersionId:${imageId.value}:${versionId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findByIdAndVersionId(imageId, versionId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async findAllStorageKeys(): Promise<string[]> {
    return await this.baseRepo.findAllStorageKeys()
  }

  async findStagedStorageKeys(imageId: ImageId): Promise<string[]> {
    return await this.baseRepo.findStagedStorageKeys(imageId)
  }

  async insertStaged(image: StagedImage): Promise<StagedImageVersionIdentifier> {
    const result = await this.baseRepo.insertStaged(image)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.imageId.value}:`) // safety valve, should not exist on insert
    return result
  }

  async insertCurrent(image: CurrentImage): Promise<ImageMetadataDTO> {
    const result = await this.baseRepo.insertCurrent(image)
    // unlike staged, current can exist in insert, these cache clears are important
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
    return result
  }

  async rollbackCurrentVersion(image: CurrentImage): Promise<void> {
    await this.baseRepo.rollbackCurrentVersion(image)
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
  }

  async pruneOldVersions(imageId: string, retainCount: number): Promise<string[]> {
    const result = await this.baseRepo.pruneOldVersions(imageId, retainCount)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${imageId}:`)
    return result
  }

  async update(image: CurrentImage): Promise<ImageMetadataDTO> {
    const result = await this.baseRepo.update(image)
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
    return result
  }

  async discardStagedVersion({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<ImageVersionMetadataDTO> {
    const result = await this.baseRepo.discardStagedVersion({ imageId, stagedVersionId })
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${imageId.value}:`)
    return result
  }

  async delete(image: Image): Promise<string[]> {
    const result = await this.baseRepo.delete(image)
    this.cache.delete(`findById:${image.id.value}`)
    this.cache.invalidateByPrefix(`findByIdAndVersionId:${image.id.value}:`)
    return result
  }

  getTableName(): string {
    return this.baseRepo.getTableName()
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}
