import { Base64Image, FileSize, Image, ImageCreatorId, ImageId, ImageVersionId, MimeType, CurrentImage } from '../../../domain'
import { CreatedAtTimestamp, UniqueId } from '@hatsuportal/shared-kernel'
import { UpdateImageInputDTO } from '../../dtos/UpdateImageInputDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { AuthenticationError, IUseCase, IUseCaseOptions, NotFoundError, ConcurrencyError } from '@hatsuportal/platform'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { IStorageKeyGenerator } from '../../services/IStorageKeyGenerator'
import { ImageVersion } from '../../../domain/entities/Image'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { ImageWithRelationsDTO } from '../../dtos'
import { IImagePersistenceService } from '../../services/image/ImagePersistenceService'
import { IImageLookupService } from '../../services/image/ImageLookupService'
import { IDomainEventService } from '@hatsuportal/platform/src/application/services/IDomainEventService'

export interface IUpdateImageUseCaseOptions extends IUseCaseOptions {
  updatedById: string
  updateImageInput: UpdateImageInputDTO
  imageUpdated: (updatedImage: ImageWithRelationsDTO) => void
  updateConflict: (error: ConcurrencyError<Image>) => void
}

export type IUpdateImageUseCase = IUseCase<IUpdateImageUseCaseOptions>

export class UpdateImageUseCase implements IUpdateImageUseCase {
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly imageLookupService: IImageLookupService,
    private readonly imagePersistenceService: IImagePersistenceService,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly storageKeyGenerator: IStorageKeyGenerator,
    private readonly domainEventService: IDomainEventService
  ) {}

  async execute({ updatedById, updateImageInput, imageUpdated, updateConflict }: IUpdateImageUseCaseOptions): Promise<void> {
    try {
      const { id } = updateImageInput

      const existingImage = await this.imageLookupService.findById(new ImageId(id))
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
        { isStaged: false }
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
        createdAt: new CreatedAtTimestamp(unixtimeNow())
      })
      const updatedImage = existingImage.updateWithNewCurrentVersion(newCurrentVersion, new UniqueId(updatedById))

      const updatedCurrentImage = CurrentImage.fromImageEnsuringCurrentVersion(updatedImage)
      await this.imagePersistenceService.update(updatedCurrentImage)

      const creatorLoadResult = await this.userGateway.getUserById({ userId: updatedImage.createdById.value })
      if (creatorLoadResult.isFailed()) {
        throw new AuthenticationError('Creator not found')
      }

      await this.domainEventService.persistToOutbox(updatedImage.domainEvents)

      const creator = creatorLoadResult.value
      imageUpdated(this.imageMapper.toDTOWithRelations(CurrentImage.fromImageEnsuringCurrentVersion(updatedImage), creator.name))
    } catch (error) {
      if (error instanceof ConcurrencyError) {
        updateConflict(error)
        return
      }
      throw error
    }
  }
}
