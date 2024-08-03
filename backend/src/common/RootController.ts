import { User } from '@hatsuportal/domain'
import { Controller } from 'tsoa'
import { UseCaseFactory } from '/services/UseCaseFactory'
import {
  ImageApplicationMapper,
  ImageMetadataApplicationMapper,
  StoryApplicationMapper,
  IUseCaseFactory,
  UserApplicationMapper,
  AuthenticationError
} from '@hatsuportal/application'
import { ImageMetadataInfrastructureMapper, StoryInfrastructureMapper, UserService } from '@hatsuportal/infrastructure'
import UserRepository from '/user/UserRepository'
import StoryRepository from '/story/StoryRepository'
import ImageMetadataRepository from '/image/ImageMetadataRepository'
import { ImageService } from '/image/services/ImageService'
import { ImageStorageService } from '/image/services/ImageStorageService'
import { ImageProcessingService } from '/image/services/ImageProcessingService'
import { TsoaRequest } from './TsoaRequest'
import Authorization from '/auth/Authorization'

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
