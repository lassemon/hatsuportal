import {
  Base64Image,
  FileSize,
  Image,
  ImageCreatorId,
  ImageId,
  ImageVersionId,
  MimeType,
  CurrentImage,
  IImageRepository
} from '../../../domain'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { UpdateImageInputDTO } from '../../dtos/UpdateImageInputDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import {
  AuthenticationError,
  IUseCase,
  IUseCaseOptions,
  ITransactionManager,
  ITransactionAware,
  NotFoundError,
  ConcurrencyError
} from '@hatsuportal/platform'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { IStorageKeyGenerator } from '../../services/IStorageKeyGenerator'
import { ImageVersion } from '../../../domain/entities/Image'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { ImageWithRelationsDTO } from '../../dtos'

export interface IUpdateImageUseCaseOptions extends IUseCaseOptions {
  updatedById: string // for validation decorator
  updateImageInput: UpdateImageInputDTO
  imageUpdated: (updatedImage: ImageWithRelationsDTO) => void
  updateConflict: (error: ConcurrencyError<Image>) => void
}

export type IUpdateImageUseCase = IUseCase<IUpdateImageUseCaseOptions>

export class UpdateImageUseCase implements IUpdateImageUseCase {
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly storageKeyGenerator: IStorageKeyGenerator,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>
  ) {}

  async execute({ updateImageInput, imageUpdated, updateConflict }: IUpdateImageUseCaseOptions): Promise<void> {
    try {
      const [savedImage] = await this.transactionManager.execute(async () => {
        const { id } = updateImageInput

        const existingImage = await this.imageRepository.findById(new ImageId(id))
        if (!existingImage) {
          throw new NotFoundError(`Image '${id}' not found`)
        }

        const currentImage = CurrentImage.fromImageEnsuringCurrentVersion(existingImage)

        const newVersionId = uuid()

        // ALWAYS create a new storageKey when updating an image so that:
        // 1. we never ovewrite the old image; keep history
        // 2. cache bust, new filename/version avoids stale CND content with file storage
        // 3. referential integrity: anything holding an old key wont' break
        // 4. concurrency: avoid race conditions in overwrites
        // 5. rollback: old version still exists
        const storageKey = this.storageKeyGenerator.generateStorageKey(
          currentImage.storageKey.entityType,
          currentImage.storageKey.role,
          currentImage.storageKey.ownerEntityId,
          newVersionId,
          currentImage.storageKey.createdById,
          new MimeType(updateImageInput.mimeType),
          false
        )
        const newCurrentVersion = ImageVersion.current({
          id: new ImageVersionId(newVersionId),
          imageId: existingImage.id,
          mimeType: new MimeType(updateImageInput.mimeType),
          size: new FileSize(updateImageInput.size),
          base64: Base64Image.create(updateImageInput.base64),
          storageKey: storageKey,
          isCurrent: true,
          isStaged: false,
          createdById: new ImageCreatorId(currentImage.storageKey.createdById),
          createdAt: new UnixTimestamp(unixtimeNow())
        })
        const updatedImage = existingImage.updateWithNewCurrentVersion(newCurrentVersion, true)

        const updatedCurrentImage = CurrentImage.fromImageEnsuringCurrentVersion(updatedImage)
        const savedImage = await this.imageRepository.update(updatedCurrentImage)

        return [savedImage]
      }, [this.imageRepository])

      const creatorLoadResult = await this.userGateway.getUserById({ userId: savedImage.createdById.value })
      if (creatorLoadResult.isFailed()) {
        throw new AuthenticationError('Creator not found')
      }

      const creator = creatorLoadResult.value
      imageUpdated(this.imageMapper.toDTOWithRelations(CurrentImage.fromImageEnsuringCurrentVersion(savedImage), creator.name))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
