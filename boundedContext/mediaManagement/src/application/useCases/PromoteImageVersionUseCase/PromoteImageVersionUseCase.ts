import { ImageId, ImageVersionId } from '../../../domain'
import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { IImageRepository } from '../../repositories/IImageRepository'

export interface IPromoteImageVersionUseCaseOptions extends IUseCaseOptions {
  promotedById: string
  imageId: string
  stagedVersionId: string
  imagePromoted: (image: ImageDTO) => void
}

export type IPromoteImageVersionUseCase = IUseCase<IPromoteImageVersionUseCaseOptions>

export class PromoteImageVersionUseCase implements IPromoteImageVersionUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly imageMapper: IImageApplicationMapper
  ) {}

  async execute({
    imageId: imageIdString,
    stagedVersionId: stagedVersionIdString,
    imagePromoted
  }: IPromoteImageVersionUseCaseOptions): Promise<void> {
    const imageId = new ImageId(imageIdString)
    const stagedVersionId = new ImageVersionId(stagedVersionIdString)

    const existingMetadata = await this.imageRepository.findByIdAndVersionId(imageId, stagedVersionId)
    if (!existingMetadata) {
      throw new NotFoundError(
        `Cannot promote image '${imageId.value}' of staged version '${stagedVersionId.value}' because it does not exist.`
      )
    }

    await this.imagePersistenceService.promoteStagedVersion(imageId, stagedVersionId)

    const promotedMetadata = await this.imageRepository.findByIdAndVersionId(imageId, stagedVersionId)
    if (!promotedMetadata) {
      throw new NotFoundError(
        `Cannot promote image '${imageId.value}' of staged version '${stagedVersionId.value}' because it does not exist.`
      )
    }

    imagePromoted(this.imageMapper.toDTOFromMetadata(promotedMetadata))
  }
}
