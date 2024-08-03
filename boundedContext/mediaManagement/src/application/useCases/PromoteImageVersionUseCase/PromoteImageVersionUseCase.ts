import { CurrentImage, ImageId, ImageVersionId, IImageRepository, StagedImage } from '../../../domain'
import { IUseCase, IUseCaseOptions, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { IStorageKeyGenerator } from '../../services/IStorageKeyGenerator'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { NotFoundError } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

// TODO, use case with validation
export interface IPromoteImageVersionUseCaseOptions extends IUseCaseOptions {
  imageId: string
  stagedVersionId: string
  imagePromoted: (image: ImageDTO) => void
}

export type IPromoteImageVersionUseCase = IUseCase<IPromoteImageVersionUseCaseOptions>

export class PromoteImageVersionUseCase implements IPromoteImageVersionUseCase {
  constructor(
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>,
    private readonly storageKeyGenerator: IStorageKeyGenerator
  ) {}

  async execute({
    imageId: imageIdString,
    stagedVersionId: stagedVersionIdString,
    imagePromoted
  }: IPromoteImageVersionUseCaseOptions): Promise<void> {
    const imageId = new ImageId(imageIdString)
    const stagedVersionId = new ImageVersionId(stagedVersionIdString)

    const [savedImage] = await this.transactionManager.execute(async () => {
      const image = await this.imageRepository.findByIdAndVersionId(imageId, stagedVersionId)
      if (!image) {
        throw new NotFoundError(
          `Cannot promote image '${imageId.value}' of staged version '${stagedVersionId.value}' because it does not exist.`
        )
      }

      if (!image.isStaged) return [image] // idempotent

      const stagedImage = StagedImage.fromImageEnsuringStagedVersion(image, stagedVersionId)

      const storageKey = this.storageKeyGenerator.generateStorageKey(
        stagedImage.storageKey.entityType,
        stagedImage.storageKey.role,
        stagedImage.storageKey.ownerEntityId,
        stagedImage.storageKey.versionId,
        stagedImage.storageKey.createdById,
        stagedImage.mimeType,
        false
      )

      image.promoteToCurrent(stagedVersionId, storageKey)

      const savedImage = await this.imageRepository.update(CurrentImage.fromImageEnsuringCurrentVersion(image))

      return [savedImage]
    }, [this.imageRepository])

    imagePromoted(this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(savedImage)))
  }
}
