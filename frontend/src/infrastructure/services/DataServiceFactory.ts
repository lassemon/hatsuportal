import { IStoryPresentationMapper, StoryPresentationDTO } from '@hatsuportal/presentation-post'
import { IUserPresentationMapper, IProfilePresentationMapper } from '@hatsuportal/presentation-user'
import { IHttpClientFactory, IImageService, ILocalStorageService, IProfileService, IStoryService, IUserService } from 'application'
import { IDataServiceFactory } from 'application/factories/IDataServiceFactory'
import { StoryService } from './data/StoryService'
import { UserService } from './data/UserService'
import { ImageService } from './data/ImageService'
import { ProfileService } from './data/ProfileService'
import { IImagePresentationMapper } from '@hatsuportal/presentation-common'

export class DataServiceFactory implements IDataServiceFactory {
  constructor(
    private readonly httpClientFactory: IHttpClientFactory,
    private readonly userPresentationMapper: IUserPresentationMapper,
    private readonly storyPresentationMapper: IStoryPresentationMapper,
    private readonly imagePresentationMapper: IImagePresentationMapper,
    private readonly profilePresentationMapper: IProfilePresentationMapper,
    private readonly localStorageStoryService: ILocalStorageService<StoryPresentationDTO>
  ) {}

  createUserService(): IUserService {
    return new UserService(this.httpClientFactory.createUserHttpClient(), this.userPresentationMapper)
  }

  createStoryService(): IStoryService {
    return new StoryService(this.httpClientFactory.createStoryHttpClient(), this.storyPresentationMapper, this.localStorageStoryService)
  }

  createImageService(): IImageService {
    return new ImageService(this.httpClientFactory.createImageHttpClient(), this.imagePresentationMapper)
  }

  createProfileService(): IProfileService {
    return new ProfileService(this.httpClientFactory.createProfileHttpClient(), this.profilePresentationMapper)
  }
}
