import { IUserService, IStoryService, IImageService, IProfileService, IPreferencesService, IPostService, ITagService } from 'application/interfaces'

export interface IDataServiceFactory {
  createUserService(): IUserService
  createPostService(): IPostService
  createStoryService(): IStoryService
  createImageService(): IImageService
  createProfileService(): IProfileService
  createPreferencesService(): IPreferencesService
  createTagService(): ITagService
}
