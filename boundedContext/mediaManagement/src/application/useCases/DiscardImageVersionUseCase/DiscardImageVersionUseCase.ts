import { IUseCase, IUseCaseOptions, NotFoundError, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { ImageId, IImageRepository, ImageVersionId } from '../../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IDiscardImageVersionUseCaseOptions extends IUseCaseOptions {
  discardedById: string
  imageId: string
  stagedVersionId: string
  imageDiscarded: () => void
}

export type IDiscardImageVersionUseCase = IUseCase<IDiscardImageVersionUseCaseOptions>

export class DiscardImageVersionUseCase implements IDiscardImageVersionUseCase {
  constructor(
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>
  ) {}

  async execute({
    discardedById,
    imageId: imageIdString,
    stagedVersionId: stagedVersionIdString,
    imageDiscarded
  }: IDiscardImageVersionUseCaseOptions): Promise<void> {
    const imageId = new ImageId(imageIdString)
    const stagedVersionId = new ImageVersionId(stagedVersionIdString)

    await this.transactionManager.execute(async () => {
      const currentImageVersion = await this.imageRepository.findByIdAndVersionId(imageId, stagedVersionId)

      if (!currentImageVersion) {
        throw new NotFoundError(
          `Cannot discard image '${imageId.value}' of staged version '${stagedVersionId.value}' because it does not exist.`
        )
      }

      if (!currentImageVersion.isStaged) return [currentImageVersion] // idempotent no-op

      await this.imageRepository.discardStagedVersion({ imageId, stagedVersionId })

      currentImageVersion.discardStagedVersion(discardedById, stagedVersionId)

      return [currentImageVersion]
    }, [this.imageRepository])

    imageDiscarded()
  }
}
