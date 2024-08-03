import { User } from '@hatsuportal/domain'
import { Controller } from 'tsoa'
import { UseCaseFactory } from '../infrastructure/services/UseCaseFactory'
import {
  ImageApplicationMapper,
  ImageMetadataApplicationMapper,
  StoryApplicationMapper,
  IUseCaseFactory,
  UserApplicationMapper,
  AuthenticationError
} from '@hatsuportal/application'
import { ImageMetadataInfrastructureMapper, StoryInfrastructureMapper, UserService } from '@hatsuportal/infrastructure'
import {
  Authorization,
  ImageMetadataRepository,
  ImageProcessingService,
  ImageService,
  ImageStorageService,
  StoryRepository,
  UserRepository
} from '/infrastructure'
import { TsoaRequest } from '/presentation/api/requests/TsoaRequest'

export class RootController extends Controller {
  useCaseFactory: IUseCaseFactory
  constructor() {
    super()

    const userRepository = new UserRepository()

    this.useCaseFactory = new UseCaseFactory(
      userRepository,
      new UserApplicationMapper(),
      new UserService(userRepository),
      new StoryRepository(new StoryInfrastructureMapper()),
      new StoryApplicationMapper(),
      new ImageMetadataRepository(new ImageMetadataInfrastructureMapper()),
      new ImageService(new ImageProcessingService(), new ImageStorageService()),
      new ImageStorageService(),
      new ImageApplicationMapper(),
      new ImageMetadataApplicationMapper(),
      new Authorization()
    )
  }

  validateAuthentication(request: TsoaRequest): asserts request is TsoaRequest & { user: User } {
    if (!request.user || !request?.isAuthenticated()) {
      throw new AuthenticationError('Must be logged in to do that.')
    }
  }
}
