import { ITransaction, ITransactionAware } from '@hatsuportal/platform'
import { IImageRepository, Image, ImageId, ImageVersionId, StagedImage, StagedImageVersionIdentifier, CurrentImage } from '../../domain'

export class ImageRepositoryWithCache implements IImageRepository, ITransactionAware {
  constructor(
    private readonly baseRepo: IImageRepository & ITransactionAware,
    private readonly cache: Map<string, Image | null>
  ) {}

  async findById(imageId: ImageId): Promise<Image | null> {
    const key = `findById:${imageId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findById(imageId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async findByIdAndVersionId(imageId: ImageId, versionId: ImageVersionId): Promise<Image | null> {
    const key = `findByIdAndVersionId:${imageId.value}:${versionId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findByIdAndVersionId(imageId, versionId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async insertStaged(image: StagedImage): Promise<StagedImageVersionIdentifier> {
    return await this.baseRepo.insertStaged(image)
  }

  async insertCurrent(image: CurrentImage): Promise<Image> {
    return await this.baseRepo.insertCurrent(image)
  }

  async update(image: CurrentImage): Promise<Image> {
    return await this.baseRepo.update(image)
  }

  async discardStagedVersion({ imageId, stagedVersionId }: StagedImageVersionIdentifier): Promise<void> {
    return await this.baseRepo.discardStagedVersion({ imageId, stagedVersionId })
  }

  async delete(image: Image): Promise<Image> {
    return await this.baseRepo.delete(image)
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
