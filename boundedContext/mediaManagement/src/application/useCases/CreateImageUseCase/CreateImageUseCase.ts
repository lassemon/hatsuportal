import { AuthenticationError, ITransactionManager } from '@hatsuportal/platform'
import { ITransactionAware } from '@hatsuportal/platform'
import { unixtimeNow, uuid } from '@hatsuportal/common'
import { CreateImageInputDTO } from '../../dtos/CreateImageInputDTO'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { CurrentImage, IImageRepository, Base64Image, FileSize, ImageCreatorId, ImageId, ImageVersionId, MimeType } from '../../../domain'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'
import { IStorageKeyGenerator } from '../../services/IStorageKeyGenerator'
import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { UnixTimestamp } from '@hatsuportal/shared-kernel'
import { ImageWithRelationsDTO } from '../../dtos'

export interface ICreateImageUseCaseOptions extends IUseCaseOptions {
  createdById: string
  createImageInput: CreateImageInputDTO
  imageCreated: (createImage: ImageWithRelationsDTO) => void
}

export type ICreateImageUseCase = IUseCase<ICreateImageUseCaseOptions>

export class CreateImageUseCase implements ICreateImageUseCase {
  constructor(
    private readonly userGateway: IUserGateway,
    private readonly imageRepository: IImageRepository & ITransactionAware,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly storageKeyGenerator: IStorageKeyGenerator,
    private readonly transactionManager: ITransactionManager<ImageId, UnixTimestamp>
  ) {}

  async execute({ createdById, createImageInput, imageCreated }: ICreateImageUseCaseOptions): Promise<void> {
    const creatorLoadResult = await this.userGateway.getUserById({ userId: createdById })
    if (creatorLoadResult.isFailed()) throw new AuthenticationError('Not logged in.')

    const imageId = uuid()
    const versionId = uuid()

    const storageKey = this.storageKeyGenerator.generateStorageKey(
      createImageInput.ownerEntityType,
      createImageInput.role,
      createImageInput.ownerEntityId,
      versionId,
      createdById,
      new MimeType(createImageInput.mimeType),
      false
    )

    const [savedImage] = await this.transactionManager.execute(async () => {
      const image = CurrentImage.createNewFrom({
        imageId: new ImageId(imageId),
        versionId: new ImageVersionId(versionId),
        storageKey: storageKey,
        mimeType: new MimeType(createImageInput.mimeType),
        size: new FileSize(createImageInput.size),
        base64: Base64Image.create(createImageInput.base64),
        createdById: new ImageCreatorId(createdById),
        createdAt: new UnixTimestamp(unixtimeNow())
      })

      return [await this.imageRepository.insertCurrent(image)]
    }, [this.imageRepository])

    const creator = creatorLoadResult.value
    imageCreated(this.imageMapper.toDTOWithRelations(CurrentImage.fromImageEnsuringCurrentVersion(savedImage), creator.name))
  }
}
