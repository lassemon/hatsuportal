import {
  IHttpClientFactory,
  IImageService,
  ILocalStorageService,
  IProfileService,
  IStoryService,
  IUserService,
  IImageViewModelMapper,
  IUserViewModelMapper,
  IStoryViewModelMapper,
  IProfileViewModelMapper,
  IDataServiceFactory,
  ITagService,
  ITagViewModelMapper,
  IPostService
} from 'application/interfaces'
import { StoryService } from './data/StoryService'
import { UserService } from './data/UserService'
import { ImageService } from './data/ImageService'
import { ProfileService } from './data/ProfileService'
import { StoryViewModelDTO } from 'ui/features/post/story/viewModels/StoryViewModel'
import { TagService } from './data/TagService'
import { IPostViewModelMapper } from 'application/interfaces/http/mappers/IPostViewModelMapper'
import { PostService } from './data/PostService'

export class DataServiceFactory implements IDataServiceFactory {
  constructor(
    private readonly httpClientFactory: IHttpClientFactory,
    private readonly userViewModelMapper: IUserViewModelMapper,
    private readonly storyViewModelMapper: IStoryViewModelMapper,
    private readonly imageViewModelMapper: IImageViewModelMapper,
    private readonly profileViewModelMapper: IProfileViewModelMapper,
    private readonly storyLocalStorage: ILocalStorageService<StoryViewModelDTO>,
    private readonly tagViewModelMapper: ITagViewModelMapper,
    private readonly postViewModelMapper: IPostViewModelMapper
  ) {}

  createUserService(): IUserService {
    return new UserService(this.httpClientFactory.createUserHttpClient(), this.userViewModelMapper)
  }

  createPostService(): IPostService {
    return new PostService(this.httpClientFactory.createPostHttpClient(), this.postViewModelMapper)
  }

  createStoryService(): IStoryService {
    return new StoryService(this.httpClientFactory.createStoryHttpClient(), this.storyViewModelMapper, this.storyLocalStorage)
  }

  createImageService(): IImageService {
    return new ImageService(this.httpClientFactory.createImageHttpClient(), this.imageViewModelMapper)
  }

  createProfileService(): IProfileService {
    return new ProfileService(this.httpClientFactory.createProfileHttpClient(), this.profileViewModelMapper)
  }

  createTagService(): ITagService {
    return new TagService(this.httpClientFactory.createTagHttpClient(), this.tagViewModelMapper)
  }
}
