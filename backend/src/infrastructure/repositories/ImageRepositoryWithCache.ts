import { ITransaction } from '@hatsuportal/common-bounded-context'
import { Image, ImageId, IImageRepository } from '@hatsuportal/common-bounded-context'

export class ImageRepositoryWithCache implements IImageRepository {
  constructor(private readonly baseRepo: IImageRepository, private readonly cache: Map<string, Image | null>) {}

  async findById(imageId: ImageId): Promise<Image | null> {
    const key = `findById:${imageId.value}`
    if (!this.cache.has(key)) {
      const image = await this.baseRepo.findById(imageId)
      this.cache.set(key, image)
    }
    return this.cache.get(key) || null
  }

  async insert(image: Image): Promise<Image> {
    return await this.baseRepo.insert(image)
  }

  async update(image: Image): Promise<Image> {
    return await this.baseRepo.update(image)
  }

  async delete(image: Image): Promise<void> {
    await this.baseRepo.delete(image)
  }

  setTransaction(transaction: ITransaction): void {
    this.baseRepo.setTransaction(transaction)
  }

  clearLastLoadedMap(): void {
    this.baseRepo.clearLastLoadedMap()
  }
}
