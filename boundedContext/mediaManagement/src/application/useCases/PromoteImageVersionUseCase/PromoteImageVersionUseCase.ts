import { CurrentImage, ImageId, ImageVersionId, StagedImage } from '../../../domain'
import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { IStorageKeyGenerator } from '../../services/IStorageKeyGenerator'
import { ImageDTO } from '../../dtos/ImageDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { NotFoundError } from '@hatsuportal/platform'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { IImageLookupService } from '../../services/image/ImageLookupService'
import { IDomainEventService } from '@hatsuportal/platform/src/application/services/IDomainEventService'

export interface IPromoteImageVersionUseCaseOptions extends IUseCaseOptions {
  promotedById: string
  imageId: string
  stagedVersionId: string
  imagePromoted: (image: ImageDTO) => void
}

export type IPromoteImageVersionUseCase = IUseCase<IPromoteImageVersionUseCaseOptions>

export class PromoteImageVersionUseCase implements IPromoteImageVersionUseCase {
  constructor(
    private readonly imageLookupService: IImageLookupService,
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly domainEventService: IDomainEventService,
    private readonly storageKeyGenerator: IStorageKeyGenerator
  ) {}

  async execute({
    promotedById,
    imageId: imageIdString,
    stagedVersionId: stagedVersionIdString,
    imagePromoted
  }: IPromoteImageVersionUseCaseOptions): Promise<void> {
    const imageId = new ImageId(imageIdString)
    const stagedVersionId = new ImageVersionId(stagedVersionIdString)

    const image = await this.imageLookupService.findByIdAndVersionId(imageId, stagedVersionId)
    if (!image) {
      throw new NotFoundError(
        `Cannot promote image '${imageId.value}' of staged version '${stagedVersionId.value}' because it does not exist.`
      )
    }

    if (!image.isStaged) {
      // idempotent no-op
      imagePromoted(this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(image)))
      return
    }

    const stagedImage = StagedImage.fromImageEnsuringStagedVersion(image, stagedVersionId)

    const storageKey = this.storageKeyGenerator.generateStorageKey(
      stagedImage.storageKey.entityType,
      stagedImage.storageKey.role,
      stagedImage.storageKey.ownerEntityId,
      stagedImage.storageKey.versionId,
      stagedImage.storageKey.createdById,
      stagedImage.mimeType,
      { isStaged: false }
    )

    image.promoteToCurrentSilently(stagedVersionId, storageKey)

    await this.domainEventService.persistToOutbox(image.domainEvents)

    const savedImage = await this.imagePersistenceService.update(CurrentImage.fromImageEnsuringCurrentVersion(image))

    imagePromoted(this.imageMapper.toDTO(CurrentImage.fromImageEnsuringCurrentVersion(savedImage)))
  }
}
