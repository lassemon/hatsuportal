import { CurrentImage, ImageId, IImageRepository } from '../../../domain'
import { IImageApplicationMapper } from '../../mappers/ImageApplicationMapper'
import { AuthenticationError, NotFoundError } from '@hatsuportal/platform'
import { IUseCase, IUseCaseOptions } from '@hatsuportal/platform'
import { ImageWithRelationsDTO } from '../../dtos'
import { IUserGateway } from '../../acl/userManagement/IUserGateway'

export interface IFindImageUseCaseOptions extends IUseCaseOptions {
  imageId: string
  imageFound: (image: ImageWithRelationsDTO) => void
}

export type IFindImageUseCase = IUseCase<IFindImageUseCaseOptions>

export class FindImageUseCase implements IFindImageUseCase {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly imageMapper: IImageApplicationMapper,
    private readonly userGateway: IUserGateway
  ) {}

  async execute({ imageId, imageFound }: IFindImageUseCaseOptions): Promise<void> {
    const image = await this.imageRepository.findById(new ImageId(imageId))
    if (!image || !image.storageKey) {
      throw new NotFoundError(`Image metadata for ${imageId} was NotFound from the database.`)
    }

    const creatorLoadResult = await this.userGateway.getUserById({ userId: image.createdById.value })
    if (creatorLoadResult.isFailed()) {
      throw new AuthenticationError('Creator not found')
    }

    const creator = creatorLoadResult.value
    imageFound(this.imageMapper.toDTOWithRelations(CurrentImage.fromImageEnsuringCurrentVersion(image), creator.name))
  }
}
