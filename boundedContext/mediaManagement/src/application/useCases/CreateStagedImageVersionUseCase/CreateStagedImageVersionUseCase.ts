import { Base64Image, FileSize, ImageCreatorId, ImageId, ImageVersionId, MimeType, IImageRepository, StagedImage } from '../../../domain'
import { CreateImageInputDTO } from '../../dtos/CreateImageInputDTO'
import { IStorageKeyGenerator } from '../../services/IStorageKeyGenerator'
import { IUseCase, IUseCaseOptions, ITransactionManager, ITransactionAware } from '@hatsuportal/platform'
import { uuid } from '@hatsuportal/common'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'

export interface ICreateStagedImageVersionUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createImageInput: CreateImageInputDTO
  imageCreated: (imageId: string, stagedVersionId: string) => void
}

export type ICreateStagedImageVersionUseCase = IUseCase<ICreateStagedImageVersionUseCaseOptions>

export class CreateStagedImageVersionUseCase implements ICreateStagedImageVersionUseCase {
  public constructor(
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>,
    private readonly storageKeyGenerator: IStorageKeyGenerator
  ) {}

  public async execute({ createdById, createImageInput, imageCreated }: ICreateStagedImageVersionUseCaseOptions): Promise<void> {
    const imageId = uuid()
    const versionId = uuid()

    const [] = await this.transactionManager.execute(async () => {
      /**
       * ownerEntityType, role and ownerEntityId are here for infrastructure (storage) concerns only.
       * They are not given to the StagedImage on purpose.
       * The image does not need to be aware of the owning entity here,
       * there will be a separate linking table for each entity that owns an image,
       * e.g. post_image_links.
       */
      const { ownerEntityType, role, ownerEntityId, mimeType, size, base64 } = createImageInput

      const storageKey = this.storageKeyGenerator.generateStorageKey(
        ownerEntityType,
        role,
        ownerEntityId,
        versionId,
        createdById,
        new MimeType(mimeType),
        { isStaged: true }
      )

      const stagedImage = StagedImage.createNewFrom({
        imageId: new ImageId(imageId),
        stagedVersionId: new ImageVersionId(versionId),
        storageKey: storageKey,
        mimeType: new MimeType(mimeType),
        size: new FileSize(size),
        base64: Base64Image.create(base64),
        createdById: new ImageCreatorId(createdById)
      })
      await this.imageRepository.insertStaged(stagedImage)

      return [] // return no domain event holders to trigger transaction manager to commit the transaction
    }, [this.imageRepository])

    imageCreated(imageId, versionId)
  }
}
