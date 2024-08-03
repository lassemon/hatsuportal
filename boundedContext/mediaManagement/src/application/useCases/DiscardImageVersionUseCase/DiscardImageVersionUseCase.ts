import { IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/platform'
import { ImageId, ImageVersionId } from '../../../domain'
import { IImageLookupService } from '../../services/image/ImageLookupService'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { Logger } from '@hatsuportal/common'

export interface IDiscardImageVersionUseCaseOptions extends IUseCaseOptions {
  discardedById: string
  imageId: string
  stagedVersionId: string
  imageDiscarded: () => void
}

const logger = new Logger('DiscardImageVersionUseCase')

export type IDiscardImageVersionUseCase = IUseCase<IDiscardImageVersionUseCaseOptions>

export class DiscardImageVersionUseCase implements IDiscardImageVersionUseCase {
  constructor(
    private readonly imageLookupService: IImageLookupService,
    private readonly imagePersistenceService: IImagePersistenceService
  ) {}

  async execute({
    discardedById,
    imageId: imageIdString,
    stagedVersionId: stagedVersionIdString,
    imageDiscarded
  }: IDiscardImageVersionUseCaseOptions): Promise<void> {
    const imageId = new ImageId(imageIdString)
    const stagedVersionId = new ImageVersionId(stagedVersionIdString)

    const currentImageVersion = await this.imageLookupService.findByIdAndVersionId(imageId, stagedVersionId)

    if (!currentImageVersion) {
      throw new NotFoundError(
        `Cannot discard image '${imageId.value}' of staged version '${stagedVersionId.value}' because it does not exist.`
      )
    }

    if (!currentImageVersion.isStaged) {
      imageDiscarded() // idempotent no-op
      return
    }

    logger.debug(`User ${discardedById} is discarding staged version ${stagedVersionId.value} for image ${imageId.value}`)

    await this.imagePersistenceService.discardStaged({ imageId, stagedVersionId })

    currentImageVersion.discardStagedVersionSilently(stagedVersionId)

    imageDiscarded()
  }
}
