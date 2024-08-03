import { NonEmptyString } from '@hatsuportal/shared-kernel'
import { Image, ImageId, ImageVersionId } from '../../../domain'
import { IImageRepository } from '../../repositories/IImageRepository'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IImageStorageService } from '../IImageStorageService'

export interface IImageLookupService {
  findById(id: ImageId): Promise<Image | null>
  findByIdAndVersionId(id: ImageId, versionId: ImageVersionId): Promise<Image | null>
}

export class ImageLookupService implements IImageLookupService {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageStorageService: IImageStorageService,
    private readonly imageApplicationMapper: IImageApplicationMapper
  ) {}

  async findById(id: ImageId): Promise<Image | null> {
    const image = await this.imageRepository.findById(id)

    if (!image) return null

    const base64 = await this.imageStorageService.getImage(new NonEmptyString(image.storageKey))
    return this.imageApplicationMapper.toDomainEntity(image, base64)
  }

  async findByIdAndVersionId(id: ImageId, versionId: ImageVersionId): Promise<Image | null> {
    const image = await this.imageRepository.findByIdAndVersionId(id, versionId)

    if (!image) return null

    const base64 = await this.imageStorageService.getImage(new NonEmptyString(image.storageKey))
    return this.imageApplicationMapper.toDomainEntity(image, base64)
  }
}
