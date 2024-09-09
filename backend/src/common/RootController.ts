import { ApiError, User } from '@hatsuportal/domain'
import { Controller } from 'tsoa'
import { TsoaRequest } from './entities/TsoaRequest'
import { UseCaseFactory } from '/service/UseCaseFactory'
import { IUseCaseFactory } from '@hatsuportal/application'
import { ImageMapper, ItemMapper, UserMapper, UserService } from '@hatsuportal/infrastructure'
import UserRepository from '/user/UserRepository'
import ItemRepository from '/item/ItemRepository'
import ImageMetadataRepository from '/image/ImageMetadataRepository'
import { ImageService } from '/image/services/ImageService'
import { ImageStorageService } from '/image/services/ImageStorageService'
import { ImageProcessingService } from '/image/services/ImageProcessingService'

export class RootController extends Controller {
  useCaseFactory: IUseCaseFactory
  constructor() {
    super()

    const userRepository = new UserRepository()
    const itemMapper = new ItemMapper()
    const imageMapper = new ImageMapper()

    this.useCaseFactory = new UseCaseFactory(
      userRepository,
      new UserMapper(),
      new UserService(userRepository),
      new ItemRepository(itemMapper),
      itemMapper,
      new ImageMetadataRepository(imageMapper),
      new ImageService(new ImageProcessingService(), new ImageStorageService()),
      new ImageStorageService(),
      imageMapper
    )
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new ApiError(401, 'Unauthorized', 'Must be logged in to do that.')
    }
  }
}
