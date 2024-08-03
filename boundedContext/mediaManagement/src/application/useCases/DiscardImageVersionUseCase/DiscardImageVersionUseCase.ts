import { ITransactionManager, IUseCase, IUseCaseOptions, NotFoundError } from '@hatsuportal/foundation'
import { ImageVersionId } from '../../../domain/valueObjects/ImageVersionId'
import { IImageRepository } from '../../repositories/IImageRepository'
import { ImageId } from '../../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface IDiscardImageVersionUseCaseOptions extends IUseCaseOptions {
  imageId: string
  stagedVersionId: string
  imageDiscarded: () => void
}

// TODO, use case with validation
export type IDiscardImageVersionUseCase = IUseCase<IDiscardImageVersionUseCaseOptions>

export class DiscardImageVersionUseCase implements IDiscardImageVersionUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>
  ) {}

  async execute({
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

      return [currentImageVersion]
    }, [this.imageRepository])

    imageDiscarded()
  }
}
